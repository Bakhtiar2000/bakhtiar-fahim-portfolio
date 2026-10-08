"use client";

import { useSyncExternalStore } from "react";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late? Hi";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Uses the visitor's local time; the server renders a neutral "Hi". */
export function Greeting() {
  const text = useSyncExternalStore(
    () => () => {},
    greeting,
    () => "Hi",
  );
  return <>{text}</>;
}
