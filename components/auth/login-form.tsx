"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Extract and sanitize redirect URL
  const rawRedirect = searchParams.get("redirect") || searchParams.get("redirectTo");
  const redirectUrl =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/books";

  // Form states
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  // Form validation
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: redirectUrl,
      });

      if (res?.error) {
        const errorMsg =
          res.error.message ||
          "Invalid email or password. Please verify your credentials.";
        setApiError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      toast.success("Welcome back! Signed in successfully.");
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign in. Please try again.";
      setApiError(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google Sign In */}
      <GoogleButton label="Continue with Google" redirectTo={redirectUrl} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/80" />
        </div>
        <div className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Or continue with email
        </div>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
          <span>{apiError}</span>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              className={`pl-9.5 text-xs h-10 ${
                errors.email ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-foreground"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              className={`pl-9.5 pr-10 text-xs h-10 ${
                errors.password ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting}
          className="w-full h-10 text-xs font-semibold gap-2 shadow-md mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In to BookNook
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Link to Register */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link
          href={`/register${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ""}`}
          className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
