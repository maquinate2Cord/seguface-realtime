import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { bus } from "./bus.js";
import { getAllScores } from "./store.js";
import { computeMetrics } from "./scoring.js";

const app = express();
app.use(cors({ origin: config.corsOrigin || "*" }));
app.use(express.json());

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Scores crudos
app.get("/scores", (_req, res) => res.json({ items: getAllScores() }));

// Métricas calculadas
app.get("/metrics", (_req, res) => {
  const m = computeMetrics(getAllScores());
  res.json({ metrics: m });
});

// Dashboard data (para Fase 4)
app.get("/dashboard", (_req, res) => {
  const scores = getAllScores();
  const metrics = computeMetrics(scores);

  // Dataset ejemplo: siniestros por mes (mock temporal)
  const trend = [
    { name: "Enero", siniestros: 12 },
    { name: "Febrero", siniestros: 9 },
    { name: "Marzo", siniestros: 15 },
  ];

  // Distribución de scores
  const distribution = [
    { name: "Baja", value: scores.filter(s => s.value < 30).length },
    { name: "Media", value: scores.filter(s => s.value >= 30 && s.value < 70).length },
    { name: "Alta", value: scores.filter(s => s.value >= 70).length },
  ];

  res.json({
    metrics,
    trend,
    distribution,
    scores, // tabla completa
  });
});

// Socket.IO para eventos en tiempo real
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.corsOrigin || "*" },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Reenviar eventos del bus al cliente
  bus.on("riskEvent", (event) => {
    socket.emit("riskEvent", event);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = config.port || 4000;
server.listen(PORT, () => {
  console.log(`Seguface backend escuchando en http://localhost:${PORT}`);
});
