import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { ExperienceDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Experience" };

export default async function Page() {
  const items = (await adminCollection("experience")) as ExperienceDTO[];
  return <CollectionManager collection="experience" items={items} />;
}
