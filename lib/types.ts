import type { SectionKey } from "./sections";

/** Serializable shapes passed from the data layer to components. Dates are ISO strings. */

export type SkillLevel = "Daily" | "Production" | "Familiar";

export interface ProfileDTO {
  name: string;
  title: string;
  headline: string;
  subHeadline: string;
  rotatingRoles: string[];
  statusText: string;
  openToWork: boolean;
  location: string;
  workPreference: string;
  aboutHtml: string;
  photoFileId: string | null;
  email: string;
  phone: string;
  showPhone: boolean;
  softSkills: string[];
  topSkills: string[];
  keyAchievements: string[];
  updatedAt: string | null;
}

export interface StatDTO {
  id: string;
  label: string;
  value: string;
  prefix: string;
  suffix: string;
  order: number;
  published: boolean;
}

export interface ExperienceDTO {
  id: string;
  company: string;
  role: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  summary: string;
  highlights: string[];
  tech: string[];
  promoted: boolean;
  order: number;
  published: boolean;
}

export interface FeatureGroup {
  audience: string;
  items: string[];
}

export interface ProjectDTO {
  id: string;
  slug: string;
  title: string;
  pitch: string;
  descriptionHtml: string;
  role: string;
  category: string;
  features: FeatureGroup[];
  challenges: string[];
  tech: string[];
  liveUrl: string;
  clientRepo: string;
  serverRepo: string;
  coverFileId: string | null;
  galleryFileIds: string[];
  featured: boolean;
  published: boolean;
  order: number;
}

export interface SkillDTO {
  name: string;
  icon: string;
  level: SkillLevel;
  aliases: string[];
}

export interface SkillGroupDTO {
  id: string;
  name: string;
  order: number;
  published: boolean;
  skills: SkillDTO[];
}

export interface EducationDTO {
  id: string;
  degree: string;
  institution: string;
  startYear: number;
  endYear: number | null;
  cgpa: string;
  notes: string;
  order: number;
  published: boolean;
}

export interface AchievementDTO {
  id: string;
  title: string;
  event: string;
  date: string | null;
  description: string;
  link: string;
  order: number;
  published: boolean;
}

export interface SocialLinkDTO {
  id: string;
  platform: string;
  label: string;
  url: string;
  showInHero: boolean;
  showInFooter: boolean;
  order: number;
  published: boolean;
}

export interface ArchitectureNode {
  key: string;
  label: string;
  sublabel: string;
  layer: string;
  description: string;
  contribution: string;
  x: number;
  y: number;
  connections: string[];
}

export interface CaseStudyDTO {
  eyebrow: string;
  title: string;
  summary: string;
  product: string;
  myRole: string;
  shipped: string;
  shippedChips: string[];
  architecture: ArchitectureNode[];
  mockupFileIds: string[];
}

export interface SectionConfig {
  key: SectionKey;
  visible: boolean;
  teaser: string;
}

export interface CodeforcesData {
  rating: number | null;
  maxRating: number | null;
  rank: string;
  maxRank: string;
  solved: number | null;
}

export interface CodechefData {
  rating: number | null;
  highestRating: number | null;
  stars: number | null;
  solved: number | null;
}

export interface SiteSettingsDTO {
  sections: SectionConfig[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ogImageFileId: string | null;
  footerNote: string;
  codeforcesHandle: string;
  codeforcesFallback: CodeforcesData;
  codechefHandle: string;
  codechefData: CodechefData;
}

export interface ResumeDTO {
  id: string;
  fileId: string;
  fileName: string;
  size: number;
  isActive: boolean;
  createdAt: string;
}

export interface MessageDTO {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  body: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

/** Everything the public site renders, fetched in one cached call. */
export interface SiteContent {
  profile: ProfileDTO;
  stats: StatDTO[];
  experience: ExperienceDTO[];
  projects: ProjectDTO[];
  skillGroups: SkillGroupDTO[];
  education: EducationDTO[];
  achievements: AchievementDTO[];
  socials: SocialLinkDTO[];
  caseStudy: CaseStudyDTO;
  settings: SiteSettingsDTO;
  activeResumeFileId: string | null;
  lastUpdated: string | null;
  /** True when the DB was unreachable and built-in defaults were used. */
  isFallback: boolean;
}
