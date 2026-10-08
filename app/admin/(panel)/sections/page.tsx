import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SectionsManager } from "@/components/admin/sections-manager";
import { adminSettings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Sections & Order" };

export default async function Page() {
  const settings = await adminSettings();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Sections & order" description="Show, hide and reorder the sections of the public page." />
      <SectionsManager initial={settings.sections} />
    </div>
  );
}
