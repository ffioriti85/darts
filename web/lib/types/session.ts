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
};

export function computeAccuracyPct(hits: number, throws: number): number {
  if (throws <= 0) return 0;
  return Math.round((hits / throws) * 1000) / 10;
}
