export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  simulator: {
    enabled: (process.env.SIMULATOR_ENABLED ?? "true") === "true",
    users: Number(process.env.SIMULATOR_USERS ?? 50),
    emitMs: Number(process.env.SIMULATOR_EMIT_MS ?? 800),
  },
  thresholds: {
    highRiskScore: Number(process.env.HIGH_RISK_SCORE ?? 60),
  },
  auth: {
    enabled: (process.env.DASH_AUTH_ENABLED ?? "false") === "true",
    key: (process.env.DASH_AUTH_KEY ?? "")
  }
};


