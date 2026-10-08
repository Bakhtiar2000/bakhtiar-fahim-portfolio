"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  side,
  hideClose,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: "center" | "right"; hideClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=open]:animate-in fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogPrimitive.Content
        data-lenis-prevent
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto border border-border-strong bg-surface text-foreground shadow-2xl outline-none",
          side === "right"
            ? "inset-y-0 right-0 h-dvh w-full max-w-xl border-y-0 border-r-0"
            : "top-1/2 left-1/2 max-h-[min(90dvh,860px)] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute top-3 right-3 z-10 grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
