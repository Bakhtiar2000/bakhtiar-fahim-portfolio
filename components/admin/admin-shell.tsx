"use client";

import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Code2,
  FileText,
  FolderGit2,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Menu,
  Network,
  Search,
  Settings,
  Share2,
  Trophy,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";
import { logout } from "@/app/admin/auth-actions";
import { ThemeToggle } from "@/components/site/toggles";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { confirmDiscard } from "./dirty-guard";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile & Hero", icon: User },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
  { href: "/admin/case-study", label: "Case Study", icon: Network },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/competitive", label: "Competitive Prog.", icon: Code2 },
  { href: "/admin/socials", label: "Social Links", icon: Share2 },
  { href: "/admin/resume", label: "Resume", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/sections", label: "Sections & Order", icon: LayoutList },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const guard = (e: MouseEvent) => {
    if (!confirmDiscard()) e.preventDefault();
    else onNavigate?.();
  };
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={guard}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-accent-text")} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Footer() {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2/60 hover:text-foreground"
      >
        <ArrowUpRight className="size-4" aria-hidden="true" /> View site
      </a>
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2/60 hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-4 overflow-y-auto border-r border-border bg-surface/60 p-3 lg:flex">
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Portfolio CMS</span>
          <ThemeToggle />
        </div>
        <nav aria-label="Admin" className="flex-1">
          <NavLinks />
        </nav>
        <Footer />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border px-4 py-2 glass lg:hidden">
        <span className="font-mono text-xs tracking-widest text-subtle-foreground uppercase">Portfolio CMS</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-surface-2"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent side="right" className="max-w-xs gap-4 p-4">
          <DialogTitle className="px-2 font-mono text-xs tracking-widest text-subtle-foreground uppercase">Admin</DialogTitle>
          <nav aria-label="Admin" className="flex-1">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
          <Footer />
        </DialogContent>
      </Dialog>

      <main id="admin-main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
