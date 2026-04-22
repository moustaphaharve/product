import { useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { useAppStore } from "../store/app";
import { WelcomeView } from "../views/WelcomeView";
import { registerAuthTokenGetter } from "../lib/api";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

/**
 * ClerkProvider wrapper.
 *
 * - If `VITE_CLERK_PUBLISHABLE_KEY` is set, we wrap the tree in ClerkProvider
 *   and gate the app: signed-out users see <WelcomeView />, signed-in users
 *   see everything else.
 * - If the key is missing (e.g. a fresh clone with no .env), we skip Clerk
 *   entirely and fall back to the "Skip for local development" flow so the
 *   app never blocks on auth.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  if (!CLERK_KEY) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <AuthGate>{children}</AuthGate>
    </ClerkProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const stage = useAppStore((s) => s.stage);
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Expose a token provider to the API client so every fetch can attach a JWT.
  useEffect(() => {
    if (!getToken) return;
    registerAuthTokenGetter(async () => {
      try {
        return (await getToken()) ?? null;
      } catch {
        return null;
      }
    });
  }, [getToken]);

  // Stamp the user's ID + email onto the API calls for the /auth shim.
  useEffect(() => {
    if (!user) return;
    window.localStorage.setItem("product.clerk.userId", user.id);
    window.localStorage.setItem(
      "product.clerk.email",
      user.primaryEmailAddress?.emailAddress ?? "",
    );
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-primary text-text-tertiary text-sm">
        Loading
      </div>
    );
  }

  // Local-dev "skip" still works: user clicks Skip ? stage becomes "ready",
  // we bypass Clerk's sign-in requirement.
  if (stage !== "welcome" && stage !== "onboarding") {
    return (
      <>
        <SignedIn>{children}</SignedIn>
        <SignedOut>{children}</SignedOut>
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <WelcomeView />
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}
