import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";

/**
 * Authenticated home dashboard (middleware ensures sign-in).
 *
 * Args:
 *   None.
 *
 * Returns:
 *   Primary navigation for starting or reviewing sessions.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader title="Darts Training" />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-10">
        <p className="text-center text-zinc-400">
          Fast, tap-friendly logging for practice sessions.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/session/new"
            className="flex min-h-16 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            Start New Session
          </Link>
          <Link
            href="/results"
            className="flex min-h-14 items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-900 text-lg font-medium text-zinc-100 transition hover:bg-zinc-800 active:scale-[0.99]"
          >
            View Results
          </Link>
        </div>
      </main>
    </div>
  );
}
