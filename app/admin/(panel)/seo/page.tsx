import type { Metadata } from "next";
import { seoToForm } from "@/components/admin/configs";
import { PageHeader } from "@/components/admin/page-header";
import { SingletonEditor } from "@/components/admin/singleton-editor";
import { adminSettings } from "@/lib/admin-data";

export const metadata: Metadata = { title: "SEO" };

export default async function Page() {
  const settings = await adminSettings();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="SEO" description="Title, description and social preview image for search engines and link unfurls." />
      <SingletonEditor kind="seo" values={seoToForm(settings)} />
    </div>
  );
}
