"use client";

import * as React from "react";
import { BookOpen, Copy, FolderGit2, Sparkles, TrendingUp } from "lucide-react";
import { bookService } from "@/services/book-service";
import type { Book } from "@/types";

interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  totalCategories: number;
  averageRating: number | null;
}

export function StatisticsSection() {
  const [stats, setStats] = React.useState<LibraryStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isCancelled = false;

    async function computeStats() {
      try {
        const books = await bookService.getBooks();
        if (isCancelled || !Array.isArray(books)) return;

        const totalBooks = books.length;
        const totalCopies = books.reduce((sum: number, b: Book) => sum + (Number(b.quantity) || 0), 0);

        const uniqueCategories = new Set(
          books
            .map((b: Book) => (typeof b.category === "string" ? b.category.trim() : ""))
            .filter(Boolean)
        );

        const ratedBooks = books.filter((b: Book) => typeof b.rating === "number" && b.rating > 0);
        const averageRating =
          ratedBooks.length > 0
            ? Number(
                (
                  ratedBooks.reduce((sum: number, b: Book) => sum + (b.rating || 0), 0) /
                  ratedBooks.length
                ).toFixed(1)
              )
            : null;

        setStats({
          totalBooks,
          totalCopies,
          totalCategories: uniqueCategories.size,
          averageRating,
        });
      } catch {
        // Fallback gracefully without fabricating data
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    computeStats();

    return () => {
      isCancelled = true;
    };
  }, []);

  // While loading, display skeleton cards
  if (isLoading) {
    return (
      <section className="py-12 border-b border-border/80 bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border/80 bg-card p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="h-4 w-20 bg-surface rounded" />
                <div className="h-8 w-14 bg-surface rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no stats or zero books, don't show an empty or misleading statistics block
  if (!stats || stats.totalBooks === 0) {
    return null;
  }

  const statItems = [
    {
      label: "Total Titles",
      value: stats.totalBooks.toLocaleString(),
      subtext: "Indexed in library",
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Available Copies",
      value: stats.totalCopies.toLocaleString(),
      subtext: "Ready for borrowing",
      icon: Copy,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Active Categories",
      value: stats.totalCategories.toString(),
      subtext: "Covering varied genres",
      icon: FolderGit2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: stats.averageRating ? "Average Rating" : "Community Driven",
      value: stats.averageRating ? `${stats.averageRating} ★` : "100%",
      subtext: stats.averageRating ? "From verified reader reviews" : "Free knowledge sharing",
      icon: stats.averageRating ? Sparkles : TrendingUp,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-b border-border/80 bg-surface/30 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Library at a Glance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time verified metrics reflecting our growing book collection.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg} border ${item.border} ${item.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{item.subtext}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
