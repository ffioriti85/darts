import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Clerk sign-up under /login/sign-up; pairs with SignIn at /login.
 *
 * Args:
 *   None.
 *
 * Returns:
 *   React element with SignUp UI.
 *
 * Side Effects:
 *   Redirects signed-in users to `/`.
 *
 * Concurrency Notes:
 *   N/A.
 */
export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <SignUp
        path="/login/sign-up"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </div>
  );
}
