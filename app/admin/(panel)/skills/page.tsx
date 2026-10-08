import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { SkillGroupDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Skills" };

export default async function Page() {
  const items = (await adminCollection("skills")) as SkillGroupDTO[];
  return <CollectionManager collection="skills" items={items} />;
}
