"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DartToggleButton } from "@/components/session/DartToggleButton";
import { RoundControls } from "@/components/session/RoundControls";
import { SessionTimer } from "@/components/session/SessionTimer";
import { StatsDisplay } from "@/components/session/StatsDisplay";
import {
  clearSessionDraft,
  loadSessionDraft,
  saveSessionDraft,
} from "@/lib/session_draft";
import { computeAccuracyPct } from "@/lib/types/session";
import type { TrainingSessionRow } from "@/lib/types/session";

type Props = {
  initialSession: TrainingSessionRow;
};

function playTimerEndCue(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([120, 60, 120]);
  }
}

/**
 * Mobile-first active session UI: timer, dart toggles, round + end controls.
 *
 * Args:
 *   initialSession: Server-loaded row (must be open session).
 *
 * Returns:
 *   Full-page client experience.
 *
 * Side Effects:
 *   Calls REST APIs; writes localStorage draft; optional audio/vibration.
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

  useEffect(() => {
    const draft = loadSessionDraft(initialSession.id, initialSession.darts_per_round);
    if (draft) setHits(draft);
  }, [initialSession.id, initialSession.darts_per_round]);

  useEffect(() => {
    saveSessionDraft(initialSession.id, hits);
  }, [initialSession.id, hits]);

  const accuracyLive = useMemo(
    () => computeAccuracyPct(session.total_hits, session.total_throws),
    [session.total_hits, session.total_throws],
  );

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
    setError(null);
    return true;
  }, [hits, session.id]);

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
  }, [hits, router, session.id]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader title="Active session" showBack />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
        {error ? (
          <p
            className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <SessionTimer
          startedAtIso={session.started_at}
          durationMinutes={session.duration_minutes}
          onEnterOvertime={playTimerEndCue}
        />

        <StatsDisplay
          totalThrows={session.total_throws}
          totalHits={session.total_hits}
          totalMisses={session.total_misses}
          accuracyPct={accuracyLive}
        />

        <section aria-label="Current round">
          <h2 className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-zinc-500">
            This round
          </h2>
          <div className="flex gap-3">
            {hits.map((isHit, i) => (
              <DartToggleButton
                key={i}
                index={i + 1}
                isHit={isHit}
                disabled={busy}
                onToggle={() => toggleDart(i)}
              />
            ))}
          </div>
        </section>

        <div className="mt-auto pb-6">
          <RoundControls
            busy={busy}
            onNewRound={handleNewRound}
            onEndSession={handleEndSession}
          />
        </div>
      </main>
    </div>
  );
}
