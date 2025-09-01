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
