import type { z } from "zod";
import type { CollectionKey } from "@/lib/admin-data";
import type {
  AchievementDTO,
  CaseStudyDTO,
  EducationDTO,
  ExperienceDTO,
  ProfileDTO,
  ProjectDTO,
  SiteSettingsDTO,
  SkillGroupDTO,
  SocialLinkDTO,
  StatDTO,
} from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import {
  achievementSchema,
  caseStudySchema,
  competitiveSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  seoSchema,
  skillGroupSchema,
  socialLinkSchema,
  statSchema,
} from "@/lib/validators";
import type { FieldDef, FormValues } from "./form/types";

const month = (iso: string | null) => (iso ? iso.slice(0, 7) : "");
const published: FieldDef = {
  kind: "switch",
  name: "published",
  label: "Published",
  help: "Hidden from the public site when off",
};

export interface CollectionConfig<D> {
  title: string;
  singular: string;
  description: string;
  schema: z.ZodType;
  fields: FieldDef[];
  empty: () => FormValues;
  toForm: (item: D) => FormValues;
  itemTitle: (item: D) => string;
  itemSubtitle: (item: D) => string;
}

export interface CollectionItems {
  stats: StatDTO;
  experience: ExperienceDTO;
  projects: ProjectDTO;
  skills: SkillGroupDTO;
  education: EducationDTO;
  achievements: AchievementDTO;
  socials: SocialLinkDTO;
}

