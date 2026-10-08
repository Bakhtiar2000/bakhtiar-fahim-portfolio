import { ArrowUpRight, Award, Star } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { BrandIcon } from "@/components/site/brand-icon";
import { Badge } from "@/components/ui/badge";
import { getCodeforcesStats } from "@/lib/codeforces";
import type { AchievementDTO, SiteSettingsDTO } from "@/lib/types";
import { formatMonthYear, isSafeHref } from "@/lib/utils";
import { Section, type Teaser } from "./section";

const CF_RANK_COLOR: Record<string, string> = {
  newbie: "text-subtle-foreground",
  pupil: "text-emerald",
  specialist: "text-cyan-700 dark:text-cyan-400",
  expert: "text-blue-700 dark:text-blue-400",
  "candidate master": "text-violet-700 dark:text-violet-400",
  master: "text-orange-700 dark:text-orange-400",
  "international master": "text-orange-700 dark:text-orange-400",
  grandmaster: "text-red-700 dark:text-red-400",
};

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-subtle-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-xl font-semibold">{value ?? "—"}</dd>
    </div>
  );
}

function BrandMark({ slug }: { slug: string }) {
  return <BrandIcon id={slug} className="size-5 text-foreground" />;
}

export async function CompetitiveSection({
  settings,
  achievements,
  id,
  index,
  teaser,
}: {
  settings: SiteSettingsDTO;
  achievements: AchievementDTO[];
  id: string;
  index: number;
  teaser: Teaser | null;
}) {
  const cfHandle = settings.codeforcesHandle;
  const cf = cfHandle ? await getCodeforcesStats(cfHandle, settings.codeforcesFallback) : null;
  const cc = settings.codechefData;
  const showCf = cf && (cf.live || cf.data.rating !== null || cf.data.solved !== null);
  const showCc = settings.codechefHandle && (cc.rating !== null || cc.solved !== null || cc.stars !== null);

  if (!showCf && !showCc && achievements.length === 0) return null;

  return (
    <Section
      id={id}
      index={index}
      eyebrow="Competitive programming & achievements"
      title="Problem solving, under a timer."
      description="Contests keep my fundamentals sharp — data structures, algorithms and staying calm when the clock is running."
      teaser={teaser}
    >
      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showCf && cf && (
          <RevealItem>
            <SpotlightCard className="h-full p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BrandMark slug="codeforces" />
                  <h3 className="font-semibold">Codeforces</h3>
                </div>
                {cf.live && (
                  <Badge variant="success">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald" /> Live
                  </Badge>
                )}
              </div>
              {cf.data.rank && (
                <p className={`mt-4 text-sm font-medium capitalize ${CF_RANK_COLOR[cf.data.rank.toLowerCase()] ?? ""}`}>
                  {cf.data.rank}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-3 gap-3">
                <Metric label="Rating" value={cf.data.rating} />
                <Metric label="Max" value={cf.data.maxRating} />
                <Metric label="Solved" value={cf.data.solved} />
              </dl>
              <a
                href={`https://codeforces.com/profile/${encodeURIComponent(cfHandle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1 font-mono text-xs text-accent-text hover:underline"
              >
                @{cfHandle} <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
            </SpotlightCard>
          </RevealItem>
        )}

        {showCc && (
          <RevealItem>
            <SpotlightCard className="h-full p-6">
              <div className="flex items-center gap-2">
                <BrandMark slug="codechef" />
                <h3 className="font-semibold">CodeChef</h3>
              </div>
              {cc.stars !== null && (
                <p
                  className="mt-4 flex items-center gap-0.5 text-amber-600 dark:text-amber-400"
                  aria-label={`${cc.stars} star${cc.stars === 1 ? "" : "s"}`}
                >
                  {Array.from({ length: cc.stars }, (_, i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-3 gap-3">
                <Metric label="Rating" value={cc.rating} />
                <Metric label="Highest" value={cc.highestRating} />
                <Metric label="Solved" value={cc.solved} />
              </dl>
              <a
                href={`https://www.codechef.com/users/${encodeURIComponent(settings.codechefHandle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1 font-mono text-xs text-accent-text hover:underline"
              >
                @{settings.codechefHandle} <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
            </SpotlightCard>
          </RevealItem>
        )}

        {achievements.map((a) => (
          <RevealItem key={a.id}>
            <SpotlightCard className="h-full p-6">
              <div className="flex items-center justify-between gap-2">
                <Award className="size-5 text-accent-text" aria-hidden="true" />
                {a.date && (
                  <time dateTime={a.date} className="font-mono text-xs text-subtle-foreground">
                    {formatMonthYear(a.date)}
                  </time>
                )}
              </div>
              <h3 className="mt-4 font-semibold">{a.title}</h3>
              {a.event && <p className="mt-1 text-sm text-accent-text">{a.event}</p>}
              {a.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>}
              {a.link && isSafeHref(a.link) && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-accent-text hover:underline"
                >
                  Details <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              )}
            </SpotlightCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
