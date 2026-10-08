import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CopyEmailButton } from "@/components/site/copy-email";
import { SocialIcon } from "@/components/site/social-icon";
import type { SocialItem } from "@/components/site/types";
import { Button } from "@/components/ui/button";
import type { ProfileDTO } from "@/lib/types";
import { LazyContactForm } from "./lazy-contact-form";
import { Section } from "./section";

export function ContactSection({
  profile,
  socials,
  id,
  index,
}: {
  profile: ProfileDTO;
  socials: SocialItem[];
  id: string;
  index: number;
}) {
  const linkedin = socials.find((s) => s.platform === "linkedin");
  return (
    <Section
      id={id}
      index={index}
      eyebrow="Contact"
      title={
        <>
          Have a role or a project in mind? <span className="text-gradient">Let&apos;s talk.</span>
        </>
      }
      description={
        profile.openToWork
          ? "I'm open to new opportunities. I usually reply within a day."
          : "Not actively looking right now, but always happy to talk shop."
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <Reveal>
          <div className="rounded-2xl border border-border bg-surface/80 p-5 sm:p-8">
            <LazyContactForm />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Or reach me directly</p>
          <Button asChild variant="secondary" size="lg" className="justify-start">
            <a href={`mailto:${profile.email}`}>
              <Mail aria-hidden="true" /> Email me
            </a>
          </Button>
          {linkedin && (
            <Button asChild variant="secondary" size="lg" className="justify-start">
              <a href={linkedin.url} target="_blank" rel="noopener noreferrer">
                <SocialIcon platform="linkedin" iconId={linkedin.iconId} /> Connect on LinkedIn
              </a>
            </Button>
          )}
          <Button asChild variant="secondary" size="lg" className="justify-start">
            <a href="/resume" target="_blank" rel="noopener noreferrer">
              <ArrowUpRight aria-hidden="true" /> View Resume
            </a>
          </Button>
          {profile.showPhone && profile.phone && (
            <Button asChild variant="secondary" size="lg" className="justify-start">
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                <Phone aria-hidden="true" /> {profile.phone}
              </a>
            </Button>
          )}
          <CopyEmailButton email={profile.email} className="justify-start" />
        </Reveal>
      </div>
    </Section>
  );
}
