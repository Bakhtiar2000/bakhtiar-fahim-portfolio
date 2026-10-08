import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { AchievementDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Achievements" };

export default async function Page() {
  const items = (await adminCollection("achievements")) as AchievementDTO[];
  return <CollectionManager collection="achievements" items={items} />;
}
