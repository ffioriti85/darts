import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshSessionStats } from "@/lib/supabase/session_stats";
import type { TrainingSessionRow } from "@/lib/types/session";

type Ctx = { params: Promise<{ id: string }> };

type RoundBody = {
  hits?: boolean[];
};

/**
 * Persists one round of throws and updates session aggregates.
 *
 * Args:
 *   request: JSON { hits: boolean[] } length must match session.darts_per_round.
 *   context: Session id param.
 *
 * Returns:
 *   Updated session row.
 *
 * Side Effects:
 *   Inserts into public.throws; updates session counters.
 *
 * Concurrency Notes:
 *   Uses max throw_number query then batch insert; rare collisions if two tabs
 *   submit simultaneously (personal tool — acceptable).
 */
export async function POST(request: Request, context: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await context.params;

  let body: RoundBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hits = body.hits;
  if (!Array.isArray(hits) || hits.some((h) => typeof h !== "boolean")) {
    return NextResponse.json({ error: "hits must be boolean[]" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (sErr) {
      console.error(sErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = session as TrainingSessionRow;
    if (row.ended_at) {
      return NextResponse.json({ error: "Session already ended" }, { status: 400 });
    }

    if (hits.length !== row.darts_per_round) {
      return NextResponse.json(
        { error: `Expected ${row.darts_per_round} dart results` },
        { status: 400 },
      );
    }

    const { data: maxRow, error: maxErr } = await supabase
      .from("throws")
      .select("throw_number")
      .eq("session_id", sessionId)
      .order("throw_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxErr) {
      console.error(maxErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const startNum = maxRow?.throw_number ? maxRow.throw_number + 1 : 1;
    const inserts = hits.map((is_hit, i) => ({
      session_id: sessionId,
      throw_number: startNum + i,
      is_hit,
    }));

    const { error: insErr } = await supabase.from("throws").insert(inserts);
    if (insErr) {
      console.error(insErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const ok = await refreshSessionStats(supabase, sessionId);
    if (!ok) {
      return NextResponse.json({ error: "Failed to refresh stats" }, { status: 500 });
    }

    const { data: updated, error: fErr } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fErr) {
      console.error(fErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ session: updated as TrainingSessionRow });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}
