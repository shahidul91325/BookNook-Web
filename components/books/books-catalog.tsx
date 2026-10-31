"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { bookService } from "@/services/book-service";
import { BookCard, BookCardSkeleton } from "@/components/books/book-card";
import { BookListItem, BookListItemSkeleton } from "@/components/books/book-list-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

export function BooksCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state synchronization
  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const viewParam = (searchParams.get("view") as "grid" | "list") || "grid";
  const availableParam = searchParams.get("available") || "all";

  // Local state
  const [searchInput, setSearchInput] = React.useState(searchParam);
  const [books, setBooks] = React.useState<Book[]>([]);
  const [allCategories, setAllCategories] = React.useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  // Sync search input when URL changes externally (React 19 render-phase pattern)
  const [prevSearchParam, setPrevSearchParam] = React.useState(searchParam);
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearchInput(searchParam);
  }

  // Helper to update search params
  const updateQuery = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || (key === "category" && value === "All") || (key === "page" && value === "1") || (key === "sort" && value === "newest") || (key === "available" && value === "all") || (key === "view" && value === "grid")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Load books from backend API
  React.useEffect(() => {
    let isCancelled = false;

    async function fetchCatalog() {
      try {
        const data = await bookService.getBooks({
          category: categoryParam !== "All" ? categoryParam : undefined,
          search: searchParam.trim() || undefined,
          sort: sortParam,
        });

        if (!isCancelled) {
          const list = Array.isArray(data) ? data : [];
          setBooks(list);
          setErrorMessage(null);

          // Compute category counts dynamically from backend books
          const counts = new Map<string, number>();
          list.forEach((b: Book) => {
            if (b.category && typeof b.category === "string") {
              const cat = b.category.trim();
              if (cat) {
                counts.set(cat, (counts.get(cat) || 0) + 1);
              }
            }
          });
          setAllCategories(counts);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load books from the library server.";
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCatalog();

    return () => {
      isCancelled = true;
    };
  }, [categoryParam, searchParam, sortParam, retryKey]);

  // Handle Search Submit / Debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim(), page: "1" });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateQuery({ search: null, page: "1" });
  };

  // Filter in memory for instant feedback (covers API fallback and availability filter)
  const filteredBooks = React.useMemo(() => {
    return books.filter((book) => {
      // Category match
      if (categoryParam !== "All" && book.category !== categoryParam) {
        return false;
      }

      // Search match (title, author, category)
      if (searchParam.trim()) {
        const query = searchParam.toLowerCase();
        const matchesTitle = book.title?.toLowerCase().includes(query);
        const matchesAuthor = book.author?.toLowerCase().includes(query);
        const matchesCategory = book.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAuthor && !matchesCategory) {
          return false;
        }
      }

      // Availability filter
      if (availableParam === "available" && (book.quantity === undefined || book.quantity <= 0)) {
        return false;
      }

      return true;
    });
  }, [books, categoryParam, searchParam, availableParam]);

  // Client-side Sort fallback
  const sortedBooks = React.useMemo(() => {
    const list = [...filteredBooks];
    switch (sortParam) {
      case "oldest":
        return list.reverse();
      case "title-asc":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case "quantity-desc":
        return list.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      case "newest":
      default:
        return list;
    }
  }, [filteredBooks, sortParam]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(Math.max(1, pageParam), Math.max(1, totalPages));
  const paginatedBooks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  const handleResetFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1.5">
            <BookOpen className="h-4 w-4" />
            <span>BookNook Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Explore Our Library
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
            Find your next favorite read from our diverse collection of community-shared books.
          </p>
        </div>

        {/* Top Control Bar: Search, Category Select, Sort & View Mode */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-8 bg-card/60 p-4 rounded-2xl border border-border/80 backdrop-blur-sm">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books by title, author, keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 h-10 w-full bg-surface border-border/80 focus-visible:ring-primary"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Quick Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Category Select (Dropdown for Mobile & Quick Jump) */}
            <div className="w-full sm:w-44">
              <Select
                value={categoryParam}
                onChange={(e) => updateQuery({ category: e.target.value, page: "1" })}
              >
                <option value="All">All Categories</option>
                {Array.from(allCategories.keys()).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({allCategories.get(cat)})
                  </option>
                ))}
              </Select>
            </div>

            {/* Sort Select */}
            <div className="w-full sm:w-44">
              <Select
                value={sortParam}
                onChange={(e) => updateQuery({ sort: e.target.value, page: "1" })}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="title-asc">Sort: Title (A-Z)</option>
                <option value="title-desc">Sort: Title (Z-A)</option>
                <option value="quantity-desc">Sort: Available Copies</option>
              </Select>
            </div>

            {/* View Mode Switcher (Grid / List) */}
            <div className="flex items-center rounded-lg border border-border/80 bg-surface p-1">
              <button
                type="button"
                onClick={() => updateQuery({ view: "grid" })}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                  viewParam === "grid" && "bg-primary text-primary-foreground shadow-sm font-semibold"
                )}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => updateQuery({ view: "list" })}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                  viewParam === "list" && "bg-primary text-primary-foreground shadow-sm font-semibold"
                )}
                title="List View"
                aria-label="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Badges Bar */}
        {(categoryParam !== "All" || searchParam || availableParam === "available") && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Active Filters:</span>
            {categoryParam !== "All" && (
              <Badge variant="default" className="gap-1.5 py-1 px-2.5">
                Category: {categoryParam}
                <button
                  type="button"
                  onClick={() => updateQuery({ category: null, page: "1" })}
                  className="hover:text-primary-foreground/80"
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchParam && (
              <Badge variant="default" className="gap-1.5 py-1 px-2.5">
                Search: &ldquo;{searchParam}&rdquo;
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-primary-foreground/80"
                  aria-label="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {availableParam === "available" && (
              <Badge variant="default" className="gap-1.5 py-1 px-2.5">
                In Stock Only
                <button
                  type="button"
                  onClick={() => updateQuery({ available: null, page: "1" })}
                  className="hover:text-primary-foreground/80"
                  aria-label="Remove availability filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-primary hover:underline font-semibold ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Main Layout: Sidebar & Catalog List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:block space-y-6">
            {/* Categories Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-border/60">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Filter className="h-4 w-4 text-primary" />
                  <span>Categories</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border/60">
                  {books.length}
                </span>
              </div>

              <div className="space-y-1">
                {/* All Option */}
                <button
                  type="button"
                  onClick={() => updateQuery({ category: null, page: "1" })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left",
                    categoryParam === "All"
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <span>All Books</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      categoryParam === "All" ? "bg-white/20 text-white" : "text-muted-foreground"
                    )}
                  >
                    {books.length}
                  </span>
                </button>

                {/* Individual Categories from API */}
                {Array.from(allCategories.entries()).map(([cat, count]) => {
                  const isActive = categoryParam === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateQuery({ category: cat, page: "1" })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                      )}
                    >
                      <span className="truncate">{cat}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded shrink-0",
                          isActive ? "bg-white/20 text-white" : "text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Filter Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5">
              <div className="flex items-center gap-2 pb-3.5 mb-3 border-b border-border/60 text-sm font-bold text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>Availability</span>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={availableParam === "available"}
                  onChange={(e) =>
                    updateQuery({
                      available: e.target.checked ? "available" : null,
                      page: "1",
                    })
                  }
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>In Stock only (Available copies &gt; 0)</span>
              </label>
            </div>
          </aside>

          {/* Catalog Content Area */}
          <main className="lg:col-span-3">
            {/* Results Counter Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60 text-xs text-muted-foreground">
              <div>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {sortedBooks.length}
                </span>{" "}
                {sortedBooks.length === 1 ? "book" : "books"}
              </div>

              {totalPages > 1 && (
                <div>
                  Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                  {totalPages}
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div
                className={cn(
                  viewParam === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6"
                    : "space-y-4"
                )}
              >
                {Array.from({ length: 6 }).map((_, index) =>
                  viewParam === "grid" ? (
                    <BookCardSkeleton key={index} />
                  ) : (
                    <BookListItemSkeleton key={index} />
                  )
                )}
              </div>
            )}

            {/* Error State */}
            {!isLoading && errorMessage && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto my-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive mb-3.5">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Failed to load library books
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-5">{errorMessage}</p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    setRetryKey((k) => k + 1);
                  }}
                  className="gap-2 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !errorMessage && sortedBooks.length === 0 && (
              <EmptyState
                title="No books found"
                description={
                  searchParam || categoryParam !== "All"
                    ? "We couldn't find any books matching your active search or filters. Try adjusting your query."
                    : "The library collection is currently empty. Add the first book to get started!"
                }
                actionLabel="Clear Filters"
                onActionClick={handleResetFilters}
                className="my-8"
              />
            )}

            {/* Books Display: Grid Mode or List Mode */}
            {!isLoading && !errorMessage && paginatedBooks.length > 0 && (
              <>
                {viewParam === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedBooks.map((book) => (
                      <BookCard key={book.id || book._id} book={book} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedBooks.map((book) => (
                      <BookListItem key={book.id || book._id} book={book} />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2 pt-6 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuery({ page: String(currentPage - 1) })}
                      disabled={currentPage <= 1}
                      className="gap-1 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrent = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => updateQuery({ page: String(pageNum) })}
                            className={cn(
                              "h-8 w-8 rounded-lg text-xs font-semibold transition-colors",
                              isCurrent
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuery({ page: String(currentPage + 1) })}
                      disabled={currentPage >= totalPages}
                      className="gap-1 text-xs"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
