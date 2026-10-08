import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ResumeManager } from "@/components/admin/resume-manager";
import { adminResumes } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Resume" };

export default async function Page() {
  const resumes = await adminResumes();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Resume"
        description={
          <>
            Served at <code className="font-mono">/resume</code> and <code className="font-mono">/resume.pdf</code>. Every
            “Resume” button links there.
          </>
        }
      />
      <ResumeManager resumes={resumes} />
    </div>
  );
}
