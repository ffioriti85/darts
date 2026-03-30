"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
};

/**
 * Top bar with optional back link and Clerk account menu.
 *
 * Args:
 *   title: Page title.
 *   showBack: When true, shows link back to home.
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
export function AppHeader({ title = "Darts Training", showBack }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        {showBack ? (
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Home
          </Link>
        ) : null}
        <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-100">
          {title}
        </h1>
      </div>
      <UserButton />
    </header>
  );
}
