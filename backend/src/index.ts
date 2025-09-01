import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { config } from "./config";
import { getTop, toLean, incEvents } from "./store";
import type { LeanState } from "./types";
import { bus } from "./bus";

import { computePortfolioMetrics } from "./metrics";
import { portfolioAnalytics } from "./analytics";
import { addClaim, getAllClaims, getRecentClaims } from "./claims";
import { getSimConfig, updateSimConfig, resetSimConfig } from "./scoring";

import { addRiskEvent } from "./events_store";
import { computePercentiles, eventsHeatmap } from "./analytics2";
import { qualityMetrics } from "./quality";
import { pushAlert, getRecentAlerts, ackAlert } from "./alerts";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.corsOrigin } });

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/** Health & Scores */
app.get("/health", (_req, res) => res.status(StatusCodes.OK).json({ ok: true, ts: Date.now() }));
app.get("/scores", (_req, res) => res.json({ items: getTop(500).map(toLean) }));

/** Portfolio Metrics */
app.get("/metrics", (_req, res) => {
  const scores = getTop(500);
  res.json({ metrics: computePortfolioMetrics(scores) });
});

/** Analytics */
app.get("/analytics", (_req, res) => {
  const scores = getTop(500);
  res.json({ analytics: portfolioAnalytics(scores) });
});

/** Portfolio - Percentiles (sobre snapshot actual) */
app.get("/portfolio/percentiles", (_req, res) => {
  const values = getTop(1000).map((s) => s.score);
  const pct = computePercentiles(values);
  res.json({ percentiles: pct });
});

/** Events Heatmap (7x24) */
app.get("/events/heatmap", (req, res) => {
  const days = Math.max(1, Math.min(30, Number(req.query.days ?? 7)));
  res.json({ matrix: eventsHeatmap(days) });
});

/** Quality metrics (ventana reciente) */
app.get("/quality/metrics", (req, res) => {
  const minutes = Math.max(1, Math.min(360, Number(req.query.minutes ?? 60)));
  res.json({ quality: qualityMetrics(minutes) });
});

/** Claims */
const claimSchema = z.object({
  userId: z.string(),
  ts: z.number().optional(),
  type: z.string().optional(),
  severity: z.number().int().min(1).max(5).optional(),
  amountUsd: z.number().nonnegative().optional(),
  status: z.enum(["open", "investigating", "approved", "rejected", "paid", "closed"]).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  description: z.string().optional(),
});

app.get("/claims", (req, res) => {
  const days = Number(req.query.days ?? 30);
  if (!Number.isFinite(days) || days <= 0) return res.json({ items: getAllClaims() });
  return res.json({ items: getRecentClaims(days) });
});

app.post("/claims", (req, res) => {
  const parsed = claimSchema.safeParse(req.body);
  if (!parsed.success) return res.status(StatusCodes.BAD_REQUEST).json({ error: parsed.error.flatten() });
  const saved = addClaim(parsed.data);
  return res.status(StatusCodes.CREATED).json({ item: saved });
});

/** Sim Config (runtime tuning) */
const simPatchSchema = z.object({
  targetScore: z.number().min(0).max(100).optional(),
  kPull: z.number().min(0).max(1).optional(),
  noiseStd: z.number().min(0).max(5).optional(),
  maxDeltaUp: z.number().min(0).max(10).optional(),
  maxDeltaDown: z.number().min(-10).max(0).optional(),
  coolDownMs: z.number().int().min(0).max(600000).optional(),
  prob: z.object({
    overSpeed: z.number().min(0).max(1).optional(),
    hardBrake: z.number().min(0).max(1).optional(),
    hardAccel: z.number().min(0).max(1).optional(),
  }).partial().optional(),
}).partial();

app.get("/sim-config", (_req, res) => {
  res.json({ config: getSimConfig() });
});

app.patch("/sim-config", (req, res) => {
  const parsed = simPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(StatusCodes.BAD_REQUEST).json({ error: parsed.error.flatten() });
  const cfg = updateSimConfig(parsed.data);
  return res.json({ config: cfg });
});

app.post("/sim-config/reset", (_req, res) => {
  const cfg = resetSimConfig();
  return res.json({ config: cfg });
});

/** Alerts (sev >= 4) */
app.get("/alerts/recent", (req, res) => {
  const minutes = Math.max(1, Math.min(120, Number(req.query.minutes ?? 15)));
  res.json({ items: getRecentAlerts(minutes) });
});

app.post("/alerts/ack", (req, res) => {
  const id = String(req.body?.id ?? "");
  if (!id) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "missing id" });
  const ok = ackAlert(id);
  return res.json({ ok });
});

/** Socket.IO bootstrap + streams */
io.on("connection", (socket) => {
  socket.emit("bootstrap", { items: getTop(200).map(toLean) });
});

// bridge bus → io (+ almacenar eventos y alertas)
bus.on("score", (lean: LeanState) => {
  io.emit("score:update", { type: "score:update", state: lean });
});
bus.on("risk", (evt: { userId: string; ts: number; type: "overSpeed" | "hardBrake" | "hardAccel"; lat: number; lng: number; severity: number }) => {
  incEvents(evt.userId);
  addRiskEvent(evt);
  if (evt.severity >= 4) pushAlert(evt);
  io.emit("risk:event", { event: evt });
});

server.listen(config.port, () => {
  console.log(`Seguface backend running on http://localhost:${config.port}`);
  if (config.simulator.enabled) import("./simulator");
});