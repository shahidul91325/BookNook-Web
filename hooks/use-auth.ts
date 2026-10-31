"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import type { AuthUser } from "@/types";

export function useAuth() {
  const router = useRouter();
  const session = authClient.useSession();

  const user: AuthUser | null = session.data?.user
    ? {
        id: session.data.user.id,
        name: session.data.user.name,
        email: session.data.user.email,
        image: session.data.user.image,
      }
    : null;

  const handleSignOut = React.useCallback(
    async (redirectTo: string = "/") => {
      try {
        await authClient.signOut();
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("better-auth_session_token");
        }
        toast.success("You have been signed out.");
        router.push(redirectTo);
        router.refresh();
      } catch {
        toast.error("Failed to sign out. Please try again.");
      }
    },
    [router]
  );

  return {
    user,
    session: session.data,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    error: session.error,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: handleSignOut,
    rawSignOut: authClient.signOut,
  };
}
