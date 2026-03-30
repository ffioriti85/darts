import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TrainingSessionRow } from "@/lib/types/session";

/**
 * Lists training sessions for the signed-in user (newest first).
 *
 * Args:
 *   request: Unused.
 *
 * Returns:
 *   JSON array of session rows or error.
 *
 * Side Effects:
 *   Reads from Supabase.
 *
 * Concurrency Notes:
 *   Read-only; no transaction required.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ sessions: data as TrainingSessionRow[] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}

type CreateBody = {
  darts_per_round?: number;
  duration_minutes?: number;
};

/**
 * Creates a new training session for the signed-in user.
 *
 * Args:
 *   request: JSON body with optional darts_per_round and duration_minutes.
 *
 * Returns:
 *   Created session row JSON.
 *
 * Side Effects:
 *   Inserts one row into public.sessions.
 *
 * Concurrency Notes:
 *   Single insert; no upsert.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const darts = Math.min(12, Math.max(1, Number(body.darts_per_round) || 3));
  const minutes = Math.min(180, Math.max(1, Number(body.duration_minutes) || 20));

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        darts_per_round: darts,
        duration_minutes: minutes,
      })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ session: data as TrainingSessionRow });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}
