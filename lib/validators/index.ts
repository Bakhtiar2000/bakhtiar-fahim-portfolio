import { z } from "zod";
import { SECTION_KEYS } from "../sections";

/* ---------- building blocks ---------- */

const text = (max = 200) => z.string().trim().max(max, `Keep it under ${max} characters`);
const required = (max = 200) => text(max).min(1, "Required");
const list = (maxItems = 40, maxLen = 200) =>
  z.array(z.string().trim().min(1).max(maxLen)).max(maxItems, `At most ${maxItems} items`);

const httpUrl = (value: string) => /^https?:\/\/[^\s]+$/i.test(value);
const optionalUrl = text(500).refine((v) => v === "" || httpUrl(v), "Must start with http:// or https://");
const linkUrl = text(500).refine((v) => httpUrl(v) || /^mailto:[^\s@]+@[^\s@]+$/i.test(v) || /^tel:\+?[0-9\s-]+$/i.test(v), {
  message: "Use an https://, mailto: or tel: link",
});

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");
const fileId = objectIdSchema.nullable();
const month = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM");
const optionalMonth = z.union([month, z.literal("")]);
const year = z.coerce.number<number>().int().min(1950).max(2100);

/* ---------- content ---------- */

export const profileSchema = z.object({
  name: required(80),
  title: required(120),
  headline: required(120),
  subHeadline: required(400),
  rotatingRoles: list(8, 60),
  statusText: text(140),
  openToWork: z.boolean(),
  location: text(80),
  workPreference: text(80),
  aboutHtml: text(8000),
  photoFileId: fileId,
  email: z.email("Enter a valid email"),
  phone: text(30),
  showPhone: z.boolean(),
  softSkills: list(15, 40),
  topSkills: list(8, 40),
  keyAchievements: list(3, 140),
});

export const statSchema = z.object({
  label: required(60),
  value: required(20),
  prefix: text(8),
  suffix: text(12),
  published: z.boolean(),
});

export const experienceSchema = z
  .object({
    company: required(120),
    role: required(120),
    type: required(40),
    location: text(80),
    startDate: month,
    endDate: optionalMonth,
    isCurrent: z.boolean(),
    summary: text(600),
    highlights: list(12, 400),
    tech: list(30, 40),
    promoted: z.boolean(),
    published: z.boolean(),
  })
  .refine((v) => v.isCurrent || v.endDate !== "", { path: ["endDate"], message: "Set an end date or mark as current" })
  .refine((v) => v.isCurrent || v.endDate === "" || v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "End date must be after the start date",
  });

export const projectSchema = z.object({
  title: required(100),
  slug: required(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
  pitch: required(220),
  descriptionHtml: text(15000),
  role: text(60),
  category: text(60),
  features: z.array(z.object({ audience: required(40), items: list(15, 160) })).max(8),
  challenges: list(10, 200),
  tech: list(25, 40),
  liveUrl: optionalUrl,
  clientRepo: optionalUrl,
  serverRepo: optionalUrl,
  coverFileId: fileId,
  galleryFileIds: z.array(objectIdSchema).max(12),
  featured: z.boolean(),
  published: z.boolean(),
});

export const skillGroupSchema = z.object({
  name: required(60),
  published: z.boolean(),
  skills: z
    .array(
      z.object({
        name: required(40),
        icon: text(60).regex(/^[a-z0-9]*$/, "simple-icons slug: lowercase letters and numbers"),
        level: z.enum(["Daily", "Production", "Familiar"]),
        aliases: list(8, 40),
      }),
    )
    .max(40),
});

export const educationSchema = z.object({
  degree: required(160),
  institution: required(160),
  startYear: year,
  endYear: z.union([z.literal("").transform(() => null), z.null(), year]),
  cgpa: text(20),
  notes: text(400),
  published: z.boolean(),
});

export const achievementSchema = z.object({
  title: required(160),
  event: text(120),
  date: optionalMonth,
  description: text(600),
  link: optionalUrl,
  published: z.boolean(),
});

export const socialLinkSchema = z.object({
  platform: required(30).regex(/^[a-z0-9-]+$/, "Lowercase key, e.g. github"),
  label: text(40),
  url: linkUrl,
  showInHero: z.boolean(),
  showInFooter: z.boolean(),
  published: z.boolean(),
});

const architectureNodeSchema = z.object({
  key: required(30).regex(/^[a-z0-9-]+$/, "Lowercase key"),
  label: required(40),
  sublabel: text(60),
  layer: text(30),
  description: text(400),
  contribution: text(400),
  x: z.coerce.number<number>().min(0).max(100),
  y: z.coerce.number<number>().min(0).max(100),
  connections: list(10, 30),
});

export const caseStudySchema = z
  .object({
    eyebrow: text(60),
    title: required(140),
    summary: text(600),
    product: text(800),
    myRole: text(800),
    shipped: text(800),
    shippedChips: list(24, 60),
    architecture: z.array(architectureNodeSchema).max(16),
    mockupFileIds: z.array(objectIdSchema).max(6),
  })
  .refine((v) => new Set(v.architecture.map((n) => n.key)).size === v.architecture.length, {
    path: ["architecture"],
    message: "Node keys must be unique",
  });

export const sectionsSchema = z.object({
  sections: z.array(z.object({ key: z.enum(SECTION_KEYS), visible: z.boolean(), teaser: text(120) })).length(SECTION_KEYS.length),
});

export const seoSchema = z.object({
  seoTitle: required(90),
  seoDescription: required(200),
  keywords: list(25, 40),
  ogImageFileId: fileId,
  footerNote: text(120),
});

// "" must match before coercion, which would otherwise turn it into 0.
const optionalInt = z.union([z.literal("").transform(() => null), z.null(), z.coerce.number<number>().int().min(0).max(10000)]);

export const competitiveSchema = z.object({
  codeforcesHandle: text(24).regex(/^[A-Za-z0-9_.-]*$/, "Invalid handle"),
  codeforcesFallback: z.object({
    rating: optionalInt,
    maxRating: optionalInt,
    rank: text(40),
    maxRank: text(40),
    solved: optionalInt,
  }),
  codechefHandle: text(24).regex(/^[A-Za-z0-9_.-]*$/, "Invalid handle"),
  codechefData: z.object({
    rating: optionalInt,
    highestRating: optionalInt,
    stars: z.union([z.literal("").transform(() => null), z.null(), z.coerce.number<number>().int().min(0).max(7)]),
    solved: optionalInt,
  }),
});

/* ---------- public forms ---------- */

export const contactSchema = z.object({
  name: required(80),
  email: z.email("Enter a valid email").max(160),
  company: text(120),
  subject: required(160),
  message: text(5000).min(10, "Tell me a little more (10+ characters)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(500),
});

export const reorderSchema = z.array(objectIdSchema).max(500);

export type ProfileInput = z.infer<typeof profileSchema>;
export type CaseStudyInput = z.infer<typeof caseStudySchema>;
export type SectionsInput = z.infer<typeof sectionsSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
export type CompetitiveInput = z.infer<typeof competitiveSchema>;
