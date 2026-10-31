import React from "react";
import Link from "next/link";
import { ArrowRight, Search, BookOpen, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Discover a Book",
    description: "Browse our extensive catalog and find your next favorite title by genre, title, or author.",
  },
  {
    step: "02",
    icon: BookOpen,
    title: "Borrow With One Click",
    description: "Select your desired return date and submit your borrow request instantly with zero fees.",
  },
  {
    step: "03",
    icon: Clock,
    title: "Enjoy Reading",
    description: "Take your time to immerse yourself in the story, take notes, and expand your horizons.",
  },
  {
    step: "04",
    icon: RotateCcw,
    title: "Return on Time",
    description: "Return the book from your dashboard so fellow readers can enjoy it and keep the library growing.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 border-b border-border/80 bg-background/50 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            <span>Simple Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            How Borrowing Works
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            It&apos;s fast, completely free, and designed for an effortless reading experience.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-primary/20 group-hover:text-primary/40 transition-colors">
                      {item.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="px-7 gap-2 text-sm font-semibold shadow-md">
            <Link href="/books">
              <span>See All Books</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
