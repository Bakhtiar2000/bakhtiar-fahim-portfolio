import type { Metadata } from "next";
import { competitiveToForm } from "@/components/admin/configs";
import { PageHeader } from "@/components/admin/page-header";
import { SingletonEditor } from "@/components/admin/singleton-editor";
import { adminSettings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Competitive Programming" };

export default async function Page() {
  const settings = await adminSettings();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Competitive programming" description="A card is shown only when it has a handle and some data." />
      <SingletonEditor kind="competitive" values={competitiveToForm(settings)} />
    </div>
  );
}
