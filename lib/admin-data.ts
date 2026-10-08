import "server-only";
import { redirect } from "next/navigation";
import { isAdmin } from "./auth/session";
import { connectDB } from "./db";
import {
  Achievement,
  CaseStudy,
  Education,
  Experience,
  Message,
  Profile,
  Project,
  Resume,
  SiteSettings,
  SkillGroup,
  SocialLink,
  Stat,
} from "./models";
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
import { seedCaseStudy, seedProfile, seedSettings } from "./seed-data";
import {
  normalizeSections,
  toAchievementDTO,
  toCaseStudyDTO,
  toEducationDTO,
  toExperienceDTO,
  toMessageDTO,
  toProfileDTO,
  toProjectDTO,
  toResumeDTO,
  toSettingsDTO,
  toSkillGroupDTO,
  toSocialLinkDTO,
  toStatDTO,
  type Lean,
} from "./serialize";
import type { CaseStudyDTO, ProfileDTO, SiteSettingsDTO } from "./types";

/**
 * Uncached reads for the admin panel (includes unpublished items and the phone
 * number). Every function re-verifies the session; never call from public pages.
 */
async function guard() {
  await requireAdminPage();
  await connectDB();
}

/** For admin pages that don't load data: redirects to login without a valid session. */
export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function adminProfile(): Promise<ProfileDTO> {
  await guard();
  const doc = await Profile.findOne().lean<Lean<ProfileDoc>>();
  return doc ? toProfileDTO(doc) : { ...seedProfile, photoFileId: null, updatedAt: null };
}

export async function adminCaseStudy(): Promise<CaseStudyDTO> {
  await guard();
  const doc = await CaseStudy.findOne().lean<Lean<CaseStudyDoc>>();
  return doc ? toCaseStudyDTO(doc) : { ...seedCaseStudy, mockupFileIds: [] };
}

export async function adminSettings(): Promise<SiteSettingsDTO> {
  await guard();
  const doc = await SiteSettings.findOne().lean<Lean<SiteSettingsDoc>>();
  return doc ? toSettingsDTO(doc) : { ...seedSettings, sections: normalizeSections(seedSettings.sections), ogImageFileId: null };
}

export async function adminCollection(key: CollectionKey) {
  await guard();
  const sort = { order: 1 as const };
  switch (key) {
    case "stats":
      return (await Stat.find().sort(sort).lean<Lean<StatDoc>[]>()).map(toStatDTO);
    case "experience":
      return (await Experience.find().sort(sort).lean<Lean<ExperienceDoc>[]>()).map(toExperienceDTO);
    case "projects":
      return (await Project.find().sort(sort).lean<Lean<ProjectDoc>[]>()).map(toProjectDTO);
    case "skills":
      return (await SkillGroup.find().sort(sort).lean<Lean<SkillGroupDoc>[]>()).map(toSkillGroupDTO);
    case "education":
      return (await Education.find().sort(sort).lean<Lean<EducationDoc>[]>()).map(toEducationDTO);
    case "achievements":
      return (await Achievement.find().sort(sort).lean<Lean<AchievementDoc>[]>()).map(toAchievementDTO);
    case "socials":
      return (await SocialLink.find().sort(sort).lean<Lean<SocialLinkDoc>[]>()).map(toSocialLinkDTO);
  }
}

export type CollectionKey = "stats" | "experience" | "projects" | "skills" | "education" | "achievements" | "socials";

export async function adminResumes() {
  await guard();
  return (await Resume.find().sort({ createdAt: -1 }).lean<Lean<ResumeDoc>[]>()).map(toResumeDTO);
}

export async function adminMessages() {
  await guard();
  return (await Message.find().sort({ createdAt: -1 }).limit(500).lean<Lean<MessageDoc>[]>()).map(toMessageDTO);
}

export async function adminDashboard() {
  await guard();
  const [unread, total, archived, activeResume, profile, latest] = await Promise.all([
    Message.countDocuments({ read: false, archived: false }),
    Message.countDocuments(),
    Message.countDocuments({ archived: true }),
    Resume.findOne({ isActive: true }).lean<Lean<ResumeDoc>>(),
    Profile.findOne().select("updatedAt name").lean<Lean<ProfileDoc>>(),
    Message.find({ archived: false }).sort({ createdAt: -1 }).limit(5).lean<Lean<MessageDoc>[]>(),
  ]);
  const updated = await Promise.all(
    [Profile, Stat, Experience, Project, SkillGroup, Education, Achievement, SocialLink, CaseStudy, SiteSettings, Resume].map(
      (m) => (m as typeof Stat).findOne().sort({ updatedAt: -1 }).select("updatedAt").lean<{ updatedAt?: Date }>(),
    ),
  );
  const times = updated.map((d) => d?.updatedAt?.getTime() ?? 0).filter(Boolean);
  return {
    unread,
    total,
    archived,
    seeded: Boolean(profile),
    activeResume: activeResume ? toResumeDTO(activeResume) : null,
    lastUpdated: times.length ? new Date(Math.max(...times)).toISOString() : null,
    latest: latest.map(toMessageDTO),
  };
}
