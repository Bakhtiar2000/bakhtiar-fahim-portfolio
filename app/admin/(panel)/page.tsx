import { ArrowUpRight, FileText, FolderGit2, Inbox, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminDashboard } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function Stat({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const body = (
    <>
      <p className="text-xs text-subtle-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-border bg-surface p-5">{body}</div>
  );
}

export default async function DashboardPage() {
  const d = await adminDashboard();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Dashboard"
        description="Everything you change here appears on the public site as soon as you save."
        action={
          <Button asChild variant="secondary">
            <a href="/" target="_blank" rel="noopener noreferrer">
              View site <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        }
      />

      {!d.seeded && (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          The database has no content yet, so the site is showing built-in defaults. Run{" "}
          <code className="font-mono">npm run seed</code> once.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Unread messages" value={d.unread} href="/admin/messages" />
        <Stat label="Total messages" value={d.total} href="/admin/messages" />
        <Stat label="Archived" value={d.archived} href="/admin/messages" />
        <Stat label="Last content update" value={d.lastUpdated ? formatDate(d.lastUpdated) : "—"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Latest messages</h2>
            <Link href="/admin/messages" className="text-sm text-accent-text hover:underline">
              Open inbox
            </Link>
          </div>
          {d.latest.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {d.latest.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`size-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-accent-from"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${m.read ? "" : "font-semibold"}`}>
                      {m.name} <span className="font-normal text-subtle-foreground">— {m.subject}</span>
                    </p>
                  </div>
                  <time className="font-mono text-xs text-subtle-foreground" dateTime={m.createdAt}>
                    {formatDate(m.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-2 font-semibold">Quick links</h2>
          {[
            { href: "/admin/profile", label: "Edit hero & profile", icon: User },
            { href: "/admin/projects", label: "Manage projects", icon: FolderGit2 },
            { href: "/admin/resume", label: "Upload a resume", icon: FileText },
            { href: "/admin/messages", label: "Read messages", icon: Inbox },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden="true" /> {label}
            </Link>
          ))}
          <div className="mt-3 border-t border-border pt-3 text-xs text-subtle-foreground">
            Active resume: {d.activeResume ? <Badge variant="success">{d.activeResume.fileName}</Badge> : <Badge>none</Badge>}
          </div>
        </section>
      </div>
    </div>
  );
}
