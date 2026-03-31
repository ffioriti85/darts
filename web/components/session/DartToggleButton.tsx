"use client";

export type SessionPhase = "warmup" | "training";

type DartToggleButtonProps = {
  index: number;
  isHit: boolean;
  onToggle: () => void;
  disabled?: boolean;
  phase?: SessionPhase;
};

/**
 * Large hit/miss toggle for one dart in the current round.
 *
 * Args:
 *   index: 1-based label.
 *   isHit: Current state (true = hit).
 *   onToggle: Tap handler.
 *   disabled: When saving or session locked.
 *   phase: Warm-up (amber/slate) vs training (emerald) styling.
 *
 * Returns:
 *   Accessible button element.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   Stateless presentation.
 */
export function DartToggleButton({
  index,
  isHit,
  onToggle,
  disabled,
  phase = "training",
}: DartToggleButtonProps) {
  const hitCls =
    phase === "warmup"
      ? "border-amber-500/80 bg-amber-950/50 text-amber-200"
      : "border-emerald-500/80 bg-emerald-950/60 text-emerald-300";
  const missCls =
    phase === "warmup"
      ? "border-slate-600 bg-slate-900/80 text-slate-400"
      : "border-zinc-600 bg-zinc-900/80 text-zinc-400";
  const labelCls = phase === "warmup" ? "text-slate-500" : "text-zinc-500";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={[
        "flex min-h-[5.5rem] flex-1 flex-col items-center justify-center rounded-2xl border-2 text-xl font-bold transition active:scale-[0.98] disabled:opacity-50",
        isHit ? hitCls : missCls,
      ].join(" ")}
      aria-pressed={isHit}
      aria-label={`Dart ${index}, ${isHit ? "hit" : "miss"}`}
    >
      <span className={`text-sm font-medium ${labelCls}`}>Dart {index}</span>
      <span className="mt-1 text-3xl leading-none">{isHit ? "🎯" : "❌"}</span>
      <span className="mt-1 text-xs uppercase tracking-wide">
        {isHit ? "Hit" : "Miss"}
      </span>
    </button>
  );
}