export const COLLECTION_CONFIGS: { [K in CollectionKey]: CollectionConfig<CollectionItems[K]> } = {
  stats: {
    title: "Stats",
    singular: "stat",
    description: "The proof bar under the hero. Numeric values count up on scroll; text values show as-is.",
    schema: statSchema,
    fields: [
      { kind: "text", name: "value", label: "Value", help: "e.g. 3.86 or Enterprise" },
      { kind: "text", name: "label", label: "Label", help: "e.g. CGPA in CSE" },
      { kind: "text", name: "prefix", label: "Prefix" },
      { kind: "text", name: "suffix", label: "Suffix", help: "e.g. + yr" },
      { ...published, label: "Visible" },
    ],
    empty: () => ({ value: "", label: "", prefix: "", suffix: "", published: true }),
    toForm: (s) => ({ value: s.value, label: s.label, prefix: s.prefix, suffix: s.suffix, published: s.published }),
    itemTitle: (s) => `${s.prefix}${s.value}${s.suffix}`,
    itemSubtitle: (s) => s.label,
  },
  experience: {
    title: "Experience",
    singular: "role",
    description: "Timeline entries, newest first. Mark a role as promoted to show the “Promoted in N months” badge.",
    schema: experienceSchema,
    fields: [
      { kind: "text", name: "role", label: "Role" },
      { kind: "text", name: "company", label: "Company" },
      {
        kind: "select",
        name: "type",
        label: "Type",
        options: ["Full-time", "Part-time", "Internship", "Contract", "Freelance"].map((v) => ({ value: v, label: v })),
      },
      { kind: "text", name: "location", label: "Location" },
      { kind: "month", name: "startDate", label: "Start" },
      { kind: "month", name: "endDate", label: "End", help: "Leave empty for current roles" },
      { kind: "switch", name: "isCurrent", label: "Current role", help: "Shows “Present” and the glowing dot" },
      { kind: "switch", name: "promoted", label: "Promoted", help: "Computed from the previous role at the same company" },
      { kind: "textarea", name: "summary", label: "Summary", wide: true },
      { kind: "lines", name: "highlights", label: "Highlights", help: "One bullet per line" },
      { kind: "tags", name: "tech", label: "Tech", wide: true },
      published,
    ],
    empty: () => ({
      role: "",
      company: "",
      type: "Full-time",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      promoted: false,
      summary: "",
      highlights: [],
      tech: [],
      published: true,
    }),
    toForm: (e) => ({
      role: e.role,
      company: e.company,
      type: e.type || "Full-time",
      location: e.location,
      startDate: month(e.startDate),
      endDate: month(e.endDate),
      isCurrent: e.isCurrent,
      promoted: e.promoted,
      summary: e.summary,
      highlights: e.highlights,
      tech: e.tech,
      published: e.published,
    }),
    itemTitle: (e) => `${e.role} · ${e.company}`,
    itemSubtitle: (e) => `${formatMonthYear(e.startDate)} — ${e.isCurrent ? "Present" : formatMonthYear(e.endDate)}`,
  },
  projects: {
    title: "Projects",
    singular: "project",
    description: "Project cards and their case-study drawers. Featured projects are listed first.",
    schema: projectSchema,
    fields: [
      { kind: "text", name: "title", label: "Title" },
      { kind: "text", name: "slug", label: "Slug", help: "Lowercase, dashes — e.g. arkham-healthcare" },
      { kind: "textarea", name: "pitch", label: "One-line pitch", wide: true, rows: 2 },
      { kind: "text", name: "role", label: "Your role", help: "e.g. Project Lead" },
      { kind: "text", name: "category", label: "Category", help: "e.g. Client project" },
      { kind: "richtext", name: "descriptionHtml", label: "Description" },
      {
        kind: "objectList",
        name: "features",
        label: "Features by user type",
        addLabel: "Add user type",
        newItem: { audience: "", items: [] },
        itemLabel: (v, i) => (v.audience as string) || `User type ${i + 1}`,
        fields: [
          { kind: "text", name: "audience", label: "User type", wide: true, help: "e.g. Clients" },
          { kind: "lines", name: "items", label: "Features" },
        ],
      },
      { kind: "lines", name: "challenges", label: "Challenges & focus" },
      { kind: "tags", name: "tech", label: "Tech", wide: true },
      { kind: "url", name: "liveUrl", label: "Live URL", placeholder: "https://" },
      { kind: "url", name: "clientRepo", label: "Client repo", placeholder: "https://github.com/…" },
      { kind: "url", name: "serverRepo", label: "Server repo", placeholder: "https://github.com/…" },
      { kind: "image", name: "coverFileId", label: "Cover image", wide: true },
      { kind: "images", name: "galleryFileIds", label: "Gallery", max: 12 },
      { kind: "switch", name: "featured", label: "Featured" },
      published,
    ],
    empty: () => ({
      title: "",
      slug: "",
      pitch: "",
      role: "",
      category: "",
      descriptionHtml: "",
      features: [],
      challenges: [],
      tech: [],
      liveUrl: "",
      clientRepo: "",
      serverRepo: "",
      coverFileId: null,
      galleryFileIds: [],
      featured: false,
      published: true,
    }),
    toForm: (p) => ({
      title: p.title,
      slug: p.slug,
      pitch: p.pitch,
      role: p.role,
      category: p.category,
      descriptionHtml: p.descriptionHtml,
      features: p.features,
      challenges: p.challenges,
      tech: p.tech,
      liveUrl: p.liveUrl,
      clientRepo: p.clientRepo,
      serverRepo: p.serverRepo,
      coverFileId: p.coverFileId,
      galleryFileIds: p.galleryFileIds,
      featured: p.featured,
      published: p.published,
    }),
    itemTitle: (p) => p.title,
    itemSubtitle: (p) => [p.featured && "★ Featured", p.role, p.tech.slice(0, 4).join(", ")].filter(Boolean).join(" · "),
  },
  skills: {
    title: "Skills",
    singular: "skill group",
    description: "Groups of skill tiles. Icons use simple-icons slugs (simpleicons.org); unknown slugs show a monogram.",
    schema: skillGroupSchema,
    fields: [
      { kind: "text", name: "name", label: "Group name" },
      published,
      {
        kind: "objectList",
        name: "skills",
        label: "Skills",
        addLabel: "Add skill",
        newItem: { name: "", icon: "", level: "Production", aliases: [] },
        itemLabel: (v, i) => `${(v.name as string) || `Skill ${i + 1}`}${v.level ? ` · ${v.level as string}` : ""}`,
        fields: [
          { kind: "text", name: "name", label: "Name" },
          { kind: "text", name: "icon", label: "Icon slug", help: "e.g. react, dotnet, postgresql" },
          {
            kind: "select",
            name: "level",
            label: "Level",
            options: [
              { value: "Daily", label: "Daily" },
              { value: "Production", label: "Production" },
              { value: "Familiar", label: "Familiar" },
            ],
          },
          { kind: "tags", name: "aliases", label: "Aliases", help: "Other names used in tech tags, for “where I used it”" },
        ],
      },
    ],
    empty: () => ({ name: "", published: true, skills: [] }),
    toForm: (g) => ({ name: g.name, published: g.published, skills: g.skills }),
    itemTitle: (g) => g.name,
    itemSubtitle: (g) => g.skills.map((s) => s.name).join(", "),
  },
  education: {
    title: "Education",
    singular: "degree",
    description: "Shown in the About section and the 30-second view.",
    schema: educationSchema,
    fields: [
      { kind: "text", name: "degree", label: "Degree", wide: true },
      { kind: "text", name: "institution", label: "Institution", wide: true },
      { kind: "number", name: "startYear", label: "Start year" },
      { kind: "number", name: "endYear", label: "End year", help: "Empty = in progress" },
      { kind: "text", name: "cgpa", label: "CGPA", help: "e.g. 3.86 / 4.00" },
      { kind: "textarea", name: "notes", label: "Notes", wide: true },
      published,
    ],
    empty: () => ({
      degree: "",
      institution: "",
      startYear: new Date().getFullYear(),
      endYear: "",
      cgpa: "",
      notes: "",
      published: true,
    }),
    toForm: (e) => ({
      degree: e.degree,
      institution: e.institution,
      startYear: e.startYear,
      endYear: e.endYear ?? "",
      cgpa: e.cgpa,
      notes: e.notes,
      published: e.published,
    }),
    itemTitle: (e) => e.degree,
    itemSubtitle: (e) => `${e.institution} · ${e.startYear}–${e.endYear ?? "Present"}`,
  },
  achievements: {
    title: "Achievements",
    singular: "achievement",
    description: "Cards in the Competitive Programming & Achievements section.",
    schema: achievementSchema,
    fields: [
      { kind: "text", name: "title", label: "Title", wide: true },
      { kind: "text", name: "event", label: "Event" },
      { kind: "month", name: "date", label: "Date" },
      { kind: "textarea", name: "description", label: "Description", wide: true },
      { kind: "url", name: "link", label: "Link", placeholder: "https://" },
      published,
    ],
    empty: () => ({ title: "", event: "", date: "", description: "", link: "", published: true }),
    toForm: (a) => ({
      title: a.title,
      event: a.event,
      date: month(a.date),
      description: a.description,
      link: a.link,
      published: a.published,
    }),
    itemTitle: (a) => a.title,
    itemSubtitle: (a) => [a.event, a.date && formatMonthYear(a.date)].filter(Boolean).join(" · "),
  },
  socials: {
    title: "Social links",
    singular: "link",
    description: "Icons in the hero, footer and command palette.",
    schema: socialLinkSchema,
    fields: [
      {
        kind: "text",
        name: "platform",
        label: "Platform",
        help: "github, linkedin, codechef, codeforces, email, x, leetcode, website…",
      },
      { kind: "text", name: "label", label: "Label", help: "Accessible name, e.g. GitHub" },
      { kind: "text", name: "url", label: "URL", wide: true, help: "https://… or mailto:you@example.com" },
      { kind: "switch", name: "showInHero", label: "Show in hero" },
      { kind: "switch", name: "showInFooter", label: "Show in footer" },
      published,
    ],
    empty: () => ({ platform: "", label: "", url: "", showInHero: true, showInFooter: true, published: true }),
    toForm: (s) => ({
      platform: s.platform,
      label: s.label,
      url: s.url,
      showInHero: s.showInHero,
      showInFooter: s.showInFooter,
      published: s.published,
    }),
    itemTitle: (s) => s.label || s.platform,
    itemSubtitle: (s) => s.url,
  },
};

