/** Reorderable public sections (hero + proof bar are always first, footer last). */
export const SECTION_KEYS = ["caseStudy", "experience", "projects", "skills", "competitive", "about", "contact"] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_META: Record<SectionKey, { label: string; anchor: string; nav: string }> = {
  caseStudy: { label: "Featured case study", anchor: "work", nav: "Work" },
  experience: { label: "Experience", anchor: "experience", nav: "Experience" },
  projects: { label: "Projects", anchor: "projects", nav: "Projects" },
  skills: { label: "Skills", anchor: "skills", nav: "Skills" },
  competitive: { label: "Competitive programming & achievements", anchor: "achievements", nav: "Achievements" },
  about: { label: "About", anchor: "about", nav: "About" },
  contact: { label: "Contact", anchor: "contact", nav: "Contact" },
};
