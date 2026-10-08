"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { setLenis } from "@/lib/client/scroll";

/** Smooth scrolling + global motion preferences for the public site. */
export function SiteProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Smooth wheel scrolling only matters for mouse/trackpad users; touch keeps native scrolling.
    if (!matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let lenis: import("lenis").default | null = null;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -72 } });
      setLenis(lenis);
    });
    return () => {
      cancelled = true;
      setLenis(null);
      lenis?.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
