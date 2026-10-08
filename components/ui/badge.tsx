import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-muted-foreground",
        accent: "border-accent-from/30 bg-accent-from/10 text-accent-text",
        success: "border-emerald/30 bg-emerald-bg text-emerald",
        outline: "border-border-strong text-foreground",
        mono: "border-border bg-surface font-mono text-[11px] text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
