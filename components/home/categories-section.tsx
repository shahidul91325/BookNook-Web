"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Atom,
  History as HistoryIcon,
  Smile,
  Heart,
  Code2,
  Folder,
} from "lucide-react";
import { bookService } from "@/services/book-service";
import type { Book } from "@/types";

interface CategoryInfo {
  name: string;
  count: number;
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("fiction") || lower.includes("fantasy")) {
    return Sparkles;
  }
  if (lower.includes("science")) {
    return Atom;
  }
  if (lower.includes("history")) {
    return HistoryIcon;
  }
  if (lower.includes("kid") || lower.includes("children")) {
    return Smile;
  }
  if (lower.includes("self") || lower.includes("health") || lower.includes("psychology")) {
    return Heart;
  }
  if (lower.includes("program") || lower.includes("tech") || lower.includes("code")) {
    return Code2;
  }
  return Folder;
}

export function CategoriesSection() {
  const [categories, setCategories] = React.useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isCancelled = false;

    async function loadCategories() {
      try {
        const books = await bookService.getBooks();
        if (isCancelled || !Array.isArray(books)) return;

        // Group dynamically by category from actual API data
        const countMap = new Map<string, number>();
        books.forEach((book: Book) => {
          if (book.category && typeof book.category === "string") {
            const trimmed = book.category.trim();
            if (trimmed) {
              countMap.set(trimmed, (countMap.get(trimmed) || 0) + 1);
            }
          }
        });

        const list: CategoryInfo[] = Array.from(countMap.entries()).map(
          ([name, count]) => ({
            name,
            count,
          })
        );

        // Sort by book count descending
        list.sort((a, b) => b.count - a.count);
        setCategories(list);
      } catch {
        // Fallback gracefully without breaking page
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  // If loading, show skeleton pills/cards
  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 border-b border-border/80 bg-background/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-36 bg-surface rounded mb-3 animate-pulse" />
          <div className="h-4 w-64 bg-surface/70 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-border/80 bg-card p-4 animate-pulse flex flex-col justify-between"
              >
                <div className="h-6 w-6 rounded-lg bg-surface" />
                <div className="h-3 w-16 rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If the API has no categories or no books yet, return null to avoid cluttering with empty UI
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 border-b border-border/80 bg-background/50 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1.5">
              <Compass className="h-3.5 w-3.5" />
              <span>Browse by Genre</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Explore Categories
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find exactly what you want to read from our diverse library genres.
            </p>
          </div>

          <Link
            href="/books"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <Link
                key={cat.name}
                href={`/books?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:bg-surface-hover hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border/60">
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {cat.count} {cat.count === 1 ? "book" : "books"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
