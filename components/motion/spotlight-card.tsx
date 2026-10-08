"use client";

import type { ComponentProps, PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** Card whose border glows where the mouse is (CSS-only paint; JS just sets two vars). */
export function SpotlightCard({ className, children, onPointerMove, onPointerLeave, ...props }: ComponentProps<"div">) {
  function move(e: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(e);
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
    e.currentTarget.style.setProperty("--spot-opacity", "1");
  }
  function leave(e: PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(e);
    e.currentTarget.style.setProperty("--spot-opacity", "0");
  }
  return (
    <div
      className={cn("spotlight rounded-2xl border border-border bg-surface/80", className)}
      onPointerMove={move}
      onPointerLeave={leave}
      {...props}
    >
      {children}
    </div>
  );
}
