import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TrainingSessionRow } from "@/lib/types/session";
import SessionPlayClient from "./SessionPlayClient";

type PageProps = { params: Promise<{ id: string }> };

/**
 * Loads an open training session for the active user or redirects if closed.
 *
 * Args:
 *   params: Dynamic route id.
 *
 * Returns:
 *   Session play UI.
 *
 * Side Effects:
 *   Read-only Supabase query.
 *
 * Concurrency Notes:
 *   N/A.
 */
export default async function ActiveSessionPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  let row: TrainingSessionRow;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      notFound();
    }
    if (!data) {
      notFound();
    }
    row = data as TrainingSessionRow;
  } catch (e) {
    console.error(e);
    notFound();
  }

  if (row.ended_at) {
    redirect("/results");
  }

  return <SessionPlayClient initialSession={row} />;
}
