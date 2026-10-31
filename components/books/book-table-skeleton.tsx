"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface BookTableSkeletonProps {
  rows?: number;
  type?: "books" | "borrows";
}

export function BookTableSkeleton({
  rows = 5,
  type = "books",
}: BookTableSkeletonProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
      {/* Desktop Table View Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/70 bg-surface/50">
              <th className="py-3.5 px-4 font-semibold text-xs text-muted-foreground w-64">
                Book
              </th>
              <th className="py-3.5 px-4 font-semibold text-xs text-muted-foreground">
                {type === "books" ? "Category" : "Borrowed Date"}
              </th>
              <th className="py-3.5 px-4 font-semibold text-xs text-muted-foreground">
                {type === "books" ? "Available Copies" : "Due Date / Status"}
              </th>
              <th className="py-3.5 px-4 font-semibold text-xs text-muted-foreground">
                {type === "books" ? "Contributor" : "Borrower"}
              </th>
              <th className="py-3.5 px-4 font-semibold text-xs text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {/* Book Column: Thumbnail + Title/Author */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="aspect-[3/4] w-12 rounded-lg bg-surface shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-4 w-36 bg-surface" />
                      <Skeleton className="h-3 w-24 bg-surface/70" />
                    </div>
                  </div>
                </td>

                {/* Category or Borrow Date */}
                <td className="py-3.5 px-4">
                  <Skeleton className="h-5 w-20 rounded-full bg-surface" />
                </td>

                {/* Available Copies or Due Date */}
                <td className="py-3.5 px-4">
                  <Skeleton className="h-5 w-16 rounded-full bg-surface" />
                </td>

                {/* Contributor or Borrower */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-28 bg-surface" />
                    <Skeleton className="h-3 w-20 bg-surface/60" />
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-8 w-16 rounded-lg bg-surface" />
                    {type === "books" && (
                      <Skeleton className="h-8 w-16 rounded-lg bg-surface" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List Skeleton */}
      <div className="md:hidden divide-y divide-border/60 p-4 space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="pt-4 first:pt-0 space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="aspect-[3/4] w-14 rounded-lg bg-surface shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 bg-surface" />
                <Skeleton className="h-3 w-1/2 bg-surface/70" />
                <Skeleton className="h-5 w-16 rounded-full bg-surface" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-24 bg-surface/60" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-14 rounded-lg bg-surface" />
                {type === "books" && (
                  <Skeleton className="h-8 w-14 rounded-lg bg-surface" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton({
  type = "books",
}: {
  type?: "books" | "borrows";
}) {
  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-surface rounded" />
            <div className="h-8 w-56 bg-surface rounded" />
            <div className="h-3.5 w-80 max-w-full bg-surface/70 rounded" />
          </div>
          <div className="h-9 w-36 bg-surface rounded-lg" />
        </div>
        <BookTableSkeleton type={type} rows={5} />
      </div>
    </div>
  );
}
