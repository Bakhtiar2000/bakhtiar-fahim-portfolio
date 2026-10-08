import type { Types } from "mongoose";
import type { AchievementDoc } from "./models/Achievement";
import type { CaseStudyDoc } from "./models/CaseStudy";
import type { EducationDoc } from "./models/Education";
import type { ExperienceDoc } from "./models/Experience";
import type { MessageDoc } from "./models/Message";
import type { ProfileDoc } from "./models/Profile";
import type { ProjectDoc } from "./models/Project";
import type { ResumeDoc } from "./models/Resume";
import type { SiteSettingsDoc } from "./models/SiteSettings";
import type { SkillGroupDoc } from "./models/SkillGroup";
import type { SocialLinkDoc } from "./models/SocialLink";
import type { StatDoc } from "./models/Stat";
import { SECTION_KEYS, type SectionKey } from "./sections";
import type {
  AchievementDTO,
  CaseStudyDTO,
  EducationDTO,
  ExperienceDTO,
  MessageDTO,
  ProfileDTO,
  ProjectDTO,
  ResumeDTO,
  SectionConfig,
  SiteSettingsDTO,
  SkillGroupDTO,
  SkillLevel,
  SocialLinkDTO,
  StatDTO,
} from "./types";

/** A `.lean()` result: plain object with _id and timestamps. */
export type Lean<T> = T & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date };

const id = (v: { _id: Types.ObjectId }) => v._id.toString();
const oid = (v: unknown): string | null => (v ? String(v) : null);
const oids = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const iso = (v: unknown): string | null => (v instanceof Date ? v.toISOString() : v ? new Date(String(v)).toISOString() : null);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function toProfileDTO(d: Lean<ProfileDoc>): ProfileDTO {
  return {
    name: d.name,
    title: d.title,
    headline: d.headline,
    subHeadline: d.subHeadline,
    rotatingRoles: strs(d.rotatingRoles),
    statusText: str(d.statusText),
    openToWork: Boolean(d.openToWork),
    location: str(d.location),
    workPreference: str(d.workPreference),
    aboutHtml: str(d.aboutHtml),
    photoFileId: oid(d.photoFileId),
    email: d.email,
    phone: str(d.phone),
    showPhone: Boolean(d.showPhone),
    softSkills: strs(d.softSkills),
    topSkills: strs(d.topSkills),
    keyAchievements: strs(d.keyAchievements),
    updatedAt: iso(d.updatedAt),
  };
}

export function toStatDTO(d: Lean<StatDoc>): StatDTO {
  return {
    id: id(d),
    label: d.label,
    value: d.value,
    prefix: str(d.prefix),
    suffix: str(d.suffix),
    order: d.order ?? 0,
    published: d.published !== false,
  };
}

export function toExperienceDTO(d: Lean<ExperienceDoc>): ExperienceDTO {
  return {
    id: id(d),
    company: d.company,
    role: d.role,
    type: str(d.type),
    location: str(d.location),
    startDate: iso(d.startDate) ?? new Date(0).toISOString(),
    endDate: iso(d.endDate),
    isCurrent: Boolean(d.isCurrent),
    summary: str(d.summary),
    highlights: strs(d.highlights),
    tech: strs(d.tech),
    promoted: Boolean(d.promoted),
    order: d.order ?? 0,
    published: d.published !== false,
  };
}

export function toProjectDTO(d: Lean<ProjectDoc>): ProjectDTO {
  return {
    id: id(d),
    slug: d.slug,
    title: d.title,
    pitch: d.pitch,
    descriptionHtml: str(d.descriptionHtml),
    role: str(d.role),
    category: str(d.category),
    features: (d.features ?? []).map((f) => ({ audience: f.audience, items: strs(f.items) })),
    challenges: strs(d.challenges),
    tech: strs(d.tech),
    liveUrl: str(d.liveUrl),
    clientRepo: str(d.clientRepo),
    serverRepo: str(d.serverRepo),
    coverFileId: oid(d.coverFileId),
    galleryFileIds: oids(d.galleryFileIds),
    featured: Boolean(d.featured),
    published: d.published !== false,
    order: d.order ?? 0,
  };
}

const LEVELS: SkillLevel[] = ["Daily", "Production", "Familiar"];

export function toSkillGroupDTO(d: Lean<SkillGroupDoc>): SkillGroupDTO {
  return {
    id: id(d),
    name: d.name,
    order: d.order ?? 0,
    published: d.published !== false,
    skills: (d.skills ?? []).map((s) => ({
      name: s.name,
      icon: str(s.icon),
      level: LEVELS.includes(s.level as SkillLevel) ? (s.level as SkillLevel) : "Production",
      aliases: strs(s.aliases),
    })),
  };
}

