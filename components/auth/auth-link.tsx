"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface AuthLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Smart authentication link component that:
 * - Shows "You are already signed in!" toast and prevents navigation if user is logged in.
 * - Navigates smoothly to /login or /register if user is logged out.
 */
export function AuthLink({
  href,
  children,
  className,
  onClick,
  ...props
}: AuthLinkProps) {
  const { isAuthenticated } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    const isAuthRoute =
      href === "/login" ||
      href === "/register" ||
      href.startsWith("/login?") ||
      href.startsWith("/register?") ||
      href.startsWith("/login/") ||
      href.startsWith("/register/");

    if (isAuthenticated && isAuthRoute) {
      e.preventDefault();
      toast.info("You are already signed in!");
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}

/**
 * Hook to guard button actions with "You are already signed in!" feedback
 */
export function useAuthAction() {
  const { isAuthenticated } = useAuth();

  const handleAuthClick = (
    e?: React.MouseEvent,
    actionCallback?: () => void
  ): boolean => {
    if (isAuthenticated) {
      if (e) e.preventDefault();
      toast.info("You are already signed in!");
      return false;
    }
    if (actionCallback) actionCallback();
    return true;
  };

  return { isAuthenticated, handleAuthClick };
}
