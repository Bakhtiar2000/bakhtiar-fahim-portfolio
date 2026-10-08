import { cn } from "@/lib/utils";

/** A brand mark from the /icons.svg sprite. Inherits the text colour. */
export function BrandIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4 fill-current", className)}>
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}
