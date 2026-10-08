"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/** Chip input: Enter or comma adds, Backspace on empty removes the last chip. */
export function TagsInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  invalid,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s));
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-2 py-1.5 focus-within:border-ring",
        invalid && "border-danger",
      )}
    >
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-surface-2 py-0.5 pr-1 pl-2 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label={`Remove ${tag}`}
            className="grid size-4 cursor-pointer place-items-center rounded text-subtle-foreground hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          commit();
          onBlur?.();
        }}
        placeholder={value.length ? "" : (placeholder ?? "Type and press Enter")}
        className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-subtle-foreground focus-visible:outline-none"
      />
    </div>
  );
}
