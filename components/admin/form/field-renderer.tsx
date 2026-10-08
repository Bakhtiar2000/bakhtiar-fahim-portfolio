"use client";

import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, get, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ImageField, ImagesField } from "./image-fields";
import { RichTextEditor } from "./rich-text-editor";
import { TagsInput } from "./tags-input";
import type { FieldDef, FormValues } from "./types";

const fieldId = (name: string) => `f-${name.replace(/\./g, "-")}`;

/** One-item-per-line textarea backed by a string[]; keeps the raw text while typing. */
function LinesInput({
  id,
  value,
  onChange,
  onBlur,
  rows,
  placeholder,
  invalid,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  onBlur: () => void;
  rows?: number;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [raw, setRaw] = useState(value.join("\n"));
  const [focused, setFocused] = useState(false);
  const parsed = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  // Re-sync when the form is reset from outside (derived state, adjusted during render).
  if (!focused && parsed.join("\n") !== value.join("\n")) {
    setRaw(value.join("\n"));
  }
  return (
    <Textarea
      id={id}
      rows={rows ?? Math.max(3, value.length + 1)}
      value={raw}
      placeholder={placeholder ?? "One item per line"}
      aria-invalid={invalid || undefined}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
    />
  );
}

function ObjectList({ field, prefix }: { field: Extract<FieldDef, { kind: "objectList" }>; prefix: string }) {
  const { control } = useFormContext();
  const name = prefix + field.name;
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const items = (useWatch({ control, name }) as FormValues[] | undefined) ?? [];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {fields.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.id} className="rounded-xl border border-border bg-background/40">
            <div className="flex items-center gap-1 p-1.5 pl-3">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1 text-left text-sm font-medium"
              >
                <ChevronDown className={cn("size-4 shrink-0 transition-transform", !isOpen && "-rotate-90")} aria-hidden="true" />
                <span className="truncate">{field.itemLabel(items[i] ?? {}, i)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => move(i, i + 1)}
                disabled={i === fields.length - 1}
                aria-label="Move down"
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => remove(i)} aria-label="Remove">
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
            {isOpen && (
              <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
                {field.fields.map((sub) => (
                  <FieldRenderer key={sub.name} field={sub} prefix={`${name}.${i}.`} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            append(structuredClone(field.newItem));
            setOpen(fields.length);
          }}
        >
          <Plus aria-hidden="true" /> {field.addLabel ?? "Add item"}
        </Button>
      </div>
    </div>
  );
}

export function FieldRenderer({ field, prefix = "" }: { field: FieldDef; prefix?: string }) {
  const { register, control, formState } = useFormContext();
  const name = prefix + field.name;
  const id = fieldId(name);
  const error = get(formState.errors, name) as { message?: string; root?: { message?: string } } | undefined;
  const message = error?.message ?? error?.root?.message;
  const invalid = Boolean(message);
  const describedBy = [field.help && `${id}-help`, message && `${id}-error`].filter(Boolean).join(" ") || undefined;

  if (field.kind === "heading") {
    return (
      <div className="pt-4 sm:col-span-2">
        <h3 className="text-sm font-semibold">{field.label}</h3>
        {field.help && <p className="mt-1 text-xs text-subtle-foreground">{field.help}</p>}
      </div>
    );
  }

  let control_;
  switch (field.kind) {
    case "text":
    case "email":
    case "url":
    case "number":
    case "month":
      control_ = (
        <Input
          id={id}
          type={field.kind === "text" ? "text" : field.kind}
          placeholder={field.placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...register(name)}
        />
      );
      break;
    case "textarea":
      control_ = (
        <Textarea
          id={id}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...register(name)}
        />
      );
      break;
    case "select":
      control_ = (
        <NativeSelect id={id} aria-invalid={invalid || undefined} aria-describedby={describedBy} {...register(name)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      );
      break;
    case "switch":
      return (
        <div
          className={cn(
            "flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5",
            field.wide && "sm:col-span-2",
          )}
        >
          <div>
            <Label htmlFor={id}>{field.label}</Label>
            {field.help && <p className="text-xs text-subtle-foreground">{field.help}</p>}
          </div>
          <Controller
            control={control}
            name={name}
            render={({ field: f }) => (
              <Switch id={id} checked={Boolean(f.value)} onCheckedChange={f.onChange} onBlur={f.onBlur} />
            )}
          />
        </div>
      );
    case "tags":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <TagsInput
              id={id}
              value={(f.value as string[]) ?? []}
              onChange={f.onChange}
              onBlur={f.onBlur}
              placeholder={field.placeholder}
              invalid={invalid}
            />
          )}
        />
      );
      break;
    case "lines":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <LinesInput
              id={id}
              value={(f.value as string[]) ?? []}
              onChange={f.onChange}
              onBlur={f.onBlur}
              rows={field.rows}
              placeholder={field.placeholder}
              invalid={invalid}
            />
          )}
        />
      );
      break;
    case "richtext":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <RichTextEditor id={id} value={(f.value as string) ?? ""} onChange={f.onChange} onBlur={f.onBlur} />
          )}
        />
      );
      break;
    case "image":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => <ImageField id={id} value={(f.value as string | null) ?? null} onChange={f.onChange} />}
        />
      );
      break;
    case "images":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <ImagesField id={id} value={(f.value as string[]) ?? []} onChange={f.onChange} max={field.max} />
          )}
        />
      );
      break;
    case "objectList":
      control_ = <ObjectList field={field} prefix={prefix} />;
      break;
  }

  const wide = field.wide || ["richtext", "objectList", "images", "lines"].includes(field.kind);
  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      {field.kind === "objectList" ? (
        <span className="text-sm font-medium">{field.label}</span>
      ) : (
        <Label htmlFor={id}>{field.label}</Label>
      )}
      {control_}
      {field.help && (
        <p id={`${id}-help`} className="text-xs text-subtle-foreground">
          {field.help}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
