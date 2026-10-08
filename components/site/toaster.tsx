"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      theme="system"
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          border: "1px solid var(--border-strong)",
        },
      }}
    />
  );
}