/* ---------- singletons ---------- */

export const PROFILE_FIELDS: FieldDef[] = [
  { kind: "heading", name: "_hero", label: "Hero" },
  { kind: "text", name: "name", label: "Name" },
  { kind: "text", name: "title", label: "Title" },
  {
    kind: "text",
    name: "headline",
    label: "Headline",
    wide: true,
    help: "Wrap words in *asterisks* to render them in the gradient.",
  },
  { kind: "textarea", name: "subHeadline", label: "Sub-headline", wide: true },
  {
    kind: "tags",
    name: "rotatingRoles",
    label: "Rotating roles",
    wide: true,
    help: "Typed one after another under the headline",
  },
  { kind: "text", name: "statusText", label: "Status pill text", wide: true },
  { kind: "switch", name: "openToWork", label: "Open to opportunities", help: "Green pill and “open” badge when on", wide: true },
  { kind: "heading", name: "_about", label: "About" },
  { kind: "image", name: "photoFileId", label: "Profile photo", wide: true },
  { kind: "richtext", name: "aboutHtml", label: "About text" },
  { kind: "text", name: "location", label: "Location" },
  { kind: "text", name: "workPreference", label: "Work preference", help: "e.g. Open to remote / hybrid" },
  { kind: "tags", name: "softSkills", label: "Soft skills", wide: true },
  { kind: "heading", name: "_contact", label: "Contact" },
  { kind: "email", name: "email", label: "Email" },
  { kind: "text", name: "phone", label: "Phone" },
  { kind: "switch", name: "showPhone", label: "Show phone publicly", help: "Off by default for privacy", wide: true },
  { kind: "heading", name: "_recruiter", label: "Recruiter Mode (30-second view)" },
  { kind: "tags", name: "topSkills", label: "Top skills", wide: true, help: "Up to 8" },
  { kind: "lines", name: "keyAchievements", label: "Key achievements", help: "Up to 3, one per line" },
];

