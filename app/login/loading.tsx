import { AuthFormSkeleton } from "@/components/auth/auth-skeleton";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";

export default function Loading() {
  return (
    <AuthCardLayout
      heading="Welcome Back"
      subheading="Sign in to access your borrowed books and community library collection."
    >
      <AuthFormSkeleton />
    </AuthCardLayout>
  );
}
