"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={showLabel ? "default" : "icon"}
        className={cn(
          "h-9 rounded-xl border border-border/60 text-muted-foreground",
          showLabel ? "px-3 gap-2 text-xs" : "w-9",
          className
        )}
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-4 w-4" />
        {showLabel && <span>Theme</span>}
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative rounded-xl border border-border/80 bg-surface/80 text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-surface-hover hover:text-primary active:scale-95 shadow-sm",
        showLabel ? "h-9 px-3 gap-2 text-xs font-medium" : "h-9 w-9",
        className
      )}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 transition-all duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="h-4 w-4 text-primary transition-all duration-300 rotate-0 scale-100" />
        )}
      </div>
      {showLabel && (
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </Button>
  );
}
