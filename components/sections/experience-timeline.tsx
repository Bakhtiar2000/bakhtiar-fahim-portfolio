"use client";

import { ChevronDown, TrendingUp } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ExperienceDTO } from "@/lib/types";
import { cn, formatMonthYear, monthsBetween } from "@/lib/utils";

export interface TimelineEntry extends ExperienceDTO {
  promotionNote: string | null;
}

function duration(e: ExperienceDTO): string | null {
  if (e.isCurrent || !e.endDate) return null;
  const m = monthsBetween(e.startDate, e.endDate);
  if (m <= 0) return null;
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, r && `${r} mo${r > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

export function ExperienceTimeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const [open, setOpen] = useState<Set<string>>(() => new Set(entries.filter((e) => e.isCurrent).map((e) => e.id)));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ol ref={ref} className="relative ml-2 sm:ml-4">
      {/* Track + self-drawing line */}
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-0 w-px bg-border" />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-0 w-px origin-top bg-gradient-to-b from-accent-from to-accent-to"
        style={{ scaleY }}
      />

      {entries.map((e) => {
        const isOpen = open.has(e.id);
        const dur = duration(e);
        return (
          <li key={e.id} className="relative pb-10 pl-8 last:pb-0 sm:pl-12">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-6 left-0 size-3 -translate-x-1/2 rounded-full border-2",
                e.isCurrent ? "border-emerald bg-emerald" : "border-border-strong bg-background",
              )}
            >
              {e.isCurrent && <span className="absolute -inset-0.5 animate-ping rounded-full bg-emerald opacity-50" />}
            </span>
            <motion.article
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "rounded-2xl border bg-surface/80 p-5 sm:p-6",
                e.isCurrent ? "border-accent-from/40 shadow-[0_0_50px_-20px_var(--accent-from)]" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                {e.isCurrent && <Badge variant="success">Current</Badge>}
                {e.promotionNote && (
                  <Badge variant="accent">
                    <TrendingUp className="size-3" aria-hidden="true" /> {e.promotionNote}
                  </Badge>
                )}
                <Badge variant="mono">{e.type}</Badge>
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight sm:text-xl">
                {e.role} <span className="text-muted-foreground">· {e.company}</span>
              </h3>
              <p className="mt-1 font-mono text-xs text-subtle-foreground">
                <time dateTime={e.startDate}>{formatMonthYear(e.startDate)}</time> —{" "}
                {e.isCurrent ? "Present" : <time dateTime={e.endDate ?? undefined}>{formatMonthYear(e.endDate)}</time>}
                {dur && ` · ${dur}`}
                {e.location && ` · ${e.location}`}
              </p>
              {e.summary && <p className="mt-3 leading-relaxed text-muted-foreground">{e.summary}</p>}

              {(e.highlights.length > 0 || e.tech.length > 0) && (
                <>
                  <button
                    type="button"
                    onClick={() => toggle(e.id)}
                    aria-expanded={isOpen}
                    aria-controls={`exp-${e.id}`}
                    className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded-md text-sm font-medium text-accent-text"
                  >
                    {isOpen ? "Hide details" : "Show details"}
                    <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`exp-${e.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        {e.highlights.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {e.highlights.map((h) => (
                              <li key={h} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-to" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                        {e.tech.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech used">
                            {e.tech.map((t) => (
                              <li key={t}>
                                <Badge variant="mono">{t}</Badge>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.article>
          </li>
        );
      })}
    </ol>
  );
}
