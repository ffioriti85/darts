"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { SessionPhase } from "@/components/session/DartToggleButton";

type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
  /** Where the back control navigates when showBack is true. Defaults to `/`. */
  backHref?: string;
  /** Label for the back control. Defaults to `Home`. */
  backLabel?: string;
  phase?: SessionPhase;
};

/**
 * Top bar with optional back link and Clerk account menu.
 *
 * Args:
 *   title: Page title.
 *   showBack: When true, shows link back to home.
 *   phase: Optional warm-up vs training border/background.
 *
 * Returns:
 *   Header JSX.
 *
 * Side Effects:
 *   None.
 *
 * Concurrency Notes:
 *   N/A.
 */
export function AppHeader({
  title = "Darts Training",
  showBack,
  backHref = "/",
  backLabel = "Home",
  phase,
}: AppHeaderProps) {
  const barCls =
    phase === "warmup"
      ? "border-amber-900/30 bg-slate-950/95"
      : "border-zinc-800 bg-zinc-950/90";
  const backCls =
    phase === "warmup"
      ? "border-slate-600 text-slate-300 hover:bg-slate-800"
      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800";
  const titleCls = phase === "warmup" ? "text-slate-100" : "text-zinc-100";

  return (
    <header
      className={`flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur ${barCls}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showBack ? (
          <Link
            href={backHref}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm ${backCls}`}
          >
            {backLabel}
          </Link>
        ) : null}
        <h1 className={`truncate text-lg font-semibold tracking-tight ${titleCls}`}>
          {title}
        </h1>
      </div>
      <UserButton />
    </header>
  );
}
