import React from "react";
import { BookCardSkeleton } from "@/components/books/book-card";

export function BooksCatalogSkeleton() {
  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-8 w-64 bg-surface rounded animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-surface/70 rounded animate-pulse" />
        </div>

        {/* Search & Control bar skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="h-10 flex-1 bg-surface rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-surface rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-surface rounded-lg animate-pulse" />
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block space-y-4">
            <div className="h-5 w-28 bg-surface rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-full bg-surface/80 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
