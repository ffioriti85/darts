import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { HitsSessionChart } from "@/components/results/HitsSessionChart";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ThrowRow } from "@/lib/types/session";

type PageProps = { params: Promise<{ sessionId: string }> };

/**
 * Per-session cumulative hits graph (completed sessions).
 *
 * Args:
 *   params.sessionId: Session UUID.
 *
 * Returns:
 *   Graph page.
 *
 * Side Effects:
 *   Read-only Supabase.
 *
 * Concurrency Notes:
 *   N/A.
 */
export default async function SessionHitGraphPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const { sessionId } = await params;
  const supabase = createAdminClient();

  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .select("id, started_at, darts_per_round")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sErr || !session) {
    notFound();
  }

  const { data: rows, error: tErr } = await supabase
    .from("throws")
    .select("throw_number, is_hit, is_warm_up, created_at")
    .eq("session_id", sessionId)
    .order("throw_number", { ascending: true });

  if (tErr) {
    console.error(tErr);
    notFound();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-950">
      <AppHeader
        title="Hit graph"
        showBack
        backHref="/results"
        backLabel="Results"
      />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <HitsSessionChart
          throws={(rows ?? []) as ThrowRow[]}
          sessionStartedAt={session.started_at}
          dartsPerRound={session.darts_per_round ?? 3}
        />
      </main>
    </div>
  );
}
