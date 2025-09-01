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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.corsOrigin } });

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.status(StatusCodes.OK).json({ ok: true, ts: Date.now() }));
app.get("/scores", (_req, res) => res.json({ items: getTop(500).map(toLean) }));

// === Metrics (portfolio)
app.get("/metrics", (_req, res) => {
  const scores = getTop(500);
  return res.json({ metrics: computePortfolioMetrics(scores) });
});

// === Analytics (buckets + top risk)
app.get("/analytics", (_req, res) => {
  const scores = getTop(500);
  return res.json({ analytics: portfolioAnalytics(scores) });
});

// === Claims
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
  if (!Number.isFinite(days) || days <= 0) {
    return res.json({ items: getAllClaims() });
  }
  return res.json({ items: getRecentClaims(days) });
});

app.post("/claims", (req, res) => {
  const parsed = claimSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: parsed.error.flatten() });
  }
  const saved = addClaim(parsed.data);
  return res.status(StatusCodes.CREATED).json({ item: saved });
});

// === Socket.IO bootstrap + streams
io.on("connection", (socket) => {
  socket.emit("bootstrap", { items: getTop(200).map(toLean) });
});

// bridge bus → io
bus.on("score", (lean: LeanState) => {
  io.emit("score:update", { type: "score:update", state: lean });
});
bus.on("risk", (evt: { userId: string; ts: number; type: string; lat: number; lng: number; severity: number }) => {
  incEvents(evt.userId);
  io.emit("risk:event", { event: evt });
});

server.listen(config.port, () => {
  console.log(`Seguface backend running on http://localhost:${config.port}`);
  if (config.simulator.enabled) import("./simulator");
});

