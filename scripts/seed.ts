/**
 * npm run seed
 *
 * Idempotent: reloads all portfolio content from lib/seed-data.ts. Uploaded
 * files (photo, project images, OG image, resumes) are kept, and the Messages
 * inbox is never touched. A placeholder resume is created only if none exists.
 */
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import {
  Achievement,
  CaseStudy,
  Education,
  Experience,
  FileModel,
  Profile,
  Project,
  RateLimit,
  Resume,
  SiteSettings,
  SkillGroup,
  SocialLink,
  Stat,
} from "../lib/models";
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
} from "../lib/seed-data";
import { sha256 } from "../lib/security";
import { buildPlaceholderPdf } from "./placeholder-pdf";

const toDate = (iso: string | null) => (iso ? new Date(iso) : null);

async function main() {
  await connectDB();
  console.log(`Connected to ${mongoose.connection.name}`);

  await Promise.all([RateLimit.createIndexes(), Resume.createIndexes(), Project.createIndexes(), FileModel.createIndexes()]);

  // Singletons: $set keeps uploaded file references (photo, mockups, OG image).
  await Profile.updateOne({}, { $set: seedProfile }, { upsert: true });
  await CaseStudy.updateOne({}, { $set: seedCaseStudy }, { upsert: true });
  await SiteSettings.updateOne({}, { $set: seedSettings }, { upsert: true });

  await Stat.deleteMany({});
  await Stat.insertMany(seedStats);
  await Experience.deleteMany({});
  await Experience.insertMany(seedExperience.map((e) => ({ ...e, startDate: toDate(e.startDate), endDate: toDate(e.endDate) })));
  await SkillGroup.deleteMany({});
  await SkillGroup.insertMany(seedSkillGroups);
  await Education.deleteMany({});
  await Education.insertMany(seedEducation);
  await Achievement.deleteMany({});
  await Achievement.insertMany(seedAchievements.map((a) => ({ ...a, date: toDate(a.date) })));
  await SocialLink.deleteMany({});
  await SocialLink.insertMany(seedSocials);

  // Projects: upsert by slug so cover/gallery uploads survive a reseed.
  const slugs = seedProjects.map((p) => p.slug);
  await Project.deleteMany({ slug: { $nin: slugs } });
  for (const project of seedProjects) {
    await Project.updateOne({ slug: project.slug }, { $set: { ...project } }, { upsert: true });
  }

  if ((await Resume.countDocuments()) === 0) {
    const data = buildPlaceholderPdf([
      seedProfile.name,
      seedProfile.title,
      "",
      "This is a placeholder resume.",
      "Upload the real PDF in /admin/resume.",
      `Contact: ${seedProfile.email}`,
    ]);
    const file = await FileModel.create({
      filename: "resume-placeholder.pdf",
      contentType: "application/pdf",
      size: data.length,
      sha256: sha256(data),
      kind: "pdf",
      data,
    });
    await Resume.create({ fileId: file._id, fileName: "resume-placeholder.pdf", size: data.length, isActive: true });
    console.log("Created placeholder resume");
  }

  console.log("Seed complete. Messages were not touched.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
