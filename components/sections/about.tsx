import { GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { Badge } from "@/components/ui/badge";
import type { EducationDTO, ProfileDTO } from "@/lib/types";
import { fileUrl } from "@/lib/utils";
import { Section, type Teaser } from "./section";

export function AboutSection({
  profile,
  education,
  id,
  index,
  teaser,
}: {
  profile: ProfileDTO;
  education: EducationDTO[];
  id: string;
  index: number;
  teaser: Teaser | null;
}) {
  const photo = fileUrl(profile.photoFileId);
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("");

  return (
    <Section id={id} index={index} eyebrow="About" title="The person behind the commits." teaser={teaser}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <Reveal>
          <Tilt className="mx-auto w-full max-w-xs">
            <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface shadow-2xl shadow-black/20">
              {photo ? (
                <Image
                  src={photo}
                  alt={`Portrait of ${profile.name}`}
                  width={640}
                  height={800}
                  sizes="320px"
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
              ) : (
                <div aria-hidden="true" className="relative grid aspect-[4/5] place-items-center">
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, var(--accent-from), transparent 55%), radial-gradient(circle at 80% 90%, var(--accent-to), transparent 50%)",
                    }}
                  />
                  <span className="relative font-mono text-7xl font-bold tracking-tighter text-white/90">{initials}</span>
                </div>
              )}
              <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-white backdrop-blur-md">
                <p className="text-sm font-semibold">{profile.name}</p>
                <p className="text-xs text-white/80">{profile.title}</p>
              </div>
            </div>
          </Tilt>
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal>
            <div className="prose-rich max-w-2xl text-base sm:text-lg" dangerouslySetInnerHTML={{ __html: profile.aboutHtml }} />
          </Reveal>

          {(profile.location || profile.workPreference) && (
            <Reveal>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-accent-text" aria-hidden="true" />
                {[profile.location && `Based in ${profile.location.split(",")[0]}`, profile.workPreference]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Reveal>
          )}

          {education.map((ed) => (
            <Reveal key={ed.id}>
              <div className="flex gap-4 rounded-2xl border border-border bg-surface/80 p-5 sm:p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-from/10 text-accent-text">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{ed.degree}</h3>
                  <p className="text-sm text-muted-foreground">{ed.institution}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-subtle-foreground">
                    {ed.startYear}–{ed.endYear ?? "Present"}
                    {ed.cgpa && <Badge variant="accent">CGPA {ed.cgpa}</Badge>}
                  </p>
                  {ed.notes && <p className="mt-2 text-sm text-muted-foreground">{ed.notes}</p>}
                </div>
              </div>
            </Reveal>
          ))}

          {profile.softSkills.length > 0 && (
            <Reveal>
              <h3 className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">How I work</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.softSkills.map((s) => (
                  <li key={s}>
                    <Badge className="px-3 py-1 text-[13px]">{s}</Badge>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </Section>
  );
}
