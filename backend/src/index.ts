import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { StatusCodes } from "http-status-codes";
import { config } from "./config.js";
import { getTop, toLean, incEvents } from "./store.js";
import type { LeanState } from "./types.js";
import { bus } from "./bus.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.corsOrigin } });

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.status(StatusCodes.OK).json({ ok: true, ts: Date.now() }));
app.get("/scores", (_req, res) => res.json({ items: getTop(200).map(toLean) }));

io.on("connection", (socket) => {
  socket.emit("bootstrap", { items: getTop(200).map(toLean) });
});

// Reenvío del simulador (vía bus) a los clientes Socket.IO
bus.on("score", (lean: LeanState) => {
  io.emit("score:update", { type: "score:update", state: lean });
});
bus.on("risk", (evt: { userId: string; ts: number; type: string; lat: number; lng: number; severity: number }) => {
  incEvents(evt.userId); // reflejar eventos en tabla
  io.emit("risk:event", { event: evt });
});

server.listen(config.port, () => {
  console.log(`Seguface backend running on http://localhost:${config.port}`);
  if (config.simulator.enabled) import("./simulator.js");
});
