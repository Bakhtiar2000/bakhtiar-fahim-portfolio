import type { ExperienceDTO } from "@/lib/types";
import { monthsBetween } from "@/lib/utils";
import { ExperienceTimeline, type TimelineEntry } from "./experience-timeline";
import { Section, type Teaser } from "./section";

/** "Promoted in 3 months": time from the previous role at the same company. */
function withPromotionNotes(items: ExperienceDTO[]): TimelineEntry[] {
  return items.map((e) => {
    if (!e.promoted) return { ...e, promotionNote: null };
    const previous = items
      .filter((o) => o.id !== e.id && o.company === e.company && o.startDate < e.startDate)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    if (!previous) return { ...e, promotionNote: "Promoted" };
    const months = monthsBetween(previous.startDate, e.startDate);
    return { ...e, promotionNote: months > 0 ? `Promoted in ${months} month${months === 1 ? "" : "s"}` : "Promoted" };
  });
}

export function ExperienceSection({
  items,
  id,
  index,
  teaser,
}: {
  items: ExperienceDTO[];
  id: string;
  index: number;
  teaser: Teaser | null;
}) {
  if (items.length === 0) return null;
  return (
    <Section
      id={id}
      index={index}
      eyebrow="Experience"
      title="Shipping in production, moving up the stack."
      description="Each role added a layer — backend leadership, an enterprise frontend, and now the distributed services behind it."
      teaser={teaser}
    >
      <div className="max-w-3xl">
        <ExperienceTimeline entries={withPromotionNotes(items)} />
      </div>
    </Section>
  );
}
