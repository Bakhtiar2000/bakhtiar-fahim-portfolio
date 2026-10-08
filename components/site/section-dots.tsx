"use client";

import { useEffect, useState } from "react";
import { scrollToId } from "@/lib/client/scroll";
import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  label: string;
}

/** Right-edge dot navigator (desktop). Highlights the section in view. */
export function SectionDots({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Section navigator" className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 xl:block">
      <ul className="flex flex-col gap-3">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => scrollToId(s.id)}
              aria-label={`Go to ${s.label}`}
              aria-current={active === s.id ? "true" : undefined}
              className="group relative flex size-4 cursor-pointer items-center justify-center"
            >
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  active === s.id ? "size-2.5 bg-gradient-accent" : "size-1.5 bg-subtle-foreground/60 group-hover:bg-foreground",
                )}
              />
              <span className="pointer-events-none absolute right-6 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] whitespace-nowrap text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {s.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
