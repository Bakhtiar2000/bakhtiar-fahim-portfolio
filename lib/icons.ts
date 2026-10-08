import "server-only";
import * as simpleIcons from "simple-icons";

/**
 * Brand icons are served from one cached sprite (/icons.svg) and referenced
 * with <use href="/icons.svg#id">, so the long SVG paths never bloat the HTML
 * or the RSC payload. These helpers only decide which ids exist.
 */

let bySlug: Map<string, string> | null = null;

function index(): Map<string, string> {
  if (bySlug) return bySlug;
  bySlug = new Map();
  for (const value of Object.values(simpleIcons)) {
    if (value && typeof value === "object" && "slug" in value && "path" in value) {
      const icon = value as { slug: string; path: string };
      bySlug.set(icon.slug, icon.path);
    }
  }
  return bySlug;
}

/** Feather-style LinkedIn mark (simple-icons no longer ships one). */
const CUSTOM_PATHS: Record<string, string> = {
  linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
};

function pathFor(id: string): string | null {
  return CUSTOM_PATHS[id] ?? index().get(id) ?? null;
}

/** Sprite id for a simple-icons slug, or null when unknown (render a monogram instead). */
export function iconId(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const id = slug.toLowerCase().trim();
  return pathFor(id) ? id : null;
}

const PLATFORM_SLUGS: Record<string, string> = {
  github: "github",
  linkedin: "linkedin",
  codechef: "codechef",
  codeforces: "codeforces",
  leetcode: "leetcode",
  x: "x",
  twitter: "x",
  facebook: "facebook",
  medium: "medium",
  devto: "devdotto",
  stackoverflow: "stackoverflow",
  hackerrank: "hackerrank",
};

/** Sprite id for a social platform; null means "use a generic lucide icon". */
export function platformIconId(platform: string): string | null {
  return iconId(PLATFORM_SLUGS[platform.toLowerCase()]);
}

/** Builds the sprite for the given ids (unknown ids are skipped). */
export function buildSprite(ids: Iterable<string>): string {
  const symbols = [...new Set(ids)]
    .map((id) => [id, pathFor(id)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null)
    .map(([id, d]) => `<symbol id="${id}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
}
