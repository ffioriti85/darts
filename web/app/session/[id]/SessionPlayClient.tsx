"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DartToggleButton } from "@/components/session/DartToggleButton";
import { RoundControls } from "@/components/session/RoundControls";
import { SessionTimer } from "@/components/session/SessionTimer";
import {
  clearSessionDraft,
  loadSessionDraft,
  saveSessionDraft,
} from "@/lib/session_draft";
import type { TrainingSessionRow } from "@/lib/types/session";
import { currentRoundNumber, isWarmUpPhase } from "@/lib/training_round";

type Props = {
  initialSession: TrainingSessionRow;
};

/**
 * Mobile-first active session: elapsed timer, round counter, phase styling, dart toggles.
 * Aggregates stay hidden until /results.
 *
 * Args:
 *   initialSession: Server-loaded row (must be open session).
 *
 * Returns:
 *   Full-page client experience.
 *
 * Side Effects:
 *   Calls REST APIs; writes localStorage draft.
 *
 * Concurrency Notes:
 *   Disables buttons while `busy` to limit duplicate submissions.
 */
export default function SessionPlayClient({ initialSession }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<TrainingSessionRow>(initialSession);
  const [hits, setHits] = useState<boolean[]>(() =>
    Array.from({ length: initialSession.darts_per_round }, () => false),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // total throw count persisted in DB (including warm-up throws).
  // Used for round counter + warm-up palette switching (warm-up must not be ignored).
  const [persistedThrowsCount, setPersistedThrowsCount] = useState<number>(
    () => Math.max(0, initialSession.total_throws),
  );

  const warmUpRounds = session.warm_up_rounds ?? 0;
  const darts = session.darts_per_round;

  useEffect(() => {
    // Lightweight one-time load: used to correct counter/phase after reloads.
    // It runs once per page load to keep the session UI responsive.
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/sessions/${initialSession.id}/throws`);
      if (!res.ok) return;
      const json = (await res.json().catch(() => null)) as
        | { throws?: unknown[] }
        | null;
      const len = Array.isArray(json?.throws) ? json.throws.length : null;
      if (len != null && !cancelled) setPersistedThrowsCount(len);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSession.id]);

  const phase = useMemo(() => {
    return isWarmUpPhase(persistedThrowsCount, darts, warmUpRounds)
      ? ("warmup" as const)
      : ("training" as const);
  }, [persistedThrowsCount, darts, warmUpRounds]);

  const currentRound = useMemo(() => {
    return currentRoundNumber(persistedThrowsCount, darts);
  }, [persistedThrowsCount, darts]);

  const counterDenom = Math.max(1, warmUpRounds);
  const counterNum = phase === "warmup" ? currentRound : currentRound - warmUpRounds;
  const counterNumClamped = Math.max(1, counterNum);
  const counterText =
    phase === "warmup" && warmUpRounds > 0
      ? `${counterNumClamped} / ${counterDenom}`
      : `${counterNumClamped}`;

  useEffect(() => {
    const draft = loadSessionDraft(initialSession.id, initialSession.darts_per_round);
    if (draft) setHits(draft);
  }, [initialSession.id, initialSession.darts_per_round]);

  useEffect(() => {
    saveSessionDraft(initialSession.id, hits);
  }, [initialSession.id, hits]);

  const toggleDart = useCallback((i: number) => {
    setHits((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }, []);

  const postRound = useCallback(async (): Promise<boolean> => {
    const res = await fetch(`/api/sessions/${session.id}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hits }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Could not save round");
      return false;
    }
    const data = (await res.json()) as { session: TrainingSessionRow };
    setSession(data.session);
    // Optimistically advance local persisted throw count for instant counter updates.
    setPersistedThrowsCount((c) => c + darts);
    setError(null);
    return true;
  }, [darts, hits, session.id]);

  const handleNewRound = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await postRound();
      if (!ok) return;
      clearSessionDraft(session.id);
      setHits(Array.from({ length: session.darts_per_round }, () => false));
    } finally {
      setBusy(false);
    }
  }, [postRound, session.darts_per_round, session.id]);

  const handleEndSession = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const r1 = await fetch(`/api/sessions/${session.id}/round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hits }),
      });
      if (!r1.ok) {
        const ended = (await r1.json().catch(() => ({}))) as { error?: string };
        const msg = ended.error ?? "";
        const alreadyEnded =
          r1.status === 400 && msg.toLowerCase().includes("ended");
        if (!alreadyEnded) {
          setError(msg || "Could not save final round");
          return;
        }
      } else {
        const data = (await r1.json()) as { session: TrainingSessionRow };
        setSession(data.session);
        setPersistedThrowsCount((c) => c + darts);
      }

      const r2 = await fetch(`/api/sessions/${session.id}`, { method: "PATCH" });
      if (!r2.ok) {
        const j = (await r2.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Could not end session");
        return;
      }
      clearSessionDraft(session.id);
      router.push(`/results?ended=${session.id}`);
    } finally {
      setBusy(false);
    }
  }, [darts, hits, router, session.id]);

  const shellCls =
    phase === "warmup"
      ? "bg-slate-950 text-slate-100"
      : "bg-emerald-950 text-emerald-50";

  return (
    <div className={`flex min-h-full flex-1 flex-col transition-colors duration-500 ${shellCls}`}>
      <AppHeader title="Active session" showBack phase={phase} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
        {error ? (
          <p
            className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <SessionTimer startedAtIso={session.started_at} phase={phase} />

        <div className="text-center">
          <p
            className={[
              "mt-2 font-mono font-bold tabular-nums",
              "text-4xl sm:text-5xl",
              phase === "warmup"
                ? "text-amber-200/90"
                : "text-emerald-200/90",
            ].join(" ")}
            aria-live="polite"
          >
            {counterText}
          </p>
        </div>

        <section aria-label="Current round">
          <h2
            className={
              phase === "warmup"
                ? "mb-3 text-center text-sm font-medium uppercase tracking-widest text-slate-500"
                : "mb-3 text-center text-sm font-medium uppercase tracking-widest text-emerald-600/80"
            }
          >
            This round
          </h2>
          <div className="flex gap-3">
            {hits.map((isHit, i) => (
              <DartToggleButton
                key={i}
                index={i + 1}
                isHit={isHit}
                disabled={busy}
                phase={phase}
                onToggle={() => toggleDart(i)}
              />
            ))}
          </div>
        </section>

        <div className="mt-auto pb-6">
          <RoundControls
            busy={busy}
            phase={phase}
            onNewRound={handleNewRound}
            onEndSession={handleEndSession}
          />
        </div>
      </main>
    </div>
  );
}
