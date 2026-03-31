import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshSessionStats, updateShootingPace } from "@/lib/supabase/session_stats";
import type { TrainingSessionRow } from "@/lib/types/session";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Fetches a single session if it belongs to the signed-in user.
 *
 * Args:
 *   _request: Unused.
 *   context: Route params with session id.
 *
 * Returns:
 *   Session JSON or 404/403.
 *
 * Side Effects:
 *   Read-only Supabase query.
 *
 * Concurrency Notes:
 *   N/A.
 */
export async function GET(_request: Request, context: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

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
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ session: data as TrainingSessionRow });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}

/**
 * Ends a session: sets ended_at and refreshes aggregates from throws.
 *
 * Args:
 *   _request: Unused (could accept body; not required).
 *   context: Route params with session id.
 *
 * Returns:
 *   Updated session JSON.
 *
 * Side Effects:
 *   Updates sessions.ended_at and counters.
 *
 * Concurrency Notes:
 *   Idempotent if already ended (still refreshes stats).
 */
export async function PATCH(_request: Request, context: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = createAdminClient();
    const { data: existing, error: exErr } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (exErr) {
      console.error(exErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const endedAt = new Date().toISOString();
    const { error: upEnd } = await supabase
      .from("sessions")
      .update({ ended_at: endedAt })
      .eq("id", id);

    if (upEnd) {
      console.error(upEnd);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const ok = await refreshSessionStats(supabase, id);
    if (!ok) {
      return NextResponse.json({ error: "Failed to refresh stats" }, { status: 500 });
    }

    const paceOk = await updateShootingPace(supabase, id);
    if (!paceOk) {
      return NextResponse.json({ error: "Failed to update shooting pace" }, { status: 500 });
    }

    const { data: row, error: fetchErr } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr) {
      console.error(fetchErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ session: row as TrainingSessionRow });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}

/**
 * Deletes a session (and all its throws via cascade).
 *
 * Args:
 *   _request: Unused.
 *   context: Route params with session id.
 *
 * Returns:
 *   200 JSON { ok: true } or error status.
 *
 * Side Effects:
 *   Deletes from public.sessions; deletes associated public.throws (ON DELETE CASCADE).
 *
 * Concurrency Notes:
 *   Last-write-wins if two deletes race; the second delete becomes a no-op if the row is gone.
 */
export async function DELETE(_request: Request, context: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = createAdminClient();

    const { data: existing, error: exErr } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (exErr) {
      console.error(exErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Reason for Change: allow users to remove unwanted sessions from their history.
    const { error: delErr } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (delErr) {
      console.error(delErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}
