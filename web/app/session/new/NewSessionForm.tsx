"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

/**
 * Form to start a session with darts-per-round and duration defaults.
 *
 * Args:
 *   None.
 *
 * Returns:
 *   Full-page form UI.
 *
 * Side Effects:
 *   POST /api/sessions; navigates to /session/[id].
 *
 * Concurrency Notes:
 *   Disables submit while request in flight.
 */
export default function NewSessionForm() {
  const router = useRouter();
  const [darts, setDarts] = useState(3);
  const [minutes, setMinutes] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          darts_per_round: darts,
          duration_minutes: minutes,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Could not start session");
        return;
      }
      const data = (await res.json()) as { session: { id: string } };
      router.push(`/session/${data.session.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader title="New session" showBack />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-8">
          {error ? (
            <p className="rounded-xl border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-zinc-400">
              Darts per round
            </span>
            <input
              type="number"
              min={1}
              max={12}
              value={darts}
              onChange={(e) => setDarts(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-lg text-zinc-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-400">
              Session duration (minutes)
            </span>
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-lg text-zinc-100"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="min-h-14 rounded-2xl bg-emerald-600 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 disabled:opacity-60"
          >
            {busy ? "Starting…" : "Start Session"}
          </button>
        </form>
      </main>
    </div>
  );
}
