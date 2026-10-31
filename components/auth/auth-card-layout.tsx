"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Sparkles, BookMarked, ShieldCheck, Heart } from "lucide-react";

interface AuthCardLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}

export function AuthCardLayout({
  children,
  heading,
  subheading,
}: AuthCardLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Literary Showcase Banner (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl border border-border/80 bg-gradient-to-br from-surface/90 via-surface/50 to-surface/20 backdrop-blur-md shadow-2xl relative overflow-hidden min-h-[580px]">
          {/* Subtle glowing badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Community Library Platform
            </span>
          </div>

          {/* Literary Quote */}
          <div className="my-auto space-y-6">
            <blockquote className="space-y-3">
              <p className="text-xl font-medium tracking-tight text-foreground leading-relaxed italic">
                &ldquo;A reader lives a thousand lives before he dies. The man who never reads lives only one.&rdquo;
              </p>
              <footer className="text-sm font-semibold text-primary">
                — George R.R. Martin
              </footer>
            </blockquote>

            {/* Platform Highlights */}
            <div className="space-y-3.5 pt-4 border-t border-border/60">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <BookMarked className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Explore & Borrow</p>
                  <p className="text-[11px] text-muted-foreground">Borrow from an ever-growing collection of real community books.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Secure & Transparent</p>
                  <p className="text-[11px] text-muted-foreground">Authenticated sessions with verified borrower records.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Share Your Books</p>
                  <p className="text-[11px] text-muted-foreground">Contribute your personal collection to fellow readers worldwide.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="flex items-center gap-2 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>BookNook &bull; Small Library, Big Dreams</span>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-9 shadow-2xl transition-all">
            {/* Mobile Header Brand Icon */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus-visible:outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Book<span className="text-primary">Nook</span>
                </span>
              </Link>
            </div>

            {/* Header Content */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {heading}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                {subheading}
              </p>
            </div>

            {/* Form & Actions */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
