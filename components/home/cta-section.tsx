import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden transition-colors">
      {/* Background radial gradient glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-[450px] w-[600px] rounded-full bg-primary/10 blur-[140px] dark:bg-primary/20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-surface p-8 sm:p-14 lg:p-16 text-center shadow-2xl">
          {/* Subtle decorative outline */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary mb-6 shadow-inner">
            <BookOpen className="h-7 w-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready for your next read?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Start Your Reading Adventure With{" "}
            <span className="text-gradient-electric">BookNook Today</span>
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Join our growing community of passionate readers. Discover thousands of
            compelling titles, borrow with ease, and share the joy of knowledge.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-8 py-3 text-sm font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/35 gap-2 group transition-all"
            >
              <Link href="/books">
                <span>Browse All Books</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold border-border hover:border-primary/50 hover:bg-surface-hover transition-all"
            >
              <Link href="/register">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
