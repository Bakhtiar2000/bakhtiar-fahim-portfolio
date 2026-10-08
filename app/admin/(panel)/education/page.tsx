import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { EducationDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Education" };

export default async function Page() {
  const items = (await adminCollection("education")) as EducationDTO[];
  return <CollectionManager collection="education" items={items} />;
}
