"use client";

type DartToggleButtonProps = {
  index: number;
  isHit: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

/**
 * Large hit/miss toggle for one dart in the current round.
 *
 * Args:
 *   index: 1-based label.
 *   isHit: Current state (true = hit).
 *   onToggle: Tap handler.
 *   disabled: When saving or session locked.
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
}: DartToggleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={[
        "flex min-h-[5.5rem] flex-1 flex-col items-center justify-center rounded-2xl border-2 text-xl font-bold transition active:scale-[0.98] disabled:opacity-50",
        isHit
          ? "border-emerald-500/80 bg-emerald-950/60 text-emerald-300"
          : "border-zinc-600 bg-zinc-900/80 text-zinc-400",
      ].join(" ")}
      aria-pressed={isHit}
      aria-label={`Dart ${index}, ${isHit ? "hit" : "miss"}`}
    >
      <span className="text-sm font-medium text-zinc-500">Dart {index}</span>
      <span className="mt-1 text-3xl leading-none">{isHit ? "🎯" : "❌"}</span>
      <span className="mt-1 text-xs uppercase tracking-wide">
        {isHit ? "Hit" : "Miss"}
      </span>
    </button>
  );
}
