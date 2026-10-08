"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_PALETTE_EVENT, OPEN_TERMINAL_EVENT } from "@/lib/client/stores";
import type { TerminalData } from "./terminal";
import type { SiteChrome } from "./types";

const loadPalette = () => import("./command-palette");
const loadTerminal = () => import("./terminal");
const CommandPalette = dynamic(() => loadPalette().then((m) => m.CommandPalette), { ssr: false });
const Terminal = dynamic(() => loadTerminal().then((m) => m.Terminal), { ssr: false });

/**
 * The command palette and terminal are not needed for first paint, so their code
 * (cmdk, dialogs) loads on first use — or quietly once the browser is idle.
 */
export function LazyChrome({ chrome, terminal }: { chrome: SiteChrome; terminal: TerminalData }) {
  const [palette, setPalette] = useState<"idle" | "mounted" | "open">("idle");
  const [term, setTerm] = useState<"idle" | "open">("idle");

  useEffect(() => {
    if (palette !== "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette("open");
      }
    };
    const onOpen = () => setPalette("open");
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    // Warm up (and attach the real shortcut handler) once the page is idle.
    const idle = "requestIdleCallback" in window ? requestIdleCallback(() => setPalette("mounted"), { timeout: 6000 }) : null;
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
      if (idle !== null) cancelIdleCallback(idle);
    };
  }, [palette]);

  useEffect(() => {
    if (term !== "idle") return;
    const onOpen = () => setTerm("open");
    window.addEventListener(OPEN_TERMINAL_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, onOpen);
  }, [term]);

  return (
    <>
      {palette !== "idle" && <CommandPalette chrome={chrome} defaultOpen={palette === "open"} />}
      {term === "open" && <Terminal data={terminal} defaultOpen />}
    </>
  );
}
