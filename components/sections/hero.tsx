import { MapPin } from "lucide-react";
import { Greeting } from "@/components/site/greeting";
import { HeroCtas } from "@/components/site/hero-ctas";
import { Highlight } from "@/components/site/highlight";
import { LiveDot } from "@/components/site/live-dot";
import { SocialIcon } from "@/components/site/social-icon";
import { SystemMap, type MapNode } from "@/components/site/system-map";
import type { SocialItem } from "@/components/site/types";
import { TypingRoles } from "@/components/motion/typing-roles";
import { iconId } from "@/lib/icons";
import type { ProfileDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAP_LAYOUT: { id: string; label: string; slug: string; x: number; y: number }[] = [
  { id: "angular", label: "Angular", slug: "angular", x: 70, y: 92 },
  { id: "react", label: "React", slug: "react", x: 52, y: 222 },
  { id: "nextjs", label: "Next.js", slug: "nextdotjs", x: 110, y: 334 },
  { id: "keycloak", label: "Keycloak", slug: "keycloak", x: 205, y: 40 },
  { id: "dotnet", label: ".NET", slug: "dotnet", x: 212, y: 196 },
  { id: "grpc", label: "gRPC", slug: "", x: 214, y: 342 },
  { id: "kafka", label: "Kafka", slug: "apachekafka", x: 340, y: 104 },
  { id: "postgres", label: "PostgreSQL", slug: "postgresql", x: 348, y: 250 },
  { id: "docker", label: "Docker", slug: "docker", x: 326, y: 368 },
];

export function Hero({
  profile,
  socials,
  workId,
  contactId,
}: {
  profile: ProfileDTO;
  socials: SocialItem[];
  workId: string | null;
  contactId: string | null;
}) {
  const nodes: MapNode[] = MAP_LAYOUT.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, iconId: iconId(n.slug) }));
  const firstName = profile.name.split(" ").slice(-1)[0];

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative container-page pt-6 pb-12 sm:pt-14 lg:pt-20">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-5 sm:gap-6">
          {profile.statusText && (
            <p
              className={cn(
                "inline-flex w-fit max-w-full items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs sm:rounded-full sm:text-sm",
                profile.openToWork
                  ? "border-emerald/30 bg-emerald-bg text-foreground"
                  : "border-border bg-surface text-muted-foreground",
              )}
            >
              <LiveDot live={profile.openToWork} />
              <span>{profile.statusText}</span>
              <span className="sr-only">{profile.openToWork ? " — open to opportunities" : " — not looking right now"}</span>
            </p>
          )}

          <div>
            <p className="font-mono text-sm text-muted-foreground">
              <Greeting /> — I&apos;m {profile.name}.
            </p>
            <h1
              id="hero-heading"
              className="mt-3 text-[clamp(2.5rem,7.5vw,5.25rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
            >
              <Highlight text={profile.headline} />
            </h1>
          </div>

          <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {profile.subHeadline}
          </p>

          {profile.rotatingRoles.length > 0 && (
            <p className="flex items-center gap-2 text-sm sm:text-base" aria-label={`Roles: ${profile.rotatingRoles.join(", ")}`}>
              <span aria-hidden="true" className="font-mono text-subtle-foreground">
                &gt;_
              </span>
              <TypingRoles roles={profile.rotatingRoles} />
            </p>
          )}

          <HeroCtas workId={workId} contactId={contactId} />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            <ul className="flex items-center gap-1" aria-label="Profiles">
              {socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target={s.url.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label || s.platform}
                    className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <SocialIcon platform={s.platform} iconId={s.iconId} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
            {profile.location && (
              <p className="flex items-center gap-1.5 text-sm text-subtle-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {profile.location}
                {profile.workPreference && <span className="hidden sm:inline">· {profile.workPreference}</span>}
              </p>
            )}
          </div>
        </div>

        <div
          className="relative mx-auto w-full max-w-[340px] lg:max-w-[460px]"
          aria-label={`${firstName}'s stack, as a system map`}
          role="group"
        >
          <SystemMap nodes={nodes} />
        </div>
      </div>
    </section>
  );
}
