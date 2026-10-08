"use client";

import { useSyncExternalStore } from "react";

/* ---------- Recruiter Mode (attribute on <html>, persisted per session) ---------- */

const recruiterListeners = new Set<() => void>();

export function setRecruiterMode(on: boolean) {
  const root = document.documentElement;
  if (on) root.setAttribute("data-recruiter", "on");
  else root.removeAttribute("data-recruiter");
  try {
    sessionStorage.setItem("recruiter-mode", on ? "on" : "off");
  } catch {}
  recruiterListeners.forEach((l) => l());
  window.scrollTo({ top: 0 });
}

export function useRecruiterMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      recruiterListeners.add(cb);
      return () => recruiterListeners.delete(cb);
    },
    () => document.documentElement.getAttribute("data-recruiter") === "on",
    () => false,
  );
}

/* ---------- Theme (class on <html>, persisted) ---------- */

const themeListeners = new Set<() => void>();

export function setTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  themeListeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
}

export function useTheme(): "light" | "dark" {
  return useSyncExternalStore(
    (cb) => {
      themeListeners.add(cb);
      return () => themeListeners.delete(cb);
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "dark",
  );
}

/* ---------- Contact prefill ("Discuss this" on a project) ---------- */

export const CONTACT_PREFILL_EVENT = "contact:prefill";

// Kept until the (lazily loaded) contact form picks it up.
let pendingPrefill: string | null = null;

export function prefillContact(subject: string) {
  pendingPrefill = subject;
  window.dispatchEvent(new CustomEvent<string>(CONTACT_PREFILL_EVENT, { detail: subject }));
}

export function takePendingPrefill(): string | null {
  const subject = pendingPrefill;
  pendingPrefill = null;
  return subject;
}

/* ---------- Command palette / terminal open state ---------- */

export const OPEN_PALETTE_EVENT = "palette:open";
export const OPEN_TERMINAL_EVENT = "terminal:open";

/* ---------- Media queries ---------- */

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => serverValue,
  );
}

/** Fine pointer + hover + no reduced motion: where cursor effects make sense. */
export function useFancyPointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
}
