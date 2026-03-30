"use client";

type RoundControlsProps = {
  onNewRound: () => void;
  onEndSession: () => void;
  busy?: boolean;
};

/**
 * Primary actions during an active session (large tap targets).
 *
 * Args:
 *   onNewRound: Commits the current round and resets the board.
 *   onEndSession: Ends session and navigates away.
 *   busy: Disables buttons while a network request runs.
 *
 * Returns:
 *   Two stacked full-width buttons.
 *
 * Side Effects:
 *   None (delegates to parents).
 *
 * Concurrency Notes:
 *   Parent should debounce / disable to prevent double submits.
 */
export function RoundControls({
  onNewRound,
  onEndSession,
  busy,
}: RoundControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={onNewRound}
        className="min-h-14 w-full rounded-2xl bg-emerald-600 px-4 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60"
      >
        New Round
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onEndSession}
        className="min-h-12 w-full rounded-2xl border border-zinc-600 bg-zinc-900 px-4 py-3 text-base font-medium text-zinc-200 transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60"
      >
        End Session
      </button>
    </div>
  );
}
