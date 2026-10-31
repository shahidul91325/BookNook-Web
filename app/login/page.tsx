import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthFormSkeleton } from "@/components/auth/auth-skeleton";

export const metadata: Metadata = {
  title: "Sign In | BookNook",
  description:
    "Sign in to your BookNook account to manage your library loans, borrow books, and share recommendations.",
};

export default function LoginPage() {
  return (
    <AuthCardLayout
      heading="Welcome Back"
      subheading="Sign in to access your borrowed books and community library collection."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthCardLayout>
  );
}
