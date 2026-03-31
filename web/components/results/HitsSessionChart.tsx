"use client";

import { buildRoundHitSeries } from "@/lib/chart/round_hit_series";
import type { ThrowRow } from "@/lib/types/session";

type HitsSessionChartProps = {
  throws: ThrowRow[];
  sessionStartedAt: string;
  dartsPerRound: number;
};

const VB_W = 100;
const VB_H = 52;
const PAD = 7;
const PLOT_W = VB_W - 2 * PAD;
const PLOT_H = VB_H - 2 * PAD - 6;

function formatTimeAxis(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

/**
 * Scatter of hits per round vs. elapsed session time (warm-up shaded).
 *
 * Args:
 *   throws: Ordered throw rows with optional created_at for X-axis.
 *   sessionStartedAt: Session start ISO.
 *   dartsPerRound: Max hits per round (Y scale).
 *
 * Returns:
 *   SVG chart or empty state.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function HitsSessionChart({
  throws,
  sessionStartedAt,
  dartsPerRound,
}: HitsSessionChartProps) {
  const maxHits = Math.max(1, dartsPerRound);

  if (throws.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-zinc-500">
        No throws in this session.
      </p>
    );
  }

  const points = buildRoundHitSeries(
    throws,
    sessionStartedAt,
    dartsPerRound,
  );

  if (points.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-zinc-500">
        No rounds to plot.
      </p>
    );
  }

  const maxT = Math.max(...points.map((p) => p.timeSec), 0.001);
  const plotTop = PAD;
  const plotBottom = PAD + PLOT_H;

  const xAt = (timeSec: number) =>
    PAD + (timeSec / maxT) * PLOT_W;

  const yAt = (hits: number) =>
    plotBottom - (hits / maxHits) * PLOT_H;

  const linePoints = points
    .map((p) => `${xAt(p.timeSec)},${yAt(p.hitsInRound)}`)
    .join(" ");

  let warmEndX: number | null = null;
  const warmTimes = points.filter((p) => p.isWarmUp).map((p) => p.timeSec);
  if (warmTimes.length > 0) {
    const lastWarmT = Math.max(...warmTimes);
    warmEndX = xAt(lastWarmT);
  }

  const xTick0 = PAD;
  const xTickMid = PAD + PLOT_W / 2;
  const xTickEnd = PAD + PLOT_W;

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-zinc-400">
        Hits per round vs. time (warm-up shaded)
      </p>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-56 w-full max-w-full"
        role="img"
        aria-label="Hits per round over session time"
      >
        {warmEndX != null && warmEndX > PAD ? (
          <rect
            x={PAD}
            y={plotTop}
            width={warmEndX - PAD}
            height={PLOT_H}
            fill="rgb(251 191 36 / 0.08)"
          />
        ) : null}

        {/* Y grid lines for 0…maxHits */}
        {Array.from({ length: maxHits + 1 }, (_, h) => (
          <line
            key={`h-${h}`}
            x1={PAD}
            x2={PAD + PLOT_W}
            y1={yAt(h)}
            y2={yAt(h)}
            stroke="rgb(63 63 70)"
            strokeWidth={0.15}
            opacity={0.6}
          />
        ))}

        <polyline
          fill="none"
          stroke="rgb(52 211 153 / 0.45)"
          strokeWidth={0.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={linePoints}
        />

        {points.map((p) => (
          <circle
            key={p.roundIndex}
            cx={xAt(p.timeSec)}
            cy={yAt(p.hitsInRound)}
            r={1.25}
            fill={p.isWarmUp ? "rgb(251 191 36)" : "rgb(52 211 153)"}
          />
        ))}

        <text
          x={xTick0}
          y={VB_H - 1}
          fill="rgb(161 161 170)"
          fontSize={3}
          textAnchor="start"
        >
          {formatTimeAxis(0)}
        </text>
        <text
          x={xTickMid}
          y={VB_H - 1}
          fill="rgb(161 161 170)"
          fontSize={3}
          textAnchor="middle"
        >
          {formatTimeAxis(maxT / 2)}
        </text>
        <text
          x={xTickEnd}
          y={VB_H - 1}
          fill="rgb(161 161 170)"
          fontSize={3}
          textAnchor="end"
        >
          {formatTimeAxis(maxT)}
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          Warm-up
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Training
        </span>
        <span className="text-zinc-600">X: time · Y: hits (0–{maxHits})</span>
      </div>
    </div>
  );
}
