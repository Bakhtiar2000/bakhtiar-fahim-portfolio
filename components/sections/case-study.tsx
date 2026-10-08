import { Boxes, Rocket, UserRound } from "lucide-react";
import Image from "next/image";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { ArchitectureDiagram } from "@/components/site/architecture-diagram";
import { DashboardMockup } from "@/components/site/dashboard-mockup";
import { Badge } from "@/components/ui/badge";
import type { CaseStudyDTO } from "@/lib/types";
import { fileUrl } from "@/lib/utils";
import { Section, type Teaser } from "./section";

export function CaseStudySection({
  data,
  id,
  index,
  teaser,
}: {
  data: CaseStudyDTO;
  id: string;
  index: number;
  teaser: Teaser | null;
}) {
  const columns = [
    { icon: Boxes, title: "The product", body: data.product },
    { icon: UserRound, title: "My role", body: data.myRole },
    { icon: Rocket, title: "What I shipped", body: data.shipped },
  ].filter((c) => c.body);
  const [title, subtitle] = data.title.split(" — ");

  return (
    <Section
      id={id}
      index={index}
      eyebrow={data.eyebrow || "Featured case study"}
      title={
        <>
          {title}
          {subtitle && <span className="block text-muted-foreground">{subtitle}</span>}
        </>
      }
      description={data.summary}
      teaser={teaser}
    >
      <RevealGroup className="grid gap-4 md:grid-cols-3">
        {columns.map(({ icon: Icon, title, body }) => (
          <RevealItem key={title} className="h-full">
            <SpotlightCard className="h-full p-6">
              <Icon className="size-5 text-accent-text" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </SpotlightCard>
          </RevealItem>
        ))}
      </RevealGroup>

      {data.shippedChips.length > 0 && (
        <Reveal className="mt-8">
          <h3 className="sr-only">Shipped</h3>
          <ul className="flex flex-wrap gap-2">
            {data.shippedChips.map((chip) => (
              <li key={chip}>
                <Badge variant="outline" className="px-3 py-1 text-[13px]">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-gradient-accent" />
                  {chip}
                </Badge>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {data.architecture.length > 0 && (
        <Reveal className="mt-16">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-xl font-semibold tracking-tight">How it&apos;s built under the hood</h3>
            <p className="font-mono text-xs text-subtle-foreground">
              <span className="hidden md:inline">Click</span>
              <span className="md:hidden">Tap</span> any component for details
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface/60 p-4 sm:p-6 md:p-8">
            <ArchitectureDiagram nodes={data.architecture} />
          </div>
        </Reveal>
      )}

      <Reveal className="mt-16">
        {data.mockupFileIds.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.mockupFileIds.map((fid, i) => (
              <Image
                key={fid}
                src={fileUrl(fid)!}
                alt={`Illustrative interface mockup ${i + 1}`}
                width={1200}
                height={750}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="h-auto w-full rounded-2xl border border-border"
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <DashboardMockup />
          </div>
        )}
      </Reveal>
    </Section>
  );
}
