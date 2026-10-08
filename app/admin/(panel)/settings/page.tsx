import type { Metadata } from "next";
import { connection } from "next/server";
import { Maintenance } from "@/components/admin/maintenance";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin-data";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdminPage();
  await connection();
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, ADMIN_EMAIL } = env();
  const emailOn = Boolean(RESEND_API_KEY && CONTACT_TO_EMAIL);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Account, integrations and maintenance." />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold">Admin account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="font-mono text-foreground">{ADMIN_EMAIL}</span>. Sessions last 7 days.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          To change the password, set a new <code className="font-mono">ADMIN_PASSWORD</code> (12+ characters) in your environment
          variables and restart or redeploy. Every existing session is signed out automatically, because the session key is
          derived from the credentials.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          Email notifications {emailOn ? <Badge variant="success">On</Badge> : <Badge>Off</Badge>}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {emailOn
            ? `New contact messages are emailed to ${CONTACT_TO_EMAIL} via Resend.`
            : "Messages are stored in the inbox only. Set RESEND_API_KEY and CONTACT_TO_EMAIL to also receive them by email."}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold">Maintenance</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Saving in the admin refreshes the site automatically. Use these after editing the database directly or re-running the
          seed.
        </p>
        <Maintenance />
      </section>
    </div>
  );
}
