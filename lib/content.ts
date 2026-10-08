import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "./db";
import {
  Achievement,
  CaseStudy,
  Education,
  Experience,
  Profile,
  Project,
  Resume,
  SiteSettings,
  SkillGroup,
  SocialLink,
  Stat,
} from "./models";
import {
  seedAchievements,
  seedCaseStudy,
  seedEducation,
  seedExperience,
  seedProfile,
  seedProjects,
  seedSettings,
  seedSkillGroups,
  seedSocials,
  seedStats,
} from "./seed-data";
import {
  normalizeSections,
  toAchievementDTO,
  toCaseStudyDTO,
  toEducationDTO,
  toExperienceDTO,
  toProfileDTO,
  toProjectDTO,
  toSettingsDTO,
  toSkillGroupDTO,
  toSocialLinkDTO,
  toStatDTO,
  type Lean,
} from "./serialize";
import type { SiteContent } from "./types";
import type { ProfileDoc } from "./models/Profile";
import type { StatDoc } from "./models/Stat";
import type { ExperienceDoc } from "./models/Experience";
import type { ProjectDoc } from "./models/Project";
import type { SkillGroupDoc } from "./models/SkillGroup";
import type { EducationDoc } from "./models/Education";
import type { AchievementDoc } from "./models/Achievement";
import type { SocialLinkDoc } from "./models/SocialLink";
import type { CaseStudyDoc } from "./models/CaseStudy";
import type { SiteSettingsDoc } from "./models/SiteSettings";
import type { ResumeDoc } from "./models/Resume";

/** Every admin mutation calls updateTag(CONTENT_TAG). */
export const CONTENT_TAG = "site-content";

/**
 * All public content in one cached read. Prerendered into the static shell and
 * refreshed on demand when the admin saves. If the database is unreachable the
 * built-in resume content is served and retried every minute.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  try {
    const content = await loadFromDb();
    if (!content) {
      cacheLife("minutes");
      return fallbackContent();
    }
    cacheLife("days");
    return content;
  } catch (error) {
    console.error("[content] Falling back to built-in content:", error instanceof Error ? error.message : error);
    cacheLife("minutes");
    return fallbackContent();
  }
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

async function loadFromDb(): Promise<SiteContent | null> {
  await connectDB();
  const [profile, stats, experience, projects, skillGroups, education, achievements, socials, caseStudy, settings, resume] =
    await Promise.all([
      Profile.findOne().lean<Lean<ProfileDoc>>(),
      Stat.find({ published: true }).sort({ order: 1 }).lean<Lean<StatDoc>[]>(),
      Experience.find({ published: true }).sort({ order: 1 }).lean<Lean<ExperienceDoc>[]>(),
      Project.find({ published: true }).sort({ order: 1 }).lean<Lean<ProjectDoc>[]>(),
      SkillGroup.find({ published: true }).sort({ order: 1 }).lean<Lean<SkillGroupDoc>[]>(),
      Education.find({ published: true }).sort({ order: 1 }).lean<Lean<EducationDoc>[]>(),
      Achievement.find({ published: true }).sort({ order: 1 }).lean<Lean<AchievementDoc>[]>(),
      SocialLink.find({ published: true }).sort({ order: 1 }).lean<Lean<SocialLinkDoc>[]>(),
      CaseStudy.findOne().lean<Lean<CaseStudyDoc>>(),
      SiteSettings.findOne().lean<Lean<SiteSettingsDoc>>(),
      Resume.findOne({ isActive: true }).sort({ createdAt: -1 }).lean<Lean<ResumeDoc>>(),
    ]);

  // Not seeded yet.
  if (!profile) return null;

  const dates = [
    profile,
    caseStudy,
    settings,
    resume,
    ...stats,
    ...experience,
    ...projects,
    ...skillGroups,
    ...education,
    ...achievements,
    ...socials,
  ]
    .map((d) => d?.updatedAt?.getTime() ?? 0)
    .filter(Boolean);
  const lastUpdated = dates.length ? new Date(Math.max(...dates)).toISOString() : null;

  const profileDTO = toProfileDTO(profile);
  // Never ship the phone number to the browser unless it should be shown.
  if (!profileDTO.showPhone) profileDTO.phone = "";

  return {
    profile: profileDTO,
    stats: stats.map(toStatDTO),
    experience: experience.map(toExperienceDTO),
    projects: projects.map(toProjectDTO),
    skillGroups: skillGroups.map(toSkillGroupDTO),
    education: education.map(toEducationDTO),
    achievements: achievements.map(toAchievementDTO),
    socials: socials.map(toSocialLinkDTO),
    caseStudy: caseStudy ? toCaseStudyDTO(caseStudy) : { ...seedCaseStudy, mockupFileIds: [] },
    settings: settings ? toSettingsDTO(settings) : { ...seedSettings, ogImageFileId: null },
    activeResumeFileId: resume ? String(resume.fileId) : null,
    lastUpdated,
    isFallback: false,
  };
}

function fallbackContent(): SiteContent {
  const withIds = <T extends object>(items: T[], prefix: string) => items.map((item, i) => ({ ...item, id: `${prefix}-${i}` }));
  return {
    profile: { ...seedProfile, phone: "", photoFileId: null, updatedAt: null },
    stats: withIds(seedStats, "stat"),
    experience: withIds(seedExperience, "exp"),
    projects: withIds(seedProjects, "project").map((p) => ({ ...p, coverFileId: null, galleryFileIds: [] })),
    skillGroups: withIds(seedSkillGroups, "skills").sort(byOrder),
    education: withIds(seedEducation, "edu"),
    achievements: withIds(seedAchievements, "ach"),
    socials: withIds(seedSocials, "social"),
    caseStudy: { ...seedCaseStudy, mockupFileIds: [] },
    settings: { ...seedSettings, sections: normalizeSections(seedSettings.sections), ogImageFileId: null },
    activeResumeFileId: null,
    lastUpdated: null,
    isFallback: true,
  };
}
