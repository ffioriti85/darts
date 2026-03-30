"use client";

type StatsDisplayProps = {
  totalThrows: number;
  totalHits: number;
  totalMisses: number;
  accuracyPct: number;
};

/**
 * Live session aggregates for the active training view.
 *
 * Args:
 *   totalThrows, totalHits, totalMisses, accuracyPct: Cumulative stats (accuracy 0–100).
 *
 * Returns:
 *   Compact stat grid.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function StatsDisplay({
  totalThrows,
  totalHits,
  totalMisses,
  accuracyPct,
}: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Throws" value={totalThrows} />
      <Stat label="Hits" value={totalHits} accent="text-emerald-400" />
      <Stat label="Misses" value={totalMisses} accent="text-rose-400" />
      <Stat
        label="Accuracy"
        value={`${accuracyPct.toFixed(1)}%`}
        accent="text-amber-300"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-zinc-100",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-center">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}
