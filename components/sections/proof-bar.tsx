import { CountUp } from "@/components/motion/count-up";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { StatDTO } from "@/lib/types";

export function ProofBar({ stats }: { stats: StatDTO[] }) {
  if (stats.length === 0) return null;
  return (
    <section aria-label="Highlights" className="container-page pb-6">
      {/* gap-px over a border-coloured background draws hairline dividers; flex rows always fill. */}
      <RevealGroup className="flex flex-wrap gap-px overflow-hidden rounded-2xl border border-border bg-border">
        {stats.map((s) => {
          const numeric = /^\d+(\.\d+)?$/.test(s.value);
          return (
            <RevealItem key={s.id} className="flex flex-[1_1_150px] flex-col gap-1 bg-surface p-5 sm:p-6">
              <p className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                {s.prefix}
                {numeric ? <CountUp value={s.value} /> : <span className="text-gradient">{s.value}</span>}
                {s.suffix && <span className="text-accent-text">{s.suffix}</span>}
              </p>
              <p className="text-sm leading-snug text-muted-foreground">{s.label}</p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
