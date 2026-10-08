import { ArrowLeft, Download, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSiteContent();
  return {
    title: "Resume",
    description: `Resume of ${profile.name} — ${profile.title}.`,
    alternates: { canonical: "/resume" },
  };
}

export default async function ResumePage() {
  const { profile, activeResumeFileId } = await getSiteContent();
  const src = activeResumeFileId ? `/api/files/${activeResumeFileId}` : null;

  return (
    <div className="flex h-dvh flex-col">
      <header className="z-10 border-b border-border glass">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-sm font-semibold sm:text-base">{profile.name}</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{profile.title} · Resume</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              <span className="hidden sm:inline">Back to portfolio</span>
              <span className="sm:hidden">Portfolio</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/#contact">
              <Mail aria-hidden="true" /> Contact
            </Link>
          </Button>
          {src && (
            <Button asChild size="sm">
              <a href={`${src}?download=1`} download>
                <Download aria-hidden="true" /> Download PDF
              </a>
            </Button>
          )}
        </div>
      </header>

      {src ? (
        <main className="relative flex-1 bg-surface-2">
          <iframe
            src={`${src}#view=FitH`}
            title={`${profile.name} — resume (PDF)`}
            className="absolute inset-0 size-full border-0"
          />
          {/* Many mobile browsers can't render PDFs inline; give them a clear way out. */}
          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-border-strong bg-surface p-4 text-sm shadow-xl sm:hidden">
            <p className="text-muted-foreground">PDF not showing on your phone?</p>
            <a href={src} className="mt-1 inline-block font-medium text-accent-text underline underline-offset-4">
              Open the PDF directly
            </a>
          </div>
        </main>
      ) : (
        <main className="grid flex-1 place-items-center p-6 text-center">
          <div>
            <p className="text-lg font-medium">The resume is being updated.</p>
            <p className="mt-2 text-muted-foreground">
              Please check back soon, or email{" "}
              <a className="text-accent-text underline" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              .
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
