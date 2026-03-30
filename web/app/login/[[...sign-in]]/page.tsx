import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Clerk-hosted sign-in at /login (path-based routing).
 *
 * Args:
 *   None.
 *
 * Returns:
 *   React element with SignIn UI.
 *
 * Side Effects:
 *   Redirects signed-in users to `/`.
 *
 * Concurrency Notes:
 *   N/A (static server component shell; Clerk hydrates client UI).
 */
export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/login/sign-up"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </div>
  );
}
