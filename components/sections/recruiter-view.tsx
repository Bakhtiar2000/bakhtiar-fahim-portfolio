import { ArrowUpRight, Award, Briefcase, GraduationCap, Mail, MapPin } from "lucide-react";
import { plainText } from "@/components/site/highlight";
import { RecruiterExit } from "@/components/site/recruiter-exit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EducationDTO, ExperienceDTO, ProfileDTO } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

/** The "I'm busy" path: everything a recruiter needs on one card. Shown when Recruiter Mode is on. */
export function RecruiterView({
  profile,
  current,
  education,
}: {
  profile: ProfileDTO;
  current: ExperienceDTO | null;
  education: EducationDTO | null;
}) {
  return (
    <section aria-labelledby="recruiter-heading" className="recruiter-view container-page py-8 sm:py-14">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border-strong bg-surface shadow-2xl shadow-black/20">
        <div className="h-1 bg-gradient-accent" />
        <div className="flex flex-col gap-7 p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant={profile.openToWork ? "success" : "default"}>
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${profile.openToWork ? "bg-emerald" : "bg-subtle-foreground"}`}
              />
              {profile.openToWork ? "Open to opportunities" : "Not actively looking"}
            </Badge>
            <span className="font-mono text-xs text-subtle-foreground">⚡ 30-second view</span>
          </div>

          <div>
            <h1 id="recruiter-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{profile.title}</p>
            <p className="mt-4 text-xl font-medium text-balance sm:text-2xl">{plainText(profile.headline)}</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {current && (
              <div className="flex gap-3">
                <Briefcase className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-subtle-foreground">Current role</dt>
                  <dd className="text-sm font-medium">
                    {current.role} · {current.company}
                  </dd>
                  <dd className="font-mono text-xs text-subtle-foreground">Since {formatMonthYear(current.startDate)}</dd>
                </div>
              </div>
            )}
            {education && (
              <div className="flex gap-3">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-subtle-foreground">Education</dt>
                  <dd className="text-sm font-medium">
                    {education.degree.replace("Bachelor of Science", "BSc")}
                    {education.cgpa && ` · CGPA ${education.cgpa}`}
                  </dd>
                  <dd className="font-mono text-xs text-subtle-foreground">
                    {education.startYear}–{education.endYear ?? "Present"}
                  </dd>
                </div>
              </div>
            )}
            {profile.location && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-subtle-foreground">Location</dt>
                  <dd className="text-sm font-medium">
                    {profile.location}
                    {profile.workPreference && <span className="block text-muted-foreground">{profile.workPreference}</span>}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          {profile.topSkills.length > 0 && (
            <div>
              <h2 className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Top skills</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.topSkills.slice(0, 8).map((s) => (
                  <li key={s}>
                    <Badge variant="outline" className="px-3 py-1 text-[13px]">
                      {s}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.keyAchievements.length > 0 && (
            <div>
              <h2 className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Key achievements</h2>
              <ul className="mt-3 space-y-2">
                {profile.keyAchievements.slice(0, 3).map((a) => (
                  <li key={a} className="flex gap-3 text-sm">
                    <Award className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button asChild size="lg">
              <a href="/resume" target="_blank" rel="noopener noreferrer">
                View Resume <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={`mailto:${profile.email}`}>
                <Mail aria-hidden="true" /> Contact
              </a>
            </Button>
            <RecruiterExit />
          </div>
        </div>
      </div>
    </section>
  );
}
