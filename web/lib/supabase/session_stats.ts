import type { SupabaseClient } from "@supabase/supabase-js";
import { computeAccuracyPct } from "@/lib/types/session";

/**
 * Recomputes aggregate counters on sessions from throws for a session id.
 *
 * Args:
 *   supabase: Admin Supabase client.
 *   sessionId: Session UUID.
 *
 * Returns:
 *   true if update succeeded, false otherwise.
 *
 * Side Effects:
 *   Updates public.sessions row for sessionId.
 *
 * Concurrency Notes:
 *   Not atomic with concurrent inserts; acceptable for personal MVP (last write wins).
 */
export async function refreshSessionStats(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  const { data: rows, error: selErr } = await supabase
    .from("throws")
    .select("is_hit")
    .eq("session_id", sessionId);

  if (selErr) {
    console.error(selErr);
    return false;
  }

  const list = rows ?? [];
  const total = list.length;
  const hits = list.filter((r) => r.is_hit).length;
  const misses = total - hits;
  const accuracy = computeAccuracyPct(hits, total);

  const { error: upErr } = await supabase
    .from("sessions")
    .update({
      total_throws: total,
      total_hits: hits,
      total_misses: misses,
      accuracy,
    })
    .eq("id", sessionId);

  if (upErr) {
    console.error(upErr);
    return false;
  }
  return true;
}
