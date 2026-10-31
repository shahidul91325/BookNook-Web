"use client";

import { authClient } from "@/lib/auth/client";
import type { AuthUser } from "@/types";

export function useAuth() {
  const session = authClient.useSession();

  const user: AuthUser | null = session.data?.user
    ? {
        id: session.data.user.id,
        name: session.data.user.name,
        email: session.data.user.email,
        image: session.data.user.image,
      }
    : null;

  return {
    user,
    session: session.data,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    error: session.error,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
  };
}
