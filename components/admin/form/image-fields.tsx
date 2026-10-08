"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
/* eslint-disable @next/next/no-img-element -- admin previews of freshly uploaded files */
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadFile } from "./upload";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

function useUploader(onUploaded: (ids: string[]) => void) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = () => input.current?.click();
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const ids: string[] = [];
    for (const file of Array.from(files)) {
      try {
        ids.push((await uploadFile(file, "image")).id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    if (ids.length) onUploaded(ids);
  };
  return { input, busy, pick, onFiles };
}

export function ImageField({ id, value, onChange }: { id: string; value: string | null; onChange: (v: string | null) => void }) {
  const { input, busy, pick, onFiles } = useUploader((ids) => onChange(ids[0]!));
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-2">
        {value ? (
          <img src={`/api/files/${value}`} alt="Current upload preview" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-6 text-subtle-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input id={id} ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
        <Button variant="secondary" size="sm" onClick={pick} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
          {value ? "Replace image" : "Upload image"}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            <Trash2 aria-hidden="true" /> Remove
          </Button>
        )}
        <p className="text-xs text-subtle-foreground">PNG, JPEG, WebP, GIF or AVIF · max 4 MB</p>
      </div>
    </div>
  );
}

export function ImagesField({
  id,
  value,
  onChange,
  max = 12,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const { input, busy, pick, onFiles } = useUploader((ids) => onChange([...value, ...ids].slice(0, max)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((fid, i) => (
            <li key={fid} className="overflow-hidden rounded-xl border border-border bg-surface-2">
              <img src={`/api/files/${fid}`} alt={`Image ${i + 1}`} className="aspect-video w-full object-cover" />
              <div className="flex justify-between p-1">
                <span className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => move(i, -1)}
                    aria-label="Move left"
                    disabled={i === 0}
                  >
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => move(i, 1)}
                    aria-label="Move right"
                    disabled={i === value.length - 1}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => onChange(value.filter((v) => v !== fid))}
                  aria-label="Remove image"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div>
        <input
          id={id}
          ref={input}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <Button variant="secondary" size="sm" onClick={pick} disabled={busy || value.length >= max}>
          {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
          Add images
        </Button>
        <span className="ml-3 text-xs text-subtle-foreground">
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
}
