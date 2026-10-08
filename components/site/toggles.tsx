"use client";

import { Moon, Sun, Zap } from "lucide-react";
import { trackEvent } from "@/lib/client/analytics";
import { setRecruiterMode, toggleTheme, useRecruiterMode, useTheme } from "@/lib/client/stores";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
        className,
      )}
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}

export function RecruiterToggle({ className, onToggle }: { className?: string; onToggle?: () => void }) {
  const on = useRecruiterMode();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        setRecruiterMode(!on);
        trackEvent("recruiter_mode", { on: String(!on) });
        onToggle?.();
      }}
      title="A scannable 30-second summary for busy readers"
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-mono text-xs transition-colors",
        on
          ? "border-accent-from bg-accent-from/15 text-foreground shadow-[0_0_20px_-6px_var(--accent-from)]"
          : "border-border-strong text-muted-foreground hover:border-accent-from/50 hover:text-foreground",
        className,
      )}
    >
      <Zap className="size-3.5" aria-hidden="true" />
      30-sec view
    </button>
  );
}
