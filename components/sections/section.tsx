import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface Teaser {
  text: string;
  href: string;
}

export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  teaser,
  className,
  children,
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  teaser?: Teaser | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("container-page scroll-mt-20 py-20 outline-none sm:py-28", className)}
    >
      <Reveal className="mb-10 max-w-3xl sm:mb-14">
        <p className="font-mono text-xs tracking-widest text-accent-text uppercase">
          <span className="text-subtle-foreground">{String(index).padStart(2, "0")} /</span> {eyebrow}
        </p>
        <h2 id={`${id}-heading`} className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">{description}</p>
        )}
      </Reveal>
      {children}
      {teaser && <SectionTeaser {...teaser} />}
    </section>
  );
}

export function SectionTeaser({ text, href }: Teaser) {
  return (
    <div className="mt-16 flex justify-center">
      <a
        href={href}
        className="group inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
      >
        {text}
        <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
      </a>
    </div>
  );
}
