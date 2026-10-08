"use client";

import { useEffect, useRef } from "react";

/** Fixed grid + soft radial glow that follows the cursor on desktop. */
export function Backdrop() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glow.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
        el.style.opacity = "1";
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div
        className="absolute top-[-20%] left-1/2 h-[60vh] w-[90vw] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--glow), transparent)" }}
      />
      <div
        ref={glow}
        className="absolute inset-0 opacity-0 transition-opacity duration-700"
        style={{ background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 30%), var(--glow), transparent 70%)" }}
      />
    </div>
  );
}
