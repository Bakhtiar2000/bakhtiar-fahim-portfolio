"use server";

import type { Model } from "mongoose";
import { updateTag } from "next/cache";
import type { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import type { CollectionKey } from "@/lib/admin-data";
import { isAdmin } from "@/lib/auth/session";
import { CONTENT_TAG } from "@/lib/content";
import { connectDB } from "@/lib/db";
import {
  Achievement,
  CaseStudy,
  Education,
  Experience,
  FileModel,
  Message,
  Profile,
  Project,
  Resume,
  SiteSettings,
  SkillGroup,
  SocialLink,
  Stat,
} from "@/lib/models";
import { sanitizeRichText } from "@/lib/sanitize";
import { findOperatorKey, isObjectId } from "@/lib/security";
import {
  achievementSchema,
  caseStudySchema,
  competitiveSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  reorderSchema,
  sectionsSchema,
  seoSchema,
  skillGroupSchema,
  socialLinkSchema,
  statSchema,
} from "@/lib/validators";

/* ---------- plumbing ---------- */

class ActionError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Session check + operator-injection check + uniform error handling for every admin action. */
async function run<T>(input: unknown, fn: () => Promise<T>): Promise<ActionResult<T>> {
  if (!(await isAdmin())) return { ok: false, error: "Your session has expired. Please sign in again." };
  const bad = findOperatorKey(input);
  if (bad) return { ok: false, error: `Rejected input key "${bad}".` };
  try {
    await connectDB();
    const data = await fn();
    updateTag(CONTENT_TAG);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ActionError) return { ok: false, error: error.message, fieldErrors: error.fieldErrors };
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return { ok: false, error: "That value must be unique.", fieldErrors: { slug: "Already used by another project" } };
    }
    console.error("[admin] action failed:", error);
    return { ok: false, error: "Something went wrong while saving." };
  }
}

function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    throw new ActionError("Please fix the highlighted fields.", fieldErrors);
  }
  return result.data;
}

function requireId(id: unknown): string {
  if (!isObjectId(id)) throw new ActionError("Invalid id.");
  return id;
}

const monthToDate = (m: string) => new Date(`${m}-01T00:00:00.000Z`);

/* ---------- collections ---------- */

interface CollectionDef {
  // Mongoose models differ per collection; operations below only use the shared surface.
  model: Model<Record<string, unknown>>;
  toDoc: (input: unknown) => Record<string, unknown>;
}

const asModel = <T>(m: Model<T>) => m as unknown as Model<Record<string, unknown>>;

const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  stats: { model: asModel(Stat), toDoc: (i) => parse(statSchema, i) },
  experience: {
    model: asModel(Experience),
    toDoc: (i) => {
      const v = parse(experienceSchema, i);
      return { ...v, startDate: monthToDate(v.startDate), endDate: v.isCurrent || !v.endDate ? null : monthToDate(v.endDate) };
    },
  },
  projects: {
    model: asModel(Project),
    toDoc: (i) => {
      const v = parse(projectSchema, i);
      return { ...v, descriptionHtml: sanitizeRichText(v.descriptionHtml) };
    },
  },
  skills: { model: asModel(SkillGroup), toDoc: (i) => parse(skillGroupSchema, i) },
  education: { model: asModel(Education), toDoc: (i) => parse(educationSchema, i) },
  achievements: {
    model: asModel(Achievement),
    toDoc: (i) => {
      const v = parse(achievementSchema, i);
      return { ...v, date: v.date ? monthToDate(v.date) : null };
    },
  },
  socials: { model: asModel(SocialLink), toDoc: (i) => parse(socialLinkSchema, i) },
};

function collection(key: unknown): CollectionDef {
  if (typeof key !== "string" || !(key in COLLECTIONS)) throw new ActionError("Unknown collection.");
  return COLLECTIONS[key as CollectionKey];
}

/** Create (id = null) or update an item. Returns the item's id. */
export async function saveItem(key: CollectionKey, id: string | null, values: unknown): Promise<ActionResult<string>> {
  return run(values, async () => {
    const { model, toDoc } = collection(key);
    const doc = toDoc(values);
    if (id === null) {
      const last = await model.findOne().sort({ order: -1 }).select("order").lean<{ order?: number }>();
      const created = await model.create({ ...doc, order: (last?.order ?? -1) + 1 });
      return String(created._id);
    }
    const updated = await model.findByIdAndUpdate(requireId(id), { $set: doc }, { runValidators: true });
    if (!updated) throw new ActionError("Item not found.");
    return requireId(id);
  });
}

export async function deleteItem(key: CollectionKey, id: string): Promise<ActionResult> {
  return run(id, async () => {
    await collection(key).model.deleteOne({ _id: requireId(id) });
    return undefined;
  });
}

export async function setPublished(key: CollectionKey, id: string, published: boolean): Promise<ActionResult> {
  return run(id, async () => {
    if (typeof published !== "boolean") throw new ActionError("Invalid value.");
    await collection(key).model.updateOne({ _id: requireId(id) }, { $set: { published } });
    return undefined;
  });
}

