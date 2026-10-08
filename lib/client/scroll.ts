"use client";

import type Lenis from "lenis";

const globalForLenis = globalThis as typeof globalThis & { __lenis?: Lenis | null };

export function setLenis(instance: Lenis | null) {
  globalForLenis.__lenis = instance;
}

/** Smooth-scrolls to a section, through Lenis when it is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = globalForLenis.__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  // Move focus for keyboard and screen-reader users without a second jump.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

export function scrollToTop() {
  const lenis = globalForLenis.__lenis;
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}
