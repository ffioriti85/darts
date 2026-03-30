"use client";

import { formatShootingPace, type TrainingSessionRow } from "@/lib/types/session";

type SessionSummaryCardProps = {
  session: TrainingSessionRow;
  highlight?: boolean;
};

function sessionDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * One row card for the results history list.
 *
 * Args:
 *   session: Row from API.
 *   highlight: Emphasize best-accuracy row.
 *
 * Returns:
 *   Card UI.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function SessionSummaryCard({
  session,
  highlight,
}: SessionSummaryCardProps) {
  const pace =
    session.shooting_pace_seconds != null
      ? formatShootingPace(session.shooting_pace_seconds)
      : "—";

  return (
    <article
      className={[
        "rounded-2xl border px-4 py-4",
        highlight
          ? "border-amber-500/60 bg-amber-950/25"
          : "border-zinc-800 bg-zinc-900/40",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-100">
          {sessionDateLabel(session.started_at)}
        </h3>
        {session.ended_at ? (
          <span className="text-xs text-zinc-500">Completed</span>
        ) : (
          <span className="text-xs text-amber-400">Open</span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <dt className="text-zinc-500">Throws</dt>
          <dd className="font-mono text-lg text-zinc-100">{session.total_throws}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Hits</dt>
          <dd className="font-mono text-lg text-emerald-400">{session.total_hits}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Misses</dt>
          <dd className="font-mono text-lg text-rose-400">{session.total_misses}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Accuracy</dt>
          <dd className="font-mono text-lg text-amber-300">
            {session.accuracy.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Pace</dt>
          <dd className="font-mono text-lg text-sky-300">{pace}</dd>
        </div>
      </dl>
    </article>
  );
}
