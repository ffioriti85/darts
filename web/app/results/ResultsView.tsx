"use client";

import { useMemo } from "react";
import { SessionSummaryCard } from "@/components/session/SessionSummaryCard";
import type { TrainingSessionRow } from "@/lib/types/session";

type ResultsViewProps = {
  sessions: TrainingSessionRow[];
  highlightSessionId?: string | null;
};

function dateKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Groups completed/open sessions by calendar day and highlights best accuracy.
 *
 * Args:
 *   sessions: Rows from the server.
 *   highlightSessionId: Optional id to emphasize (e.g. just-ended session).
 *
 * Returns:
 *   Stacked sections per day.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export default function ResultsView({
  sessions,
  highlightSessionId,
}: ResultsViewProps) {
  const bestId = useMemo(() => {
    let best: TrainingSessionRow | null = null;
    for (const s of sessions) {
      if (s.total_throws === 0) continue;
      if (!best || s.accuracy > best.accuracy) best = s;
    }
    return best?.id ?? null;
  }, [sessions]);

  const grouped = useMemo(() => {
    const map = new Map<string, TrainingSessionRow[]>();
    for (const s of sessions) {
      const k = dateKey(s.started_at);
      const arr = map.get(k) ?? [];
      arr.push(s);
      map.set(k, arr);
    }
    return Array.from(map.entries());
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-zinc-400">
        No sessions yet. Start one from the home screen.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {grouped.map(([label, rows]) => (
        <section key={label}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            {label}
          </h2>
          <ul className="flex flex-col gap-3">
            {rows.map((s) => (
              <li key={s.id}>
                <SessionSummaryCard
                  session={s}
                  highlight={
                    Boolean(bestId && s.id === bestId) ||
                    Boolean(highlightSessionId && s.id === highlightSessionId)
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
