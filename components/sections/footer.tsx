import { FooterActions } from "@/components/site/footer-actions";
import { SocialIcon } from "@/components/site/social-icon";
import type { SocialItem } from "@/components/site/types";
import { formatDate } from "@/lib/utils";

export function Footer({
  name,
  socials,
  note,
  lastUpdated,
}: {
  name: string;
  socials: SocialItem[];
  note: string;
  lastUpdated: string | null;
}) {
  return (
    <footer className="mt-12 border-t border-border">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{name}</p>
          {note && <p className="font-mono text-xs text-subtle-foreground">{note}</p>}
          {lastUpdated && (
            <p className="font-mono text-xs text-subtle-foreground">
              Last updated <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-1" aria-label="Profiles">
            {socials.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target={s.url.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label || s.platform}
                  className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <SocialIcon platform={s.platform} iconId={s.iconId} />
                </a>
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="mx-2 h-5 w-px bg-border" />
          <FooterActions />
        </div>
      </div>
    </footer>
  );
}
