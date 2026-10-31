import Link from "next/link";
import { BookOpen, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Glow badge & Illustration */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl transform scale-150" />
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-surface border border-border/80 shadow-2xl">
            <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 text-primary stroke-[1.5]" />
          </div>
        </div>

        {/* Status & Headings */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span>Error 404</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page or book you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable in the BookNook library.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-border/90 hover:bg-surface-hover">
            <Link href="/books">
              <Search className="h-4 w-4 text-primary" />
              <span>Browse All Books</span>
            </Link>
          </Button>
        </div>

        {/* Quick Help Card */}
        <div className="mt-8 p-4 rounded-2xl bg-surface/40 border border-border/60 text-xs text-muted-foreground text-left max-w-sm mx-auto space-y-1.5">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            Helpful Suggestions
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
            <li>Double-check the URL for typos</li>
            <li>Use the search bar in the navbar to find books</li>
            <li>Explore our curated collection in the catalog</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
