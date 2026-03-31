/**
 * Helpers for 1-based round index and warm-up vs training phase.
 */

/**
 * Current round number (1-based) given throws already persisted for the session.
 *
 * Args:
 *   totalThrowsPersisted: Count of throws in DB for this session.
 *   dartsPerRound: Darts per round (>= 1).
 *
 * Returns:
 *   Round index for the round the user is currently filling (first round = 1).
 */
export function currentRoundNumber(
  totalThrowsPersisted: number,
  dartsPerRound: number,
): number {
  const d = Math.max(1, dartsPerRound);
  return Math.floor(totalThrowsPersisted / d) + 1;
}

/**
 * Whether the session is still in the warm-up phase for the current round.
 *
 * Args:
 *   totalThrowsPersisted: Throws in DB (completed rounds only until next save).
 *   dartsPerRound: Darts per round.
 *   warmUpRounds: Configured warm-up round count (0 = none).
 *
 * Returns:
 *   true if current round is still within warm-up.
 */
export function isWarmUpPhase(
  totalThrowsPersisted: number,
  dartsPerRound: number,
  warmUpRounds: number,
): boolean {
  if (warmUpRounds <= 0) return false;
  const round = currentRoundNumber(totalThrowsPersisted, dartsPerRound);
  return round <= warmUpRounds;
}
