import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TrainingSessionRow } from "@/lib/types/session";
import ResultsView from "./ResultsView";

type PageProps = { searchParams: Promise<{ ended?: string }> };

/**
 * Historical sessions for the signed-in user, grouped by date.
 *
 * Args:
 *   searchParams.ended: Optional session id to highlight after ending a session.
 *
 * Returns:
 *   Results page.
 *
 * Side Effects:
 *   Read-only Supabase query.
 *
 * Concurrency Notes:
 *   N/A.
 */
export default async function ResultsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { ended } = await searchParams;

  let sessions: TrainingSessionRow[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      sessions = (data ?? []) as TrainingSessionRow[];
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader title="Results" showBack />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <ResultsView sessions={sessions} highlightSessionId={ended ?? null} />
      </main>
    </div>
  );
}
