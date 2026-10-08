import { cn } from "@/lib/utils";

/** Status dot with a pulsing ring (transform/opacity only, so it stays on the compositor). */
export function LiveDot({ live = true, className }: { live?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex size-2 shrink-0", className)}>
      {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />}
      <span className={cn("relative inline-flex size-2 rounded-full", live ? "bg-emerald" : "bg-subtle-foreground")} />
    </span>
  );
}
