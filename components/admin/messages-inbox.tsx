"use client";

import { Archive, ArchiveRestore, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMessage, updateMessage } from "@/app/admin/content-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { MessageDTO } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type Filter = "inbox" | "unread" | "archived";

export function MessagesInbox({ messages: initial }: { messages: MessageDTO[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initial);
  const [syncedFrom, setSyncedFrom] = useState(initial);
  const [filter, setFilter] = useState<Filter>("inbox");
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (initial !== syncedFrom) {
    setSyncedFrom(initial);
    setMessages(initial);
  }

  const patch = (id: string, change: Partial<Pick<MessageDTO, "read" | "archived">>, toastText?: string) => {
    const previous = messages;
    setMessages(messages.map((m) => (m.id === id ? { ...m, ...change } : m)));
    startTransition(async () => {
      const res = await updateMessage(id, change);
      if (!res.ok) {
        setMessages(previous);
        toast.error(res.error);
      } else if (toastText) toast.success(toastText);
    });
  };

  const remove = (id: string) => {
    const previous = messages;
    setMessages(messages.filter((m) => m.id !== id));
    startTransition(async () => {
      const res = await deleteMessage(id);
      if (!res.ok) {
        setMessages(previous);
        toast.error(res.error);
      } else {
        toast.success("Message deleted");
        router.refresh();
      }
    });
  };

  const visible = messages.filter((m) => (filter === "archived" ? m.archived : !m.archived && (filter === "inbox" || !m.read)));
  const counts = {
    inbox: messages.filter((m) => !m.archived).length,
    unread: messages.filter((m) => !m.archived && !m.read).length,
    archived: messages.filter((m) => m.archived).length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1" role="tablist" aria-label="Filter messages">
        {(["inbox", "unread", "archived"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm capitalize transition-colors",
              filter === f ? "bg-surface-2 font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f} <span className="font-mono text-xs text-subtle-foreground">{counts[f]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No messages here.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {visible.map((m) => {
          const open = openId === m.id;
          return (
            <li
              key={m.id}
              className={cn("rounded-xl border bg-surface", !m.read && !m.archived ? "border-accent-from/40" : "border-border")}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => {
                  setOpenId(open ? null : m.id);
                  if (!open && !m.read) patch(m.id, { read: true });
                }}
                className="flex w-full cursor-pointer items-start gap-3 p-4 text-left"
              >
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", m.read ? "bg-transparent" : "bg-accent-from")}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className={cn("truncate text-sm", !m.read && "font-semibold")}>
                      {m.name}
                      {m.company && <span className="font-normal text-subtle-foreground"> · {m.company}</span>}
                    </span>
                    <time dateTime={m.createdAt} className="font-mono text-xs text-subtle-foreground">
                      {formatDate(m.createdAt)}
                    </time>
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">{m.subject}</span>
                  {!m.read && <span className="sr-only">Unread</span>}
                </span>
              </button>
              {open && (
                <div className="border-t border-border p-4">
                  <p className="mb-3 font-mono text-xs text-subtle-foreground">{m.email}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>
                        <Reply aria-hidden="true" /> Reply
                      </a>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => patch(m.id, { read: !m.read })}>
                      {m.read ? <Mail aria-hidden="true" /> : <MailOpen aria-hidden="true" />}
                      Mark {m.read ? "unread" : "read"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => patch(m.id, { archived: !m.archived }, m.archived ? "Moved to inbox" : "Archived")}
                    >
                      {m.archived ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
                      {m.archived ? "Unarchive" : "Archive"}
                    </Button>
                    <ConfirmDialog
                      title="Delete this message?"
                      description="This cannot be undone."
                      onConfirm={() => remove(m.id)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Trash2 aria-hidden="true" /> Delete
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