export async function reorderItems(key: CollectionKey, ids: string[]): Promise<ActionResult> {
  return run(ids, async () => {
    const ordered = parse(reorderSchema, ids);
    await collection(key).model.bulkWrite(
      ordered.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })),
    );
    return undefined;
  });
}

/* ---------- singletons ---------- */

export async function saveProfile(values: unknown): Promise<ActionResult> {
  return run(values, async () => {
    const v = parse(profileSchema, values);
    await Profile.updateOne({}, { $set: { ...v, aboutHtml: sanitizeRichText(v.aboutHtml) } }, { upsert: true });
    return undefined;
  });
}

export async function saveCaseStudy(values: unknown): Promise<ActionResult> {
  return run(values, async () => {
    const v = parse(caseStudySchema, values);
    const keys = new Set(v.architecture.map((n) => n.key));
    // Drop connections to nodes that no longer exist.
    const architecture = v.architecture.map((n) => ({
      ...n,
      connections: n.connections.filter((c) => keys.has(c) && c !== n.key),
    }));
    await CaseStudy.updateOne({}, { $set: { ...v, architecture } }, { upsert: true });
    return undefined;
  });
}

export async function saveSections(values: unknown): Promise<ActionResult> {
  return run(values, async () => {
    const v = parse(sectionsSchema, values);
    if (new Set(v.sections.map((s) => s.key)).size !== v.sections.length) throw new ActionError("Duplicate sections.");
    await SiteSettings.updateOne({}, { $set: { sections: v.sections } }, { upsert: true });
    return undefined;
  });
}

export async function saveSeo(values: unknown): Promise<ActionResult> {
  return run(values, async () => {
    await SiteSettings.updateOne({}, { $set: parse(seoSchema, values) }, { upsert: true });
    return undefined;
  });
}

export async function saveCompetitive(values: unknown): Promise<ActionResult> {
  return run(values, async () => {
    await SiteSettings.updateOne({}, { $set: parse(competitiveSchema, values) }, { upsert: true });
    updateTag("codeforces");
    return undefined;
  });
}

/* ---------- resumes ---------- */

export async function setActiveResume(id: string): Promise<ActionResult> {
  return run(id, async () => {
    const resume = await Resume.findById(requireId(id));
    if (!resume) throw new ActionError("Resume not found.");
    await Resume.updateMany({ _id: { $ne: resume._id } }, { $set: { isActive: false } });
    resume.isActive = true;
    await resume.save();
    return undefined;
  });
}

export async function deleteResume(id: string): Promise<ActionResult> {
  return run(id, async () => {
    const resume = await Resume.findById(requireId(id));
    if (!resume) throw new ActionError("Resume not found.");
    if (resume.isActive) throw new ActionError("Activate another resume before deleting this one.");
    await FileModel.deleteOne({ _id: resume.fileId });
    await resume.deleteOne();
    return undefined;
  });
}

/* ---------- messages ---------- */

export async function updateMessage(id: string, patch: { read?: boolean; archived?: boolean }): Promise<ActionResult> {
  return run(patch, async () => {
    const $set: { read?: boolean; archived?: boolean } = {};
    if (typeof patch?.read === "boolean") $set.read = patch.read;
    if (typeof patch?.archived === "boolean") $set.archived = patch.archived;
    await Message.updateOne({ _id: requireId(id) }, { $set });
    return undefined;
  });
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return run(id, async () => {
    await Message.deleteOne({ _id: requireId(id) });
    return undefined;
  });
}

/* ---------- maintenance ---------- */

/** Deletes uploaded files no longer referenced anywhere (older than an hour, so in-progress forms are safe). */
export async function cleanUpFiles(): Promise<ActionResult<number>> {
  return run({}, async () => {
    const [profile, caseStudy, settings, projects, resumes] = await Promise.all([
      Profile.findOne().select("photoFileId").lean(),
      CaseStudy.findOne().select("mockupFileIds").lean(),
      SiteSettings.findOne().select("ogImageFileId").lean(),
      Project.find().select("coverFileId galleryFileIds").lean(),
      Resume.find().select("fileId").lean(),
    ]);
    const used = new Set(
      [
        profile?.photoFileId,
        settings?.ogImageFileId,
        ...(caseStudy?.mockupFileIds ?? []),
        ...projects.flatMap((p) => [p.coverFileId, ...(p.galleryFileIds ?? [])]),
        ...resumes.map((r) => r.fileId),
      ]
        .filter(Boolean)
        .map(String),
    );
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    const candidates = await FileModel.find({ createdAt: { $lt: cutoff } })
      .select("_id")
      .lean();
    const orphans = candidates.map((f) => f._id).filter((fid) => !used.has(String(fid)));
    if (orphans.length) await FileModel.deleteMany({ _id: { $in: orphans } });
    return orphans.length;
  });
}

/** Forces the public site to re-read everything (e.g. after editing the DB by hand or reseeding). */
export async function purgeSiteCache(): Promise<ActionResult> {
  return run({}, async () => {
    updateTag("codeforces");
    return undefined;
  });
}
