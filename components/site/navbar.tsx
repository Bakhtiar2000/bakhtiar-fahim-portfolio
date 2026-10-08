"use client";

import { ArrowUpRight, Menu, Search } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/client/analytics";
import { scrollToId, scrollToTop } from "@/lib/client/scroll";
import { OPEN_PALETTE_EVENT } from "@/lib/client/stores";
import { cn } from "@/lib/utils";
import { RecruiterToggle, ThemeToggle } from "./toggles";
import type { SiteChrome } from "./types";

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

function useShortcutLabel() {
  return useSyncExternalStore(
    () => () => {},
    () => (isMac() ? "⌘K" : "Ctrl K"),
    () => null,
  );
}

export function Navbar({ chrome }: { chrome: SiteChrome }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const shortcut = useShortcutLabel();
  const initials = chrome.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = chrome.sections.filter((s) => s.id !== "achievements");

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border transition-all duration-300 ease-out",
          scrolled ? "border-border-strong px-3 py-2 shadow-lg shadow-black/10 glass" : "border-transparent px-2 py-3",
        )}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          className="flex items-center gap-2.5 rounded-lg pr-2 font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-accent font-mono text-xs font-bold text-white shadow-[0_0_20px_-4px_var(--accent-from)]">
            {initials}
          </span>
          <span className="hidden text-sm sm:inline">{chrome.name}</span>
        </a>

        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(s.id);
                }}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          {shortcut && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
              className="hidden h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
              aria-label="Open command palette"
            >
              <Search className="size-3.5" aria-hidden="true" />
              <kbd className="font-mono">{shortcut}</kbd>
            </button>
          )}
          <RecruiterToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Button asChild size="sm" className="hidden h-9 sm:inline-flex">
            <a
              href="/resume"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("resume_click", { from: "navbar" })}
            >
              Resume <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent side="right" className="max-w-xs p-6">
          <DialogTitle className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Menu</DialogTitle>
          <ul className="mt-6 flex flex-col gap-1">
            {chrome.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    setTimeout(() => scrollToId(s.id), 200);
                  }}
                  className="block rounded-lg px-3 py-3 text-lg font-medium transition-colors hover:bg-surface-2"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <RecruiterToggle className="justify-center" onToggle={() => setOpen(false)} />
            <Button asChild size="lg">
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("resume_click", { from: "menu" })}
              >
                View Resume <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
