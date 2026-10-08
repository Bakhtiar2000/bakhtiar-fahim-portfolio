"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import type { ArchitectureNode } from "@/lib/types";
import { cn } from "@/lib/utils";

function NodeDetails({ node }: { node: ArchitectureNode }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold">{node.label}</p>
        {node.sublabel && <p className="font-mono text-xs text-subtle-foreground">{node.sublabel}</p>}
      </div>
      {node.description && <p className="leading-relaxed text-muted-foreground">{node.description}</p>}
      {node.contribution && (
        <div className="rounded-lg border border-accent-from/25 bg-accent-from/8 p-3">
          <p className="font-mono text-[11px] tracking-wider text-accent-text uppercase">What I did</p>
          <p className="mt-1 leading-relaxed">{node.contribution}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Original, illustrative architecture diagram (not a product screenshot).
 * Desktop: positioned nodes with connection lines; click a node for details.
 * Mobile: nodes stacked by layer as disclosures.
 */
export function ArchitectureDiagram({ nodes }: { nodes: ArchitectureNode[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const edges = nodes.flatMap((n) => n.connections.filter((c) => byKey.has(c)).map((c) => [n.key, c] as const));
  const isLit = (a: string, b: string) => selected !== null && (a === selected || b === selected);

  const layers = nodes.reduce<Map<string, ArchitectureNode[]>>((acc, n) => {
    const layer = n.layer || "Other";
    acc.set(layer, [...(acc.get(layer) ?? []), n]);
    return acc;
  }, new Map());

  return (
    <>
      {/* Desktop diagram */}
      <div className="relative hidden aspect-[16/8] w-full md:block" role="group" aria-label="System architecture diagram">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
          {edges.map(([a, b]) => {
            const from = byKey.get(a)!;
            const to = byKey.get(b)!;
            const lit = isLit(a, b);
            return (
              <line
                key={`${a}-${b}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                vectorEffect="non-scaling-stroke"
                stroke={lit ? "var(--accent-to)" : "var(--border-strong)"}
                strokeWidth={lit ? 2 : 1.25}
                strokeDasharray="4 6"
                className="animate-[dash_1.2s_linear_infinite] transition-[stroke] duration-300"
                opacity={selected && !lit ? 0.35 : 1}
              />
            );
          })}
        </svg>
        {nodes.map((n) => (
          <Popover key={n.key} open={selected === n.key} onOpenChange={(o) => setSelected(o ? n.key : null)}>
            <PopoverAnchor asChild>
              <button
                type="button"
                onClick={() => setSelected(selected === n.key ? null : n.key)}
                aria-expanded={selected === n.key}
                aria-haspopup="dialog"
                className={cn(
                  "absolute w-[9.5rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl border bg-surface px-3 py-2.5 text-left shadow-lg shadow-black/10 transition-[border-color,box-shadow,opacity,transform] duration-300 hover:-translate-y-[calc(50%+2px)] lg:w-[10.5rem]",
                  selected === n.key
                    ? "border-accent-to shadow-[0_0_30px_-6px_var(--accent-to)]"
                    : "border-border-strong hover:border-accent-from/60",
                  selected &&
                    selected !== n.key &&
                    !byKey.get(selected)?.connections.includes(n.key) &&
                    !n.connections.includes(selected) &&
                    "opacity-50",
                )}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <span className="block text-sm font-medium">{n.label}</span>
                {n.sublabel && (
                  <span className="block truncate font-mono text-[10.5px] text-subtle-foreground">{n.sublabel}</span>
                )}
              </button>
            </PopoverAnchor>
            <PopoverContent className="w-80">
              <NodeDetails node={n} />
            </PopoverContent>
          </Popover>
        ))}
      </div>

      {/* Mobile: stacked layers */}
      <ol className="flex flex-col gap-4 md:hidden" aria-label="System architecture, layer by layer">
        {[...layers.entries()].map(([layer, items]) => (
          <li key={layer}>
            <p className="mb-2 font-mono text-[11px] tracking-widest text-subtle-foreground uppercase">{layer}</p>
            <ul className="flex flex-col gap-2">
              {items.map((n) => {
                const open = selected === n.key;
                return (
                  <li key={n.key} className="rounded-xl border border-border-strong bg-surface">
                    <button
                      type="button"
                      onClick={() => setSelected(open ? null : n.key)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span>
                        <span className="block text-sm font-medium">{n.label}</span>
                        {n.sublabel && <span className="block font-mono text-[11px] text-subtle-foreground">{n.sublabel}</span>}
                      </span>
                      <ChevronDown
                        className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                    {open && (
                      <div className="border-t border-border px-4 py-3 text-sm">
                        <NodeDetails node={n} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
