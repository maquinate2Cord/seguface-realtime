import { EventEmitter } from 'node:events';
import type { LeanState } from './types.js';
export const bus = new EventEmitter();
// Eventos: 'score' -> payload: LeanState
// Simple event bus
