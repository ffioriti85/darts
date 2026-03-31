import type { ThrowRow } from "@/lib/types/session";

export type RoundHitPoint = {
  /** Seconds from session start (last throw in round). */
  timeSec: number;
  /** Hits scored in that round (0 … dartsPerRound). */
  hitsInRound: number;
  isWarmUp: boolean;
  roundIndex: number;
};

/**
 * Groups ordered throws into rounds and builds one point per round (time vs hits in round).
 *
 * Args:
 *   throws: Rows with throw_number, is_hit, is_warm_up, created_at.
 *   sessionStartedAt: Session start ISO.
 *   dartsPerRound: Darts per round for this session.
 *
 * Returns:
 *   Points sorted by time.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   Pure function.
 */
export function buildRoundHitSeries(
  throws: ThrowRow[],
  sessionStartedAt: string,
  dartsPerRound: number,
): RoundHitPoint[] {
  const d = Math.max(1, dartsPerRound);
  const startMs = new Date(sessionStartedAt).getTime();
  const sorted = [...throws].sort((a, b) => a.throw_number - b.throw_number);
  const rounds: ThrowRow[][] = [];
  for (let i = 0; i < sorted.length; i += d) {
    rounds.push(sorted.slice(i, i + d));
  }

  const maxThrowNum =
    sorted.length > 0 ? sorted[sorted.length - 1].throw_number : 1;

  return rounds.map((roundThrows, idx) => {
    const last = roundThrows[roundThrows.length - 1];
    let timeSec: number;
    if (last.created_at) {
      const t = new Date(last.created_at).getTime();
      timeSec = Math.max(0, (t - startMs) / 1000);
    } else {
      // Fallback when created_at missing: spread by throw index (degraded).
      timeSec = ((last.throw_number - 1) / Math.max(1, maxThrowNum)) * 60;
    }
    const hitsInRound = roundThrows.filter((t) => t.is_hit).length;
    const isWarmUp = Boolean(roundThrows[0]?.is_warm_up);
    return {
      timeSec,
      hitsInRound,
      isWarmUp,
      roundIndex: idx + 1,
    };
  });
}
