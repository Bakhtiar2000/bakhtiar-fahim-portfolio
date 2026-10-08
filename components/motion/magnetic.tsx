"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useFancyPointer } from "@/lib/client/stores";

/** Pulls its child slightly toward the cursor. Desktop + motion-OK only. */
export function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const enabled = useFancyPointer();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  if (!enabled) return <span className="inline-flex">{children}</span>;

  function move(e: PointerEvent<HTMLSpanElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span className="inline-flex" style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}
