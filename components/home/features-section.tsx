import React from "react";
import { BookOpen, BookmarkCheck, Library } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Discover Books",
    description:
      "Explore thousands of curated books across fiction, science, technology, and more.",
  },
  {
    icon: BookmarkCheck,
    title: "Borrow Easily",
    description:
      "Borrow books in seconds, choose flexible return dates, and enjoy uninterrupted reading.",
  },
  {
    icon: Library,
    title: "Manage Your Library",
    description:
      "Keep track of all your borrowed volumes, return books on time, or contribute your own titles.",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-b border-border/80 bg-surface/30 py-8 sm:py-10 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
