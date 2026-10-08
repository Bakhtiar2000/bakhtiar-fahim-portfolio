"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useTransition } from "react";
import { FormProvider, useForm, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { useDirtyGuard } from "../dirty-guard";
import { FieldRenderer } from "./field-renderer";
import type { FieldDef, FormValues } from "./types";

export function EntityForm<R>({
  formId,
  fields,
  schema,
  defaultValues,
  onSave,
  onSaved,
  submitLabel = "Save changes",
  sticky = true,
}: {
  formId: string;
  fields: FieldDef[];
  schema: z.ZodType;
  defaultValues: FormValues;
  onSave: (values: unknown) => Promise<ActionResult<R>>;
  onSaved?: (result: ActionResult<R>) => void;
  submitLabel?: string;
  sticky?: boolean;
}) {
  const methods = useForm<FieldValues>({
    // zodResolver is typed against the schema's own input/output; the form treats values generically.
    resolver: zodResolver(schema as z.ZodType<FieldValues, FieldValues>) as unknown as Resolver<FieldValues>,
    defaultValues,
    mode: "onTouched",
  });
  const [pending, startTransition] = useTransition();
  const { isDirty } = methods.formState;
  useDirtyGuard(formId, isDirty);

  const onSubmit = methods.handleSubmit((values) =>
    startTransition(async () => {
      const result = await onSave(values);
      if (result.ok) {
        toast.success(result.message ?? "Saved");
        // Re-baseline so the form is clean but keeps what the user typed.
        methods.reset(methods.getValues());
        onSaved?.(result);
      } else {
        toast.error(result.error);
        for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
          methods.setError(path as Path<FieldValues>, { message });
        }
      }
    }),
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <FieldRenderer key={f.name} field={f} />
          ))}
        </div>
        <div
          className={cn(
            "flex items-center justify-end gap-3 border-t border-border pt-4",
            sticky && "sticky bottom-0 z-10 -mx-1 bg-surface px-1 pb-4",
          )}
        >
          {isDirty && <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
          {isDirty && (
            <Button variant="ghost" onClick={() => methods.reset()} disabled={pending}>
              Discard
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
