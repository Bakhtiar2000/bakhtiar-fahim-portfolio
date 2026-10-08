"use client";

import { ArrowUpRight, Code2, MessageSquare, Server } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/client/analytics";
import { scrollToId } from "@/lib/client/scroll";
import { prefillContact } from "@/lib/client/stores";
import type { ProjectDTO } from "@/lib/types";
import { cn, fileUrl, isSafeHref } from "@/lib/utils";

function ProjectLinks({ project, size = "sm" }: { project: ProjectDTO; size?: "sm" | "md" }) {
  const links = [
    { href: project.liveUrl, label: "Live", icon: ArrowUpRight, kind: "live" },
    {
      href: project.clientRepo,
      label: "Client Code",
      icon: Code2,
      kind: "client",
    },
    {
      href: project.serverRepo,
      label: "Server Code",
      icon: Server,
      kind: "server",
    },
  ].filter((l) => l.href && isSafeHref(l.href));
  if (!links.length) return null;
  return (
    <div className="relative z-10 flex flex-wrap gap-2">
      {links.map(({ href, label, icon: Icon, kind }) => (
        <Button key={kind} asChild size={size} variant={kind === "live" ? "primary" : "secondary"}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("project_link", { project: project.slug, kind })}
            aria-label={`${label} — ${project.title} (opens in a new tab)`}
          >
            {label} <Icon aria-hidden="true" />
          </a>
        </Button>
      ))}
    </div>
  );
}

function Cover({ project, className }: { project: ProjectDTO; className?: string }) {
  const src = fileUrl(project.coverFileId);
  if (src) {
    return (
      <Image
        src={src}
        alt={`${project.title} screenshot`}
        width={960}
        height={600}
        sizes="(min-width: 768px) 50vw, 100vw"
        className={cn("aspect-[16/10] w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn("relative grid aspect-[16/10] w-full place-items-center overflow-hidden bg-surface-2", className)}
    >
      <div className="absolute inset-0 bg-grid [mask-image:none] opacity-80" />
      <div
        className="absolute -inset-1/4 opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--accent-from), transparent 50%), radial-gradient(circle at 75% 70%, var(--accent-to), transparent 45%)",
        }}
      />
      <span className="relative font-mono text-4xl font-bold tracking-tighter text-foreground/80 sm:text-5xl">
        {project.title
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 3)}
      </span>
    </div>
  );
}

export function ProjectsGrid({ projects, contactId }: { projects: ProjectDTO[]; contactId: string | null }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const techs = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.tech.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 12);
  }, [projects]);

  const visible = filter ? projects.filter((p) => p.tech.includes(filter)) : projects;
  const open = projects.find((p) => p.slug === openSlug) ?? null;

  return (
    <>
      {techs.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by technology">
          {[null, ...techs].map((t) => (
            <button
              key={t ?? "all"}
              type="button"
              onClick={() => setFilter(t)}
              aria-pressed={filter === t}
              className={cn(
                "h-8 cursor-pointer rounded-full border px-3 font-mono text-xs transition-colors",
                filter === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {t ?? "All"}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-5 md:grid-cols-2">
        {visible.map((p) => (
          <li key={p.slug}>
            <SpotlightCard className="group flex h-full flex-col overflow-hidden">
              <Cover project={p} className="border-b border-border transition-transform duration-500 group-hover:scale-[1.02]" />
              <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {p.role && <Badge variant="accent">{p.role}</Badge>}
                  {p.category && <Badge variant="mono">{p.category}</Badge>}
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    <button
                      type="button"
                      onClick={() => setOpenSlug(p.slug)}
                      className="cursor-pointer text-left after:absolute after:inset-0 after:content-['']"
                    >
                      {p.title}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.pitch}</p>
                </div>
                <ul className="flex flex-wrap gap-1.5" aria-label="Tech">
                  {p.tech.slice(0, 6).map((t) => (
                    <li key={t}>
                      <Badge variant="mono">{t}</Badge>
                    </li>
                  ))}
                  {p.tech.length > 6 && (
                    <li>
                      <Badge variant="mono">+{p.tech.length - 6}</Badge>
                    </li>
                  )}
                </ul>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  <ProjectLinks project={p} />
                  <span className="font-mono text-xs text-subtle-foreground transition-colors group-hover:text-foreground">
                    Case study →
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </li>
        ))}
      </ul>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenSlug(null)}>
        {open && (
          <DialogContent side="right" className="p-0">
            <Cover project={open} />
            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <div className="flex flex-wrap gap-2">
                  {open.role && <Badge variant="accent">{open.role}</Badge>}
                  {open.category && <Badge variant="mono">{open.category}</Badge>}
                </div>
                <DialogTitle className="mt-3 text-2xl">{open.title}</DialogTitle>
                <DialogDescription className="mt-2 text-base">{open.pitch}</DialogDescription>
              </div>

              {open.descriptionHtml && (
                <div className="prose-rich text-sm" dangerouslySetInnerHTML={{ __html: open.descriptionHtml }} />
              )}

              {open.features.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Features by user</h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {open.features.map((f) => (
                      <div key={f.audience} className="rounded-xl border border-border bg-background/40 p-4">
                        <p className="text-sm font-semibold">{f.audience}</p>
                        <ul className="mt-2 space-y-1.5">
                          {f.items.map((item) => (
                            <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent-to" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {open.challenges.length > 0 && (
                <div>
                  <h4 className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Challenges & focus</h4>
                  <ul className="mt-3 space-y-2">
                    {open.challenges.map((c) => (
                      <li key={c} className="flex gap-2 text-sm text-muted-foreground">
                        <span aria-hidden="true" className="text-accent-text">
                          ▹
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Tech</h4>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {open.tech.map((t) => (
                    <li key={t}>
                      <Badge variant="mono">{t}</Badge>
                    </li>
                  ))}
                </ul>
              </div>

              {open.galleryFileIds.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {open.galleryFileIds.map((fid, i) => (
                    <Image
                      key={fid}
                      src={fileUrl(fid)!}
                      alt={`${open.title} screenshot ${i + 1}`}
                      width={800}
                      height={500}
                      sizes="(min-width: 640px) 280px, 100vw"
                      className="h-auto w-full rounded-lg border border-border"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-border pt-6">
                <ProjectLinks project={open} size="md" />
                {contactId && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      prefillContact(`About ${open.title}`);
                      setOpenSlug(null);
                      setTimeout(() => scrollToId(contactId), 250);
                    }}
                  >
                    <MessageSquare aria-hidden="true" /> Discuss this
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
