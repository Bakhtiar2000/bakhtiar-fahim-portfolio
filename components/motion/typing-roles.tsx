"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Types and deletes each role in turn. Reduced motion: cross-fades whole words instead. */
export function TypingRoles({ roles }: { roles: string[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(roles[0] ?? "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (roles.length < 2) return;
    const full = roles[index % roles.length]!;
    if (reduced) {
      const t = setTimeout(() => {
        const next = (index + 1) % roles.length;
        setIndex(next);
        setText(roles[next]!);
      }, 2600);
      return () => clearTimeout(t);
    }
    let delay = deleting ? 35 : 70;
    if (!deleting && text === full) delay = 1700;
    if (deleting && text === "") delay = 250;
    const t = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setIndex((i) => (i + 1) % roles.length);
      } else setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index, roles, reduced]);

  return (
    <span className="font-mono text-accent-text">
      <span className="sr-only">{roles.join(", ")}</span>
      <span aria-hidden="true">
        {text}
        <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-blink bg-current" />
      </span>
    </span>
  );
}
