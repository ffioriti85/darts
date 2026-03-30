const PREFIX = "darts-draft-v1";

/**
 * Builds the localStorage key for in-progress dart toggles.
 *
 * Args:
 *   sessionId: UUID of the training session.
 *
 * Returns:
 *   Storage key string.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function sessionDraftKey(sessionId: string): string {
  return `${PREFIX}:${sessionId}`;
}

/**
 * Reads saved dart states from localStorage (browser only).
 *
 * Args:
 *   sessionId: Session id.
 *   expectedLength: Must match darts_per_round or returns null.
 *
 * Returns:
 *   boolean array or null if missing/invalid.
 *
 * Side Effects:
 *   Reads localStorage.
 *
 * Concurrency Notes:
 *   Single-tab optimistic; concurrent tabs may overwrite.
 */
export function loadSessionDraft(
  sessionId: string,
  expectedLength: number,
): boolean[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sessionDraftKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== expectedLength) return null;
    if (parsed.some((x) => typeof x !== "boolean")) return null;
    return parsed as boolean[];
  } catch {
    return null;
  }
}

/**
 * Persists dart toggle state for refresh recovery.
 *
 * Args:
 *   sessionId: Session id.
 *   hits: Current round booleans.
 *
 * Returns:
 *   void.
 *
 * Side Effects:
 *   Writes localStorage.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function saveSessionDraft(sessionId: string, hits: boolean[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(sessionDraftKey(sessionId), JSON.stringify(hits));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Clears draft after a successful round save.
 *
 * Args:
 *   sessionId: Session id.
 *
 * Returns:
 *   void.
 *
 * Side Effects:
 *   Removes localStorage key.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function clearSessionDraft(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(sessionDraftKey(sessionId));
  } catch {
    /* ignore */
  }
}
