"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { scrollToId } from "@/lib/client/scroll";
import { OPEN_TERMINAL_EVENT } from "@/lib/client/stores";

export interface TerminalData {
  name: string;
  title: string;
  location: string;
  email: string;
  skills: string[];
  experience: string[];
  projects: string[];
  contactId: string | null;
}

interface Line {
  kind: "in" | "out" | "ok" | "err";
  text: string;
}

const HELP = [
  "help          list commands",
  "whoami        who is this guy?",
  "skills        the toolbox",
  "experience    where I've worked",
  "projects      things I've shipped",
  "resume        open my resume (new tab)",
  "contact       jump to the contact form",
  "clear         clear the screen",
  "sudo hire fahim",
];

export function Terminal({ data, defaultOpen = false }: { data: TerminalData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: "Welcome. Type `help` to get started." }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_TERMINAL_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, onOpen);
  }, []);

  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [lines]);

  function run(raw: string) {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
    const out: Line[] = [{ kind: "in", text: raw }];
    const say = (text: string, kind: Line["kind"] = "out") => out.push({ kind, text });

    switch (cmd) {
      case "":
        break;
      case "help":
        HELP.forEach((h) => say(h));
        break;
      case "whoami":
        say(`${data.name} — ${data.title}`);
        if (data.location) say(`📍 ${data.location}`);
        break;
      case "skills":
        say(data.skills.join(" · "));
        break;
      case "experience":
        data.experience.forEach((e) => say(`▹ ${e}`));
        break;
      case "projects":
        data.projects.forEach((p) => say(`▹ ${p}`));
        break;
      case "resume":
        say("Opening /resume in a new tab…", "ok");
        window.open("/resume", "_blank", "noopener,noreferrer");
        break;
      case "contact":
        say(`Email: ${data.email}`);
        if (data.contactId) {
          say("Taking you to the contact form…", "ok");
          setTimeout(() => {
            setOpen(false);
            scrollToId(data.contactId!);
          }, 500);
        }
        break;
      case "clear":
        setLines([]);
        return;
      case "sudo hire fahim":
      case "sudo hire":
        say("[sudo] password for recruiter: ********");
        say("✔ Permission granted. Excellent decision.", "ok");
        say("Opening a line of communication…", "ok");
        if (data.contactId) {
          setTimeout(() => {
            setOpen(false);
            scrollToId(data.contactId!);
          }, 1100);
        }
        break;
      default:
        if (cmd.startsWith("sudo")) say("Nice try. Only `sudo hire fahim` is allowed here.", "err");
        else say(`command not found: ${cmd}. Try \`help\`.`, "err");
    }
    setLines((prev) => [...prev, ...out]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(value);
      if (value.trim()) setHistory((h) => [value, ...h].slice(0, 30));
      setValue("");
      setCursor(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setValue(history[next]!);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next >= 0 ? history[next]! : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  const color: Record<Line["kind"], string> = {
    in: "text-zinc-100",
    out: "text-zinc-400",
    ok: "text-emerald-400",
    err: "text-red-400",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl border-zinc-700 bg-zinc-950 p-0 text-zinc-100">
        <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-amber-400/80" />
          <span className="size-3 rounded-full bg-emerald-500/80" />
          <DialogTitle className="ml-3 font-mono text-xs font-normal text-zinc-400">guest@fahim: ~</DialogTitle>
        </div>
        <DialogDescription className="sr-only">An interactive terminal. Type help for a list of commands.</DialogDescription>
        <div
          className="h-80 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
          data-lenis-prevent
          onClick={() => document.getElementById("terminal-input")?.focus()}
          role="log"
          aria-live="polite"
        >
          {lines.map((l, i) => (
            <p key={i} className={`break-words whitespace-pre-wrap ${color[l.kind]}`}>
              {l.kind === "in" && <span className="text-cyan-400">❯ </span>}
              {l.text}
            </p>
          ))}
          <div className="flex items-center gap-2" ref={bottom}>
            <span aria-hidden="true" className="text-cyan-400">
              ❯
            </span>
            <label htmlFor="terminal-input" className="sr-only">
              Command
            </label>
            <input
              id="terminal-input"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 bg-transparent text-zinc-100 caret-cyan-400 outline-none focus-visible:outline-none"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
