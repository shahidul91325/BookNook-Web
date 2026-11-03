import { AuthFormSkeleton } from "@/components/auth/auth-skeleton";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";

export default function Loading() {
  return (
    <AuthCardLayout
      heading="Create an Account"
      subheading="Join the BookNook reading community to borrow books and share your collection."
    >
      <AuthFormSkeleton />
    </AuthCardLayout>
  );
}
