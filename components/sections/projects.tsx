import type { ProjectDTO } from "@/lib/types";
import { ProjectsGrid } from "./projects-grid";
import { Section, type Teaser } from "./section";

export function ProjectsSection({
  projects,
  id,
  index,
  teaser,
  contactId,
}: {
  projects: ProjectDTO[];
  id: string;
  index: number;
  teaser: Teaser | null;
  contactId: string | null;
}) {
  if (projects.length === 0) return null;
  const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
  return (
    <Section
      id={id}
      index={index}
      eyebrow="Projects"
      title="Shipped for clients, end to end."
      description="Role-based platforms with payments, real-time features and typed APIs. Open any card for the full breakdown."
      teaser={teaser}
    >
      <ProjectsGrid projects={sorted} contactId={contactId} />
    </Section>
  );
}
