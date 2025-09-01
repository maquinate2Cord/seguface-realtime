import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim()),
  simulator: {
    enabled: process.env.SIMULATOR_ENABLED === 'true',
    users: parseInt(process.env.SIMULATOR_USERS || '50', 10),
    emitMs: parseInt(process.env.SIMULATOR_EMIT_MS || '700', 10)
  }
} as const;