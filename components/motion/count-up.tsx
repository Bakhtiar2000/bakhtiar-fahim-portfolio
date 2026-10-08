"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Counts up to a numeric value when visible. The final value is server-rendered,
 * so it is correct without JS and for screen readers.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const target = Number(value);
  const decimals = value.includes(".") ? value.split(".")[1]!.length : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduced || !Number.isFinite(target)) return;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, reduced, target, decimals]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
