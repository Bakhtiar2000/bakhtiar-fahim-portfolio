"use client";

import { Briefcase, FolderGit2 } from "lucide-react";
import { useRef, useState } from "react";
import { BrandIcon } from "@/components/site/brand-icon";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import type { SkillLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SkillTile {
  name: string;
  group: string;
  level: SkillLevel;
  iconId: string | null;
  usedIn: { kind: "experience" | "project"; label: string }[];
}

const LEVEL_STYLE: Record<SkillLevel, { dot: string; hint: string }> = {
  Daily: { dot: "bg-emerald", hint: "Used daily" },
  Production: { dot: "bg-accent-from", hint: "Shipped to production" },
  Familiar: {
    dot: "bg-subtle-foreground",
    hint: "Comfortable, used on projects",
  },
};

export function SkillsGrid({ groups, tiles }: { groups: string[]; tiles: SkillTile[] }) {
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null);
  const activeGroup = hoverGroup ?? pinnedGroup;
  const [selected, setSelected] = useState<number | null>(null);
  const anchor = useRef<HTMLButtonElement | null>(null);
  const current = selected === null ? null : (tiles[selected] ?? null);

  const open = (index: number, el: HTMLButtonElement) => {
    anchor.current = el;
    setSelected(selected === index ? null : index);
  };
  const close = () => setSelected(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <div>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label="Skill groups">
          {groups.map((g) => {
            const count = tiles.filter((t) => t.group === g).length;
            const active = activeGroup === g;
            return (
              <li key={g}>
                <button
                  type="button"
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHoverGroup(g)}
                  onPointerLeave={() => setHoverGroup(null)}
                  onFocus={() => setHoverGroup(g)}
                  onBlur={() => setHoverGroup(null)}
                  onClick={() => setPinnedGroup(pinnedGroup === g ? null : g)}
                  aria-pressed={pinnedGroup === g}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "border-accent-from/50 bg-accent-from/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground lg:border-transparent",
                  )}
                >
                  {g}
                  <span className="font-mono text-xs text-subtle-foreground">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <dl className="mt-6 hidden space-y-2 lg:block">
          {(Object.keys(LEVEL_STYLE) as SkillLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-2 text-xs text-subtle-foreground">
              <span aria-hidden="true" className={cn("size-2 rounded-full", LEVEL_STYLE[level].dot)} />
              <dt className="font-mono text-foreground">{level}</dt>
              <dd>— {LEVEL_STYLE[level].hint.toLowerCase()}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" aria-label="Skills">
        {tiles.map((t, i) => {
          const dim = activeGroup !== null && activeGroup !== t.group;
          const isOpen = selected === i;
          return (
            <li key={`${t.group}-${t.name}`} className={cn("transition-opacity duration-300", dim && "opacity-25")}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={(e) => open(i, e.currentTarget)}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-surface/80 px-3 py-3 text-left transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-border-strong",
                  activeGroup === t.group || isOpen ? "border-accent-from/40" : "border-border",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2">
                  {t.iconId ? (
                    <BrandIcon id={t.iconId} className="text-foreground" />
                  ) : (
                    <span aria-hidden="true" className="font-mono text-[10px] font-bold">
                      {t.name.replace(/[^A-Za-z0-9#+]/g, "").slice(0, 3)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.name}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-subtle-foreground">
                    <span aria-hidden="true" className={cn("size-1.5 rounded-full", LEVEL_STYLE[t.level].dot)} />
                    {t.level}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* One popover shared by every tile, anchored to whichever tile was clicked. */}
      <Popover open={current !== null} onOpenChange={(o) => !o && close()}>
        <PopoverAnchor virtualRef={anchor} />
        {current && (
          <PopoverContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              anchor.current?.focus();
            }}
          >
            <p className="font-semibold">{current.name}</p>
            <p className="text-xs text-subtle-foreground">
              {current.group} · {LEVEL_STYLE[current.level].hint}
            </p>
            <p className="mt-3 font-mono text-[11px] tracking-wider text-accent-text uppercase">Where I used it</p>
            {current.usedIn.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {current.usedIn.map((u) => (
                  <li key={`${u.kind}-${u.label}`} className="flex items-start gap-2 text-sm">
                    {u.kind === "experience" ? (
                      <Briefcase className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground" aria-hidden="true" />
                    ) : (
                      <FolderGit2 className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground" aria-hidden="true" />
                    )}
                    {u.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Coursework, competitive programming and side projects.</p>
            )}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
