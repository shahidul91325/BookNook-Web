"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  authClient,
  BOOKNOOK_AUTH_REQUIRED,
  clearStoredAuthTokens,
  getStoredAccessToken,
  refreshAccessToken,
} from "@/lib/auth/client";
import type { AuthUser } from "@/types";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  const sessionUser = session.data?.user as { role?: string | null } | undefined;

  const user: AuthUser | null = session.data?.user
    ? {
        id: session.data.user.id,
        name: session.data.user.name,
        email: session.data.user.email,
        image: session.data.user.image ?? null,
        // Role comes from the backend-issued session only; never derived from
        // frontend-supplied IDs and never used by the frontend to authorize.
        role: sessionUser?.role ?? null,
      }
    : null;

  const isAdmin = Boolean(user?.role === "admin");

  const handleSignOut = React.useCallback(
    async (redirectTo: string = "/") => {
      try {
        await authClient.signOut();
      } catch {
        // Sign out locally even if the server request fails.
      }
      if (typeof window !== "undefined") {
        clearStoredAuthTokens();
      }
      toast.success("You have been signed out.");
      router.push(redirectTo);
      router.refresh();
    },
    [router]
  );

  // Obtain a fresh JWT whenever a session becomes available: after sign-in,
  // after sign-up, or after a page refresh with an existing session. This
  // keeps authentication state synchronized across refreshes.
  const hadSession = React.useRef(Boolean(session.data?.user));
  React.useEffect(() => {
    const nowAuthenticated = Boolean(session.data?.user);
    if (!hadSession.current && nowAuthenticated) {
      void refreshAccessToken();
    }
    hadSession.current = nowAuthenticated;
  }, [session.data?.user]);

  // Handle 401 responses from protected backend APIs: clear dead tokens and
  // require sign in (unless already on a sign-in page).
  React.useEffect(() => {
    function handleAuthRequired(event: Event) {
      const currentPath = window.location.pathname;
      if (
        currentPath === "/login" ||
        currentPath === "/register"
      ) {
        return;
      }
      clearStoredAuthTokens();
      void authClient.signOut().catch(() => {
        // Best-effort server-side sign out.
      });
      toast.error("Your session has expired. Please sign in again.");
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }

    window.addEventListener(BOOKNOOK_AUTH_REQUIRED, handleAuthRequired);
    return () => {
      window.removeEventListener(BOOKNOOK_AUTH_REQUIRED, handleAuthRequired);
    };
  }, [router, pathname]);

  return {
    user,
    session: session.data,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    isAdmin,
    error: session.error,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: handleSignOut,
    rawSignOut: authClient.signOut,
    refreshAccessToken,
    getAccessToken: getStoredAccessToken,
  };
}
