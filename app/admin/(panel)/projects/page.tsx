import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { ProjectDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Projects" };

export default async function Page() {
  const items = (await adminCollection("projects")) as ProjectDTO[];
  return <CollectionManager collection="projects" items={items} />;
}
