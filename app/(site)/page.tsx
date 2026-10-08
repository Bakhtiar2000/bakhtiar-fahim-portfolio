import { AboutSection } from "@/components/sections/about";
import { CaseStudySection } from "@/components/sections/case-study";
import { CompetitiveSection } from "@/components/sections/competitive";
import { ContactSection } from "@/components/sections/contact";
import { ExperienceSection } from "@/components/sections/experience";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { ProofBar } from "@/components/sections/proof-bar";
import { RecruiterView } from "@/components/sections/recruiter-view";
import { SectionTeaser, type Teaser } from "@/components/sections/section";
import { SkillsSection } from "@/components/sections/skills";
import { plainText } from "@/components/site/highlight";
import { Backdrop } from "@/components/site/backdrop";
import { LazyChrome } from "@/components/site/lazy-chrome";
import { Navbar } from "@/components/site/navbar";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { SectionDots } from "@/components/site/section-dots";
import { SiteProviders } from "@/components/site/site-providers";
import type { SiteChrome, SocialItem } from "@/components/site/types";
import { getSiteContent } from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { platformIconId } from "@/lib/icons";
import { SECTION_META, type SectionKey } from "@/lib/sections";
import { Suspense } from "react";
import type { SiteContent } from "@/lib/types";

function personJsonLd(c: SiteContent) {
  const current = c.experience.find((e) => e.isCurrent);
  const edu = c.education[0];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.profile.name,
    jobTitle: current?.role ?? c.profile.title,
    description: plainText(c.profile.headline),
    url: siteUrl(),
    email: `mailto:${c.profile.email}`,
    ...(current && {
      worksFor: { "@type": "Organization", name: current.company },
    }),
    ...(edu && {
      alumniOf: { "@type": "CollegeOrUniversity", name: edu.institution },
    }),
    ...(c.profile.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: c.profile.location,
      },
    }),
    knowsAbout: c.profile.topSkills,
    sameAs: c.socials.map((s) => s.url).filter((u) => u.startsWith("https://") && !u.includes("REPLACE_ME")),
  };
}

export default async function HomePage() {
  const content = await getSiteContent();
  const { profile, settings } = content;

  const toSocial = (s: SiteContent["socials"][number]): SocialItem => ({
    platform: s.platform,
    label: s.label,
    url: s.url,
    iconId: platformIconId(s.platform),
  });
  const heroSocials = content.socials.filter((s) => s.showInHero).map(toSocial);
  const footerSocials = content.socials.filter((s) => s.showInFooter).map(toSocial);

  const visible = settings.sections.filter((s) => s.visible);
  const anchorOf = (key: SectionKey) => (visible.some((s) => s.key === key) ? SECTION_META[key].anchor : null);
  const contactId = anchorOf("contact");

  const chrome: SiteChrome = {
    name: profile.name,
    email: profile.email,
    openToWork: profile.openToWork,
    sections: visible.map((s) => ({
      id: SECTION_META[s.key].anchor,
      label: SECTION_META[s.key].nav,
    })),
    socials: content.socials.map(toSocial),
  };

  const teaserFor = (i: number): Teaser | null => {
    const current = visible[i];
    const next = visible[i + 1];
    return current?.teaser && next ? { text: current.teaser, href: `#${SECTION_META[next.key].anchor}` } : null;
  };

  const renderSection = (key: SectionKey, i: number) => {
    const id = SECTION_META[key].anchor;
    const common = { id, index: i + 1, teaser: teaserFor(i) };
    switch (key) {
      case "caseStudy":
        return <CaseStudySection key={key} data={content.caseStudy} {...common} />;
      case "experience":
        return <ExperienceSection key={key} items={content.experience} {...common} />;
      case "projects":
        return <ProjectsSection key={key} projects={content.projects} contactId={contactId} {...common} />;
      case "skills":
        return (
          <SkillsSection
            key={key}
            groups={content.skillGroups}
            experience={content.experience}
            projects={content.projects}
            {...common}
          />
        );
      case "competitive":
        return <CompetitiveSection key={key} settings={settings} achievements={content.achievements} {...common} />;
      case "about":
        return <AboutSection key={key} profile={profile} education={content.education} {...common} />;
      case "contact":
        return <ContactSection key={key} profile={profile} socials={content.socials.map(toSocial)} id={id} index={i + 1} />;
    }
  };

  const first = visible[0];

  return (
    <SiteProviders>
      <a
        href="#main"
        className="sr-only z-[80] rounded-lg bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Backdrop />
      <div className="noise">
        <Navbar chrome={chrome} />
        <main id="main">
          <Suspense>
            <RecruiterView
              profile={profile}
              current={content.experience.find((e) => e.isCurrent) ?? null}
              education={content.education[0] ?? null}
            />
          </Suspense>
          <div className="full-view">
            <Hero
              profile={profile}
              socials={heroSocials}
              workId={first ? SECTION_META[first.key].anchor : null}
              contactId={contactId}
            />
            <Suspense>
              <ProofBar stats={content.stats} />
            </Suspense>
            {first && (
              <div className="container-page">
                <SectionTeaser text="See how it's built under the hood" href={`#${SECTION_META[first.key].anchor}`} />
              </div>
            )}
            {/* Each boundary hydrates on its own, so hydration never becomes one long task. */}
            {visible.map((s, i) => (
              <Suspense key={s.key}>{renderSection(s.key, i)}</Suspense>
            ))}
          </div>
        </main>
        <Footer name={profile.name} socials={footerSocials} note={settings.footerNote} lastUpdated={content.lastUpdated} />
      </div>
      <SectionDots sections={[{ id: "top", label: "Top" }, ...chrome.sections]} />
      <LazyChrome
        chrome={chrome}
        terminal={{
          name: profile.name,
          title: profile.title,
          location: profile.location,
          email: profile.email,
          skills: content.skillGroups.flatMap((g) => g.skills.map((s) => s.name)),
          experience: content.experience.map((e) => `${e.role} @ ${e.company}${e.isCurrent ? " (current)" : ""}`),
          projects: content.projects.map((p) => `${p.title} — ${p.pitch}`),
          contactId,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(content)).replace(/</g, "\\u003c"),
        }}
      />
    </SiteProviders>
  );
}
