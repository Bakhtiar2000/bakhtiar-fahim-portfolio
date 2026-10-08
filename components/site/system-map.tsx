"use client";

import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { useMediaQuery } from "@/lib/client/stores";
import { cn } from "@/lib/utils";
import { BrandIcon } from "./brand-icon";

export interface MapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  iconId: string | null;
}

/** Edges of the stack graph: [from, to, packet duration (s) or 0 for none]. */
const EDGES: [string, string, number][] = [
  ["angular", "dotnet", 3.2],
  ["angular", "keycloak", 0],
  ["react", "nextjs", 2.6],
  ["nextjs", "dotnet", 3.6],
  ["keycloak", "dotnet", 2.9],
  ["dotnet", "kafka", 2.4],
  ["dotnet", "postgres", 3.0],
  ["dotnet", "grpc", 2.2],
  ["kafka", "postgres", 3.4],
  ["grpc", "docker", 0],
  ["docker", "postgres", 0],
];

/**
 * Animated "system map" of the stack: glowing nodes, connecting lines and data
 * packets. Hover or focus a node to highlight its connections. On touch or small
 * screens (and with reduced motion) it stays a lightweight static picture.
 */
export function SystemMap({ nodes, className }: { nodes: MapNode[]; className?: string }) {
  const reduced = useReducedMotion();
  const interactive = useMediaQuery("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const [active, setActive] = useState<string | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const animate = interactive && !reduced;

  const connected = (id: string) => new Set(EDGES.filter(([a, b]) => a === id || b === id).flatMap(([a, b]) => [a, b]));
  const lit = active ? connected(active) : null;

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="edge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-from)" />
            <stop offset="100%" stopColor="var(--accent-to)" />
          </linearGradient>
          <radialGradient id="packet-grad">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="60%" stopColor="var(--accent-to)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {EDGES.map(([a, b, dur]) => {
          const from = byId.get(a);
          const to = byId.get(b);
          if (!from || !to) return null;
          const on = lit ? lit.has(a) && lit.has(b) && (a === active || b === active) : false;
          const path = `M${from.x},${from.y} L${to.x},${to.y}`;
          return (
            <g key={`${a}-${b}`}>
              <path
                d={path}
                stroke={on ? "url(#edge-grad)" : "var(--border-strong)"}
                strokeWidth={on ? 1.6 : 1}
                strokeDasharray={on ? undefined : "3 5"}
                fill="none"
                className="transition-[stroke,opacity] duration-300"
                opacity={lit && !on ? 0.25 : 1}
              />
              {animate && dur > 0 && (
                <circle r={on ? 3.5 : 2.5} fill="url(#packet-grad)" opacity={lit && !on ? 0.2 : 1}>
                  <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {nodes.map((n) => {
        const dim = lit ? !lit.has(n.id) : false;
        const isActive = active === n.id;
        const className = cn(
          "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl transition-[opacity,transform] duration-300",
          interactive && "cursor-default",
          dim && "opacity-30",
          isActive && "scale-110",
        );
        const style = { left: `${(n.x / 400) * 100}%`, top: `${(n.y / 400) * 100}%` };
        const body = (
          <>
            <span
              className={cn(
                "grid size-11 place-items-center rounded-xl border bg-surface shadow-lg transition-[border-color,box-shadow] duration-300 sm:size-12",
                isActive ? "border-accent-to shadow-[0_0_28px_-4px_var(--accent-to)]" : "border-border-strong shadow-black/20",
              )}
            >
              {n.iconId ? (
                <BrandIcon id={n.iconId} className="size-5 text-foreground" />
              ) : (
                <span className="font-mono text-[10px] font-bold">{n.label.slice(0, 4)}</span>
              )}
            </span>
            <span className="rounded-md bg-background/70 px-1.5 font-mono text-[10px] whitespace-nowrap text-muted-foreground sm:text-[11px]">
              {n.label}
            </span>
          </>
        );
        return interactive ? (
          <button
            key={n.id}
            type="button"
            className={className}
            style={style}
            onPointerEnter={() => setActive(n.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(n.id)}
            onBlur={() => setActive(null)}
            aria-label={`${n.label}: highlight connections`}
          >
            {body}
          </button>
        ) : (
          <div key={n.id} className={className} style={style}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
