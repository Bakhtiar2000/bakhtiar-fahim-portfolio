import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** "Sep 2025" — UTC so server and client always agree. */
export function formatMonthYear(iso: string | null): string {
  return iso ? monthYear.format(new Date(iso)) : "";
}

export function formatDate(iso: string | null): string {
  return iso
    ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso))
    : "";
}

export function monthsBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
}

/** "React.js", "ReactJS" and "react" all normalize to "react". */
export function normalizeTech(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.js$|js$/, "")
    .replace(/[^a-z0-9#+]/g, "");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function fileUrl(id: string | null | undefined): string | null {
  return id ? `/api/files/${id}` : null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** True for a safe external/relative link (blocks javascript: and data: URLs). */
export function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href.trim());
}