export const profileToForm = (p: ProfileDTO): FormValues => ({
  name: p.name,
  title: p.title,
  headline: p.headline,
  subHeadline: p.subHeadline,
  rotatingRoles: p.rotatingRoles,
  statusText: p.statusText,
  openToWork: p.openToWork,
  location: p.location,
  workPreference: p.workPreference,
  aboutHtml: p.aboutHtml,
  photoFileId: p.photoFileId,
  email: p.email,
  phone: p.phone,
  showPhone: p.showPhone,
  softSkills: p.softSkills,
  topSkills: p.topSkills,
  keyAchievements: p.keyAchievements,
});

export const CASE_STUDY_FIELDS: FieldDef[] = [
  { kind: "text", name: "eyebrow", label: "Eyebrow" },
  { kind: "text", name: "title", label: "Title", help: "Text after “ — ” renders as a muted second line" },
  { kind: "textarea", name: "summary", label: "Summary", wide: true },
  { kind: "textarea", name: "product", label: "The product", wide: true },
  { kind: "textarea", name: "myRole", label: "My role", wide: true },
  { kind: "textarea", name: "shipped", label: "What I shipped", wide: true },
  { kind: "tags", name: "shippedChips", label: "Shipped chips", wide: true },
  {
    kind: "objectList",
    name: "architecture",
    label: "Architecture diagram nodes",
    addLabel: "Add node",
    newItem: { key: "", label: "", sublabel: "", layer: "", description: "", contribution: "", x: 50, y: 50, connections: [] },
    itemLabel: (v, i) => `${(v.label as string) || `Node ${i + 1}`}${v.key ? ` (${v.key as string})` : ""}`,
    fields: [
      { kind: "text", name: "key", label: "Key", help: "Unique id, e.g. gateway" },
      { kind: "text", name: "label", label: "Label" },
      { kind: "text", name: "sublabel", label: "Sub-label" },
      { kind: "text", name: "layer", label: "Layer", help: "Groups nodes on mobile, e.g. Services" },
      { kind: "number", name: "x", label: "X position (0–100)" },
      { kind: "number", name: "y", label: "Y position (0–100)" },
      { kind: "tags", name: "connections", label: "Connects to", wide: true, help: "Keys of other nodes" },
      { kind: "textarea", name: "description", label: "What it does", wide: true },
      { kind: "textarea", name: "contribution", label: "What I did with it", wide: true },
    ],
  },
  {
    kind: "images",
    name: "mockupFileIds",
    label: "Mockup images",
    max: 6,
    help: "Original, abstract mockups only. Empty = built-in illustration.",
  },
];