export function toEducationDTO(d: Lean<EducationDoc>): EducationDTO {
  return {
    id: id(d),
    degree: d.degree,
    institution: d.institution,
    startYear: d.startYear,
    endYear: num(d.endYear),
    cgpa: str(d.cgpa),
    notes: str(d.notes),
    order: d.order ?? 0,
    published: d.published !== false,
  };
}

export function toAchievementDTO(d: Lean<AchievementDoc>): AchievementDTO {
  return {
    id: id(d),
    title: d.title,
    event: str(d.event),
    date: iso(d.date),
    description: str(d.description),
    link: str(d.link),
    order: d.order ?? 0,
    published: d.published !== false,
  };
}

export function toSocialLinkDTO(d: Lean<SocialLinkDoc>): SocialLinkDTO {
  return {
    id: id(d),
    platform: d.platform,
    label: str(d.label),
    url: d.url,
    showInHero: d.showInHero !== false,
    showInFooter: d.showInFooter !== false,
    order: d.order ?? 0,
    published: d.published !== false,
  };
}

export function toCaseStudyDTO(d: Lean<CaseStudyDoc>): CaseStudyDTO {
  return {
    eyebrow: str(d.eyebrow),
    title: d.title,
    summary: str(d.summary),
    product: str(d.product),
    myRole: str(d.myRole),
    shipped: str(d.shipped),
    shippedChips: strs(d.shippedChips),
    architecture: (d.architecture ?? []).map((n) => ({
      key: n.key,
      label: n.label,
      sublabel: str(n.sublabel),
      layer: str(n.layer),
      description: str(n.description),
      contribution: str(n.contribution),
      x: num(n.x) ?? 50,
      y: num(n.y) ?? 50,
      connections: strs(n.connections),
    })),
    mockupFileIds: oids(d.mockupFileIds),
  };
}

/** Always returns every section exactly once, keeping stored order first. */
export function normalizeSections(stored: { key?: unknown; visible?: unknown; teaser?: unknown }[]): SectionConfig[] {
  const seen = new Set<SectionKey>();
  const out: SectionConfig[] = [];
  for (const s of stored) {
    const key = s.key as SectionKey;
    if (!SECTION_KEYS.includes(key) || seen.has(key)) continue;
    seen.add(key);
    out.push({ key, visible: s.visible !== false, teaser: str(s.teaser) });
  }
  for (const key of SECTION_KEYS) if (!seen.has(key)) out.push({ key, visible: true, teaser: "" });
  return out;
}

export function toSettingsDTO(d: Lean<SiteSettingsDoc>): SiteSettingsDTO {
  const cf: Record<string, unknown> = d.codeforcesFallback ?? {};
  const cc: Record<string, unknown> = d.codechefData ?? {};
  return {
    sections: normalizeSections(d.sections ?? []),
    seoTitle: str(d.seoTitle),
    seoDescription: str(d.seoDescription),
    keywords: strs(d.keywords),
    ogImageFileId: oid(d.ogImageFileId),
    footerNote: str(d.footerNote),
    codeforcesHandle: str(d.codeforcesHandle),
    codeforcesFallback: {
      rating: num(cf.rating),
      maxRating: num(cf.maxRating),
      rank: str(cf.rank),
      maxRank: str(cf.maxRank),
      solved: num(cf.solved),
    },
    codechefHandle: str(d.codechefHandle),
    codechefData: {
      rating: num(cc.rating),
      highestRating: num(cc.highestRating),
      stars: num(cc.stars),
      solved: num(cc.solved),
    },
  };
}

export function toResumeDTO(d: Lean<ResumeDoc>): ResumeDTO {
  return {
    id: id(d),
    fileId: String(d.fileId),
    fileName: d.fileName,
    size: d.size ?? 0,
    isActive: Boolean(d.isActive),
    createdAt: iso(d.createdAt) ?? new Date(0).toISOString(),
  };
}

export function toMessageDTO(d: Lean<MessageDoc>): MessageDTO {
  return {
    id: id(d),
    name: d.name,
    email: d.email,
    company: str(d.company),
    subject: d.subject,
    body: d.body,
    read: Boolean(d.read),
    archived: Boolean(d.archived),
    createdAt: iso(d.createdAt) ?? new Date(0).toISOString(),
  };
}
