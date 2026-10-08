"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useFancyPointer } from "@/lib/client/stores";

/** Subtle 3D tilt toward the cursor (desktop, motion-OK only). */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const enabled = useFancyPointer();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });

  function move(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