export const caseStudyToForm = (c: CaseStudyDTO): FormValues => ({ ...c });

export const SEO_FIELDS: FieldDef[] = [
  { kind: "text", name: "seoTitle", label: "Site title", wide: true },
  { kind: "textarea", name: "seoDescription", label: "Meta description", wide: true, help: "~155 characters works best" },
  { kind: "tags", name: "keywords", label: "Keywords", wide: true },
  {
    kind: "image",
    name: "ogImageFileId",
    label: "Open Graph image",
    wide: true,
    help: "1200×630. Leave empty to use the generated image (name + headline).",
  },
  { kind: "text", name: "footerNote", label: "Footer note", wide: true },
];

export const seoToForm = (s: SiteSettingsDTO): FormValues => ({
  seoTitle: s.seoTitle,
  seoDescription: s.seoDescription,
  keywords: s.keywords,
  ogImageFileId: s.ogImageFileId,
  footerNote: s.footerNote,
});

export const COMPETITIVE_FIELDS: FieldDef[] = [
  {
    kind: "heading",
    name: "_cf",
    label: "Codeforces",
    help: "Stats are fetched live from the Codeforces API every 12 hours. The values below are shown if the API is unavailable.",
  },
  { kind: "text", name: "codeforcesHandle", label: "Handle", wide: true },
  { kind: "number", name: "codeforcesFallback.rating", label: "Fallback rating" },
  { kind: "number", name: "codeforcesFallback.maxRating", label: "Fallback max rating" },
  { kind: "text", name: "codeforcesFallback.rank", label: "Fallback rank", help: "e.g. specialist" },
  { kind: "text", name: "codeforcesFallback.maxRank", label: "Fallback max rank" },
  { kind: "number", name: "codeforcesFallback.solved", label: "Fallback solved count" },
  {
    kind: "heading",
    name: "_cc",
    label: "CodeChef",
    help: "CodeChef has no reliable public API, so these values are entered by hand.",
  },
  { kind: "text", name: "codechefHandle", label: "Handle", wide: true },
  { kind: "number", name: "codechefData.rating", label: "Rating" },
  { kind: "number", name: "codechefData.highestRating", label: "Highest rating" },
  { kind: "number", name: "codechefData.stars", label: "Stars (0–7)" },
  { kind: "number", name: "codechefData.solved", label: "Problems solved" },
];

const blank = (n: number | null) => (n === null ? "" : n);
export const competitiveToForm = (s: SiteSettingsDTO): FormValues => ({
  codeforcesHandle: s.codeforcesHandle,
  codeforcesFallback: {
    rating: blank(s.codeforcesFallback.rating),
    maxRating: blank(s.codeforcesFallback.maxRating),
    rank: s.codeforcesFallback.rank,
    maxRank: s.codeforcesFallback.maxRank,
    solved: blank(s.codeforcesFallback.solved),
  },
  codechefHandle: s.codechefHandle,
  codechefData: {
    rating: blank(s.codechefData.rating),
    highestRating: blank(s.codechefData.highestRating),
    stars: blank(s.codechefData.stars),
    solved: blank(s.codechefData.solved),
  },
});

export const SCHEMAS = { profile: profileSchema, caseStudy: caseStudySchema, seo: seoSchema, competitive: competitiveSchema };
