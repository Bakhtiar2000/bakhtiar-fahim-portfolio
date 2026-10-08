"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border-strong bg-surface-2 p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent data-[state=checked]:bg-gradient-accent",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4.5 rounded-full bg-foreground shadow transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-white" />
    </SwitchPrimitive.Root>
  );
}
