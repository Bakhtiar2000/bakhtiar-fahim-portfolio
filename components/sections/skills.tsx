import { iconId } from "@/lib/icons";
import type { ExperienceDTO, ProjectDTO, SkillGroupDTO } from "@/lib/types";
import { normalizeTech } from "@/lib/utils";
import { Section, type Teaser } from "./section";
import { SkillsGrid, type SkillTile } from "./skills-grid";

/** Links each skill to the roles and projects whose tech tags mention it (or one of its aliases). */
function buildTiles(groups: SkillGroupDTO[], experience: ExperienceDTO[], projects: ProjectDTO[]): SkillTile[] {
  const sources = [
    ...experience.map((e) => ({ kind: "experience" as const, label: `${e.role} · ${e.company}`, tech: e.tech })),
    ...projects.map((p) => ({ kind: "project" as const, label: p.title, tech: p.tech })),
  ].map((s) => ({ ...s, keys: new Set(s.tech.map(normalizeTech).filter(Boolean)) }));

  return groups.flatMap((g) =>
    g.skills.map((s) => {
      const names = [s.name, ...s.aliases].map(normalizeTech).filter(Boolean);
      const usedIn = sources.filter((src) => names.some((n) => src.keys.has(n))).map(({ kind, label }) => ({ kind, label }));
      return { name: s.name, group: g.name, level: s.level, iconId: iconId(s.icon), usedIn };
    }),
  );
}

export function SkillsSection({
  groups,
  experience,
  projects,
  id,
  index,
  teaser,
}: {
  groups: SkillGroupDTO[];
  experience: ExperienceDTO[];
  projects: ProjectDTO[];
  id: string;
  index: number;
  teaser: Teaser | null;
}) {
  if (groups.length === 0) return null;
  return (
    <Section
      id={id}
      index={index}
      eyebrow="Skills"
      title="The toolbox, grouped by where it lives."
      description="Hover a group to light up its tools. Click any skill to see where I've used it — no made-up percentage bars."
      teaser={teaser}
    >
      <SkillsGrid groups={groups.map((g) => g.name)} tiles={buildTiles(groups, experience, projects)} />
    </Section>
  );
}
