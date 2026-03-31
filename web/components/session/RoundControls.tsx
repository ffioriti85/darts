"use client";

import type { SessionPhase } from "@/components/session/DartToggleButton";

type RoundControlsProps = {
  onNewRound: () => void;
  onEndSession: () => void;
  busy?: boolean;
  phase?: SessionPhase;
};

/**
 * Primary actions during an active session (large tap targets).
 *
 * Args:
 *   onNewRound: Commits the current round and resets the board.
 *   onEndSession: Ends session and navigates away.
 *   busy: Disables buttons while a network request runs.
 *   phase: Warm-up vs training button styling.
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
  phase = "training",
}: RoundControlsProps) {
  const primaryCls =
    phase === "warmup"
      ? "bg-amber-600 shadow-amber-900/30 hover:bg-amber-500"
      : "bg-emerald-600 shadow-emerald-900/30 hover:bg-emerald-500";
  const secondaryCls =
    phase === "warmup"
      ? "border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
      : "border-zinc-600 bg-zinc-900 text-zinc-200 hover:bg-zinc-800";

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={onNewRound}
        className={`min-h-14 w-full rounded-2xl px-4 py-4 text-lg font-semibold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-60 ${primaryCls}`}
      >
        New Round
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onEndSession}
        className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-base font-medium transition active:scale-[0.99] disabled:opacity-60 ${secondaryCls}`}
      >
        End Session
      </button>
    </div>
  );
}
