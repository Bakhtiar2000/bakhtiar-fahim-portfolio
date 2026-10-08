"use client";

import { ArrowUp, SquareTerminal } from "lucide-react";
import { scrollToTop } from "@/lib/client/scroll";
import { OPEN_TERMINAL_EVENT } from "@/lib/client/stores";

const btn =
  "grid size-10 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground";

export function FooterActions() {
  return (
    <>
      <button
        type="button"
        className={btn}
        aria-label="Open terminal"
        title=">_ try it"
        onClick={() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT))}
      >
        <SquareTerminal className="size-4" aria-hidden="true" />
      </button>
      <button type="button" className={btn} aria-label="Back to top" onClick={scrollToTop}>
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
    </>
  );
}
