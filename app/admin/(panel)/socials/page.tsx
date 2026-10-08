import type { Metadata } from "next";
import { CollectionManager } from "@/components/admin/collection-manager";
import { adminCollection } from "@/lib/admin-data";
import type { SocialLinkDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Social links" };

export default async function Page() {
  const items = (await adminCollection("socials")) as SocialLinkDTO[];
  return <CollectionManager collection="socials" items={items} />;
}
