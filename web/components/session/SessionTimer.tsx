"use client";

import { useEffect, useState } from "react";

type SessionTimerProps = {
  startedAtIso: string;
};

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Elapsed time since session start, updating every second (count-up).
 *
 * Args:
 *   startedAtIso: Session start timestamp (ISO).
 *
 * Returns:
 *   JSX timer display.
 *
 * Side Effects:
 *   Subscribes to 1s interval.
 *
 * Concurrency Notes:
 *   Client-only; uses device clock.
 */
export function SessionTimer({ startedAtIso }: SessionTimerProps) {
  const startMs = new Date(startedAtIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedSec = Math.max(0, Math.floor((now - startMs) / 1000));

  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
        Elapsed
      </p>
      <p
        className="mt-1 font-mono text-5xl font-bold tabular-nums text-emerald-400 sm:text-6xl"
        aria-live="polite"
      >
        {formatElapsed(elapsedSec)}
      </p>
    </div>
  );
}
