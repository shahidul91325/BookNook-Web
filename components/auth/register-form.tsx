"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";

export function RegisterForm() {
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
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [image, setImage] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    image?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
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
    const newErrors: {
      name?: string;
      email?: string;
      image?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (image.trim() && !/^https?:\/\//i.test(image.trim())) {
      newErrors.image = "Avatar image must be a valid http or https URL.";
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
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: image.trim() || undefined,
        callbackURL: redirectUrl,
      });

      if (res?.error) {
        const errorMsg =
          res.error.message ||
          "Failed to create your account. Please check the provided information.";
        setApiError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      toast.success("Account created successfully! Welcome to BookNook.");
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during account creation. Please try again.";
      setApiError(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Sign In */}
      <GoogleButton label="Sign Up with Google" redirectTo={redirectUrl} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/80" />
        </div>
        <div className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Or register with email
        </div>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
          <span>{apiError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Full Name Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-name"
            className="block text-xs font-semibold text-foreground"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <Input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Sarah Johnson"
              autoComplete="name"
              disabled={isSubmitting}
              className={`pl-9.5 text-xs h-9.5 ${
                errors.name ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="sarah@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              className={`pl-9.5 text-xs h-9.5 ${
                errors.email ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Avatar Image URL Field (Optional) */}
        <div className="space-y-1">
          <label
            htmlFor="register-image"
            className="block text-xs font-semibold text-foreground flex items-center justify-between"
          >
            <span>Avatar Photo URL</span>
            <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
            </div>
            <Input
              id="register-image"
              type="url"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
              }}
              placeholder="https://images.unsplash.com/photo-..."
              disabled={isSubmitting}
              className={`pl-9.5 text-xs h-9.5 ${
                errors.image ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
          </div>
          {errors.image && (
            <p className="text-[11px] text-destructive">{errors.image}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              disabled={isSubmitting}
              className={`pl-9.5 pr-10 text-xs h-9.5 ${
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

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-semibold text-foreground"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Re-enter password"
              autoComplete="new-password"
              disabled={isSubmitting}
              className={`pl-9.5 pr-10 text-xs h-9.5 ${
                errors.confirmPassword
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-destructive">
              {errors.confirmPassword}
            </p>
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
              Creating Account...
            </>
          ) : (
            <>
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Link to Login */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Already have a BookNook account?{" "}
        <Link
          href={`/login${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ""}`}
          className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
