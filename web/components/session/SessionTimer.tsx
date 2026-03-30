"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SessionTimerProps = {
  startedAtIso: string;
  durationMinutes: number;
  onEnterOvertime?: () => void;
};

function formatMmSs(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Countdown from session start + duration; shows overtime when past zero.
 *
 * Args:
 *   startedAtIso: Session start timestamp (ISO).
 *   durationMinutes: Planned length in minutes.
 *   onEnterOvertime: Fires once when crossing into overtime (sound/haptics).
 *
 * Returns:
 *   JSX timer display.
 *
 * Side Effects:
 *   Subscribes to 1s interval; optional callback once.
 *
 * Concurrency Notes:
 *   Client-only; uses device clock.
 */
export function SessionTimer({
  startedAtIso,
  durationMinutes,
  onEnterOvertime,
}: SessionTimerProps) {
  const deadlineMs = useMemo(() => {
    const start = new Date(startedAtIso).getTime();
    return start + durationMinutes * 60_000;
  }, [startedAtIso, durationMinutes]);

  const [now, setNow] = useState(() => Date.now());
  const wasPositive = useRef(true);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingSec = Math.round((deadlineMs - now) / 1000);
  const overtimeSec = remainingSec < 0 ? -remainingSec : 0;

  useEffect(() => {
    if (remainingSec < 0 && wasPositive.current) {
      wasPositive.current = false;
      onEnterOvertime?.();
    }
  }, [remainingSec, onEnterOvertime]);

  if (remainingSec >= 0) {
    return (
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Time left
        </p>
        <p
          className="mt-1 font-mono text-5xl font-bold tabular-nums text-emerald-400 sm:text-6xl"
          aria-live="polite"
        >
          {formatMmSs(remainingSec)}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-amber-400">
        Overtime
      </p>
      <p
        className="mt-1 font-mono text-5xl font-bold tabular-nums text-amber-300 sm:text-6xl"
        aria-live="polite"
      >
        +{formatMmSs(overtimeSec)}
      </p>
    </div>
  );
}
