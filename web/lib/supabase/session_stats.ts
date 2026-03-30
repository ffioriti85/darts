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

/**
 * Sets shooting_pace_seconds = session wall duration / total_throws when ended.
 *
 * Args:
 *   supabase: Admin Supabase client.
 *   sessionId: Session UUID (must have ended_at set).
 *
 * Returns:
 *   true if update succeeded, false otherwise.
 *
 * Side Effects:
 *   Updates public.sessions.shooting_pace_seconds.
 *
 * Concurrency Notes:
 *   Call after ended_at and throw aggregates are final.
 */
export async function updateShootingPace(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  const { data: row, error } = await supabase
    .from("sessions")
    .select("started_at, ended_at, total_throws")
    .eq("id", sessionId)
    .single();

  if (error || !row) {
    console.error(error);
    return false;
  }

  if (!row.ended_at || row.total_throws <= 0) {
    const { error: up } = await supabase
      .from("sessions")
      .update({ shooting_pace_seconds: null })
      .eq("id", sessionId);
    if (up) {
      console.error(up);
      return false;
    }
    return true;
  }

  const ms =
    new Date(row.ended_at).getTime() - new Date(row.started_at).getTime();
  const sec = Math.max(0, ms / 1000);
  const pace = sec / row.total_throws;

  const { error: upErr } = await supabase
    .from("sessions")
    .update({ shooting_pace_seconds: pace })
    .eq("id", sessionId);

  if (upErr) {
    console.error(upErr);
    return false;
  }
  return true;
}
