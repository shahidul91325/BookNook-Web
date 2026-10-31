import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthFormSkeleton } from "@/components/auth/auth-skeleton";

export const metadata: Metadata = {
  title: "Create an Account | BookNook",
  description:
    "Create a free BookNook account to borrow books, track reading loans, and share your personal library collection.",
};

export default function RegisterPage() {
  return (
    <AuthCardLayout
      heading="Create an Account"
      subheading="Join the BookNook reading community to borrow books and share your collection."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </AuthCardLayout>
  );
}
