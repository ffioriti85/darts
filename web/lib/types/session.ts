export type TrainingSessionRow = {
  id: string;
  user_id: string;
  darts_per_round: number;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
  total_throws: number;
  total_hits: number;
  total_misses: number;
  accuracy: number;
  /** Seconds per throw: (ended_at - started_at) / total_throws when session is completed. */
  shooting_pace_seconds?: number | null;
};

export function computeAccuracyPct(hits: number, throws: number): number {
  if (throws <= 0) return 0;
  return Math.round((hits / throws) * 1000) / 10;
}

/**
 * Formats shooting pace (seconds per throw) for display.
 *
 * Args:
 *   secondsPerThrow: Stored pace or null if N/A.
 *
 * Returns:
 *   Human-readable string (e.g. "4.2 s/shot") or em dash.
 */
export function formatShootingPace(secondsPerThrow: number | null): string {
  if (secondsPerThrow == null || !Number.isFinite(secondsPerThrow) || secondsPerThrow <= 0) {
    return "—";
  }
  return `${secondsPerThrow.toFixed(1)} s/shot`;
}
