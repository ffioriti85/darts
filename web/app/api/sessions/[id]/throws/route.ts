import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ThrowRow } from "@/lib/types/session";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Returns ordered throws for a session (for hit graph / analysis).
 *
 * Args:
 *   _request: Unused.
 *   context: Session id.
 *
 * Returns:
 *   JSON { throws: ThrowRow[] }.
 *
 * Side Effects:
 *   Read-only.
 *
 * Concurrency Notes:
 *   N/A.
 */
export async function GET(_request: Request, context: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await context.params;

  try {
    const supabase = createAdminClient();
    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("id")
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

    const { data: rows, error: tErr } = await supabase
      .from("throws")
      .select("throw_number, is_hit, is_warm_up, created_at")
      .eq("session_id", sessionId)
      .order("throw_number", { ascending: true });

    if (tErr) {
      console.error(tErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ throws: (rows ?? []) as ThrowRow[] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
}
