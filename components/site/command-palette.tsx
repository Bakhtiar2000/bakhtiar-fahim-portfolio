"use client";

import { Command } from "cmdk";
import { ArrowUpRight, Copy, Hash, Moon, SquareTerminal, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/client/analytics";
import { scrollToId } from "@/lib/client/scroll";
import { OPEN_PALETTE_EVENT, OPEN_TERMINAL_EVENT, setRecruiterMode, toggleTheme } from "@/lib/client/stores";
import { SocialIcon } from "./social-icon";
import type { SiteChrome } from "./types";

function Item({ onSelect, icon, children, hint }: { onSelect: () => void; icon: ReactNode; children: ReactNode; hint?: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground data-[selected=true]:bg-surface-2 data-[selected=true]:text-foreground [&_svg]:size-4"
    >
      <span className="grid size-6 place-items-center">{icon}</span>
      <span className="flex-1">{children}</span>
      {hint && <span className="font-mono text-[11px] text-subtle-foreground">{hint}</span>}
    </Command.Item>
  );
}

const group =
  "px-1 py-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-subtle-foreground [&_[cmdk-group-heading]]:uppercase";

/** ⌘K / Ctrl+K: jump anywhere, open the resume, copy the email, toggle theme. */
export function CommandPalette({ chrome, defaultOpen = false }: { chrome: SiteChrome; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    // Let the dialog close (and restore scroll) before acting.
    setTimeout(fn, 120);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent hideClose className="top-[18%] max-w-lg translate-y-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search for a section or an action</DialogDescription>
        <Command loop className="flex flex-col">
          <Command.Input
            autoFocus
            placeholder="Type a command or search…"
            className="h-12 border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-subtle-foreground focus-visible:outline-none"
          />
          <Command.List className="max-h-[min(60dvh,380px)] overflow-y-auto p-1" data-lenis-prevent>
            <Command.Empty className="py-8 text-center text-sm text-subtle-foreground">No results.</Command.Empty>
            <Command.Group heading="Jump to" className={group}>
              {chrome.sections.map((s) => (
                <Item key={s.id} icon={<Hash />} onSelect={() => run(() => scrollToId(s.id))}>
                  {s.label}
                </Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions" className={group}>
              <Item
                icon={<ArrowUpRight />}
                hint="new tab"
                onSelect={() =>
                  run(() => {
                    trackEvent("resume_click", { from: "palette" });
                    window.open("/resume", "_blank", "noopener,noreferrer");
                  })
                }
              >
                Open resume
              </Item>
              <Item
                icon={<Copy />}
                onSelect={() =>
                  run(async () => {
                    try {
                      await navigator.clipboard.writeText(chrome.email);
                      toast.success("Email copied to clipboard");
                    } catch {
                      toast(chrome.email);
                    }
                  })
                }
              >
                Copy email
              </Item>
              <Item icon={<Moon />} onSelect={() => run(toggleTheme)}>
                Toggle theme
              </Item>
              <Item
                icon={<Zap />}
                onSelect={() => run(() => setRecruiterMode(document.documentElement.getAttribute("data-recruiter") !== "on"))}
              >
                Toggle 30-second view
              </Item>
              <Item icon={<SquareTerminal />} onSelect={() => run(() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT)))}>
                Open terminal
              </Item>
            </Command.Group>
            {chrome.socials.length > 0 && (
              <Command.Group heading="Profiles" className={group}>
                {chrome.socials.map((s) => (
                  <Item
                    key={s.url}
                    icon={<SocialIcon platform={s.platform} iconId={s.iconId} />}
                    hint={s.url.startsWith("mailto:") ? undefined : "new tab"}
                    onSelect={() =>
                      run(() =>
                        s.url.startsWith("mailto:")
                          ? (window.location.href = s.url)
                          : window.open(s.url, "_blank", "noopener,noreferrer"),
                      )
                    }
                  >
                    {s.label || s.platform}
                  </Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
