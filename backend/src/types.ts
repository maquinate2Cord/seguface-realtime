export type Telemetry = {
  userId: string;
  ts: number;
  speedKph: number;
  rpm: number;
  throttle: number;
  accel: number;
  brake: number;
  lat: number;
  lng: number;
};

export type ScoreState = {
  userId: string;
  score: number;
  lastTs: number;
  events: number;
  last: Telemetry | null;
};

export type LeanState = {
  userId: string;
  score: number;
  lastTs: number;
  events: number;
};

export type RiskEvent = {
  userId: string;
  ts: number;
  type: "overSpeed" | "hardBrake" | "hardAccel";
  lat: number;
  lng: number;
  severity: number; // 1..5
};

export type Claim = {
  id: string;
  userId: string;
  ts: number;
  type?: string;            // p.ej. "collision" | "theft" | ...
  severity?: number;        // 1..5
  amountUsd?: number;
  status?: "open" | "investigating" | "approved" | "rejected" | "paid" | "closed";
  lat?: number;
  lng?: number;
  description?: string;
};

