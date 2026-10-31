"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BookDetailsSkeleton() {
  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-32 bg-surface rounded" />
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Cover & Badges */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xl">
              <div className="aspect-[3/4] w-full rounded-2xl bg-surface animate-pulse" />
            </div>

            {/* Availability info card skeleton */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-surface" />
                <Skeleton className="h-5 w-16 rounded-full bg-surface" />
              </div>
              <Skeleton className="h-3 w-full bg-surface/70" />
            </div>
          </div>

          {/* Right Column: Title, Metadata, Overview, Borrow Box */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-xl space-y-6 animate-pulse">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-full bg-surface" />
                <Skeleton className="h-6 w-20 rounded-full bg-surface" />
              </div>

              {/* Title & Author */}
              <div className="space-y-2">
                <Skeleton className="h-8 sm:h-10 w-3/4 bg-surface" />
                <Skeleton className="h-4 w-1/3 bg-surface/70" />
              </div>

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Description Overview */}
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-28 bg-surface" />
                <Skeleton className="h-3.5 w-full bg-surface/80" />
                <Skeleton className="h-3.5 w-full bg-surface/80" />
                <Skeleton className="h-3.5 w-2/3 bg-surface/80" />
              </div>

              {/* Contributor Card Skeleton */}
              <div className="p-4 rounded-2xl bg-surface/50 border border-border/70 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-32 bg-surface" />
                  <Skeleton className="h-3 w-44 bg-surface/60" />
                </div>
              </div>

              {/* Borrow CTA Box Skeleton */}
              <div className="p-5 sm:p-6 rounded-2xl bg-primary/5 border border-primary/15 space-y-4">
                <Skeleton className="h-5 w-40 bg-surface" />
                <Skeleton className="h-3.5 w-64 max-w-full bg-surface/70" />
                <Skeleton className="h-11 w-48 rounded-xl bg-surface" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
