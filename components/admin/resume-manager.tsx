"use client";

import { CheckCircle2, Download, Eye, FileUp, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteResume, setActiveResume } from "@/app/admin/content-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ResumeDTO } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { uploadFile } from "./form/upload";

const MAX = 5 * 1024 * 1024;

export function ResumeManager({ resumes }: { resumes: ResumeDTO[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const active = resumes.find((r) => r.isActive);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.type && file.type !== "application/pdf") return toast.error("Only PDF files are allowed");
    if (file.size > MAX) return toast.error("The PDF must be 5 MB or smaller");
    setUploading(true);
    try {
      await uploadFile(file, "resume");
      toast.success("Resume uploaded and set as active");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(success);
        router.refresh();
      } else toast.error(res.error ?? "Failed");
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border-strong bg-surface/60 p-6 sm:flex-row sm:items-center">
        <FileUp className="size-8 text-accent-text" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-medium">Upload a new resume</p>
          <p className="text-sm text-muted-foreground">
            PDF only, up to 5 MB. It becomes the active resume immediately; older versions stay below.
          </p>
        </div>
        <input
          ref={input}
          type="file"
          accept="application/pdf"
          className="sr-only"
          id="resume-upload"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Button onClick={() => input.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <FileUp aria-hidden="true" />}
          Choose PDF
        </Button>
      </div>

      {active && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
            <p className="text-sm font-medium">Preview — {active.fileName}</p>
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="sm">
                <a href="/resume" target="_blank" rel="noopener noreferrer">
                  <Eye aria-hidden="true" /> Open /resume
                </a>
              </Button>
            </div>
          </div>
          <iframe
            src={`/api/files/${active.fileId}#view=FitH`}
            title="Active resume preview"
            className="h-[60dvh] w-full bg-surface-2"
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold">Version history</h2>
        <ul className="flex flex-col gap-2">
          {resumes.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {r.fileName}
                  {r.isActive && (
                    <Badge variant="success">
                      <CheckCircle2 className="size-3" aria-hidden="true" /> Active
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-subtle-foreground">
                  {formatDate(r.createdAt)} · {formatBytes(r.size)}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <a href={`/api/files/${r.fileId}?download=1`}>
                  <Download aria-hidden="true" /> Download
                </a>
              </Button>
              {!r.isActive && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => act(() => setActiveResume(r.id), "Active resume changed")}
                  >
                    Make active
                  </Button>
                  <ConfirmDialog
                    title="Delete this version?"
                    description={`${r.fileName} will be removed permanently.`}
                    onConfirm={() => act(() => deleteResume(r.id), "Deleted")}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Delete ${r.fileName}`}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    }
                  />
                </>
              )}
            </li>
          ))}
          {resumes.length === 0 && <li className="text-sm text-muted-foreground">No resumes uploaded yet.</li>}
        </ul>
      </div>
    </div>
  );
}
