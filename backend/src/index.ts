import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { StatusCodes } from 'http-status-codes';
import { config } from './config.js';
import { getTop, toLean, upsertScore } from './store.js';
import { scoreDelta } from './scoring.js';
import type { Telemetry, LeanState } from './types.js';
import { bus } from './bus.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.corsOrigin } });

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/scores', (_req, res) => res.json({ items: getTop(200).map(toLean) }));

app.post('/ingest', (req, res) => {
  const body = req.body as { items?: Telemetry[] };
  if (!body?.items?.length) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'items[] requerido' });

  for (const t of body.items) {
    const state = upsertScore(t.userId, scoreDelta(t), t);
    const lean = toLean(state);
    // Seguridad adicional: garantizar serializable
    JSON.stringify(lean);
    io.emit('score:update', { type: 'score:update', state: lean });
  }
  return res.status(StatusCodes.ACCEPTED).json({ ok: true, updated: body.items.length });
});

io.on('connection', (socket) => {
  socket.emit('bootstrap', { items: getTop(200).map(toLean) });
});

// Reenvío de simulador vía bus (payload ya viene lean)
bus.on('score', (lean: LeanState) => {
  io.emit('score:update', { type: 'score:update', state: lean });
});

server.listen(config.port, () => {
  console.log(`Seguface backend running on http://localhost:${config.port}`);
  if (config.simulator.enabled) import('./simulator.js');
});