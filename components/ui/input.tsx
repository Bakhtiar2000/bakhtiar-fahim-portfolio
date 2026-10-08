import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-subtle-foreground transition-colors focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/40 disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-24 py-2 leading-relaxed", className)} {...props} />;
}

export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(field, "h-10 cursor-pointer", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}
