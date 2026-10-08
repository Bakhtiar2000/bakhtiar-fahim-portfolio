import type { Metadata } from "next";
import { caseStudyToForm } from "@/components/admin/configs";
import { PageHeader } from "@/components/admin/page-header";
import { SingletonEditor } from "@/components/admin/singleton-editor";
import { adminCaseStudy } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Case Study" };

export default async function Page() {
  const data = await adminCaseStudy();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Featured case study"
        description="Keep it confidential: no client names and no real product screenshots — use the diagram and abstract mockups."
      />
      <SingletonEditor kind="caseStudy" values={caseStudyToForm(data)} />
    </div>
  );
}
