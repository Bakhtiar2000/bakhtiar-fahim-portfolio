import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { StatDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Stats" };

export default async function Page() {
  const items = (await adminCollection("stats")) as StatDTO[];
  return <CollectionManager collection="stats" items={items} />;
}
