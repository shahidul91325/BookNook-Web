"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  Bookmark,
  Library,
  ChevronDown,
  Search,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Search input query state synchronized with URL (React 19 render-phase pattern)
  const urlSearch = searchParams.get("search") || "";
  const [prevUrlSearch, setPrevUrlSearch] = React.useState(urlSearch);
  const [searchQuery, setSearchQuery] = React.useState(urlSearch);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  // Handle Escape key to dismiss open menus
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/books") {
      return pathname === "/books" || (pathname.startsWith("/books/") && pathname !== "/books/add");
    }
    if (href === "/add-book") {
      return pathname === "/add-book" || pathname === "/books/add";
    }
    return pathname === href;
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/books?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/books");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (pathname === "/books") {
      router.push("/books");
    }
  };

  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "Books", href: "/books" },
  ];

  const protectedLinks = [
    { name: "Add Book", href: "/add-book", icon: PlusCircle },
    { name: "My Books", href: "/my-books", icon: Library },
    { name: "My Borrows", href: "/my-borrows", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0"
          aria-label="BookNook Home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground transition-colors">
            Book<span className="text-primary">Nook</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {publicLinks.map((link) => {
            const active = isRouteActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "text-primary bg-primary/10 font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {link.name}
              </Link>
            );
          })}

          {isAuthenticated && (
            <>
              {protectedLinks.map((link) => {
                const active = isRouteActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "text-primary bg-primary/10 font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Desktop Search Input Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2"
          role="search"
        >
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, author..."
            className="h-9 w-full rounded-full border border-border/80 bg-surface/80 pl-8.5 pr-14 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            aria-label="Search books"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-7 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs"
            aria-label="Execute search"
          >
            <Search className="h-3 w-3" />
          </button>
        </form>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2.5 shrink-0">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-9 w-24 rounded-lg bg-surface animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 p-1 pl-1.5 pr-2 transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary",
                  userMenuOpen && "border-primary ring-2 ring-primary/20"
                )}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <div className="relative h-7 w-7 rounded-full overflow-hidden bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-3.5 w-3.5" />}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground max-w-[100px] truncate hidden lg:inline-block">
                  {user?.name || "My Account"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    userMenuOpen && "rotate-180 text-primary"
                  )}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-border/80 bg-card p-2 text-card-foreground shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user?.name || "BookNook Member"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1.5 space-y-0.5">
                    {protectedLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-surface-hover hover:text-foreground",
                          isRouteActive(item.href)
                            ? "text-primary bg-primary/10 font-semibold"
                            : "text-muted-foreground"
                        )}
                        role="menuitem"
                      >
                        <item.icon className="h-4 w-4 text-primary" />
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/60 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-xl border border-border/80 bg-surface/80 p-2 text-foreground hover:bg-surface-hover hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-lg px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
          {/* Mobile Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative mb-3.5 flex items-center"
            role="search"
          >
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by title or author..."
              className="h-10 w-full rounded-xl border border-border/80 bg-surface pl-10 pr-20 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Search books on mobile"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-14 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs"
            >
              Search
            </button>
          </form>

          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {publicLinks.map((link) => {
              const active = isRouteActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}

            {isLoading ? (
              <div className="py-3 px-3.5 space-y-2 animate-pulse">
                <div className="h-4 w-28 bg-surface rounded" />
                <div className="h-9 w-full bg-surface rounded-lg" />
              </div>
            ) : isAuthenticated ? (
              <>
                <div className="my-2 border-t border-border/60" />
                <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  My Dashboard
                </div>

                {protectedLinks.map((link) => {
                  const active = isRouteActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4 text-primary" />
                      {link.name}
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-border/60" />

                <div className="flex items-center gap-3 px-3.5 py-2">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name || "Member"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg text-sm font-semibold border border-border/80 bg-surface/70 hover:bg-surface-hover text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
