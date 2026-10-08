import type { Metadata } from "next";
import { profileToForm } from "@/components/admin/configs";
import { PageHeader } from "@/components/admin/page-header";
import { SingletonEditor } from "@/components/admin/singleton-editor";
import { adminProfile } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Profile & Hero" };

export default async function Page() {
  const profile = await adminProfile();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Profile & Hero" description="The first screen, About section, contact details and the 30-second view." />
      <SingletonEditor kind="profile" values={profileToForm(profile)} />
    </div>
  );
}
