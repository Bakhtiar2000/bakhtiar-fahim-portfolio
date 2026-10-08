"use client";

import { useRouter } from "next/navigation";
import { saveCaseStudy, saveCompetitive, saveProfile, saveSeo } from "@/app/admin/content-actions";
import { CASE_STUDY_FIELDS, COMPETITIVE_FIELDS, PROFILE_FIELDS, SCHEMAS, SEO_FIELDS } from "./configs";
import { EntityForm } from "./form/entity-form";
import type { FormValues } from "./form/types";

const EDITORS = {
  profile: { fields: PROFILE_FIELDS, schema: SCHEMAS.profile, save: saveProfile },
  caseStudy: { fields: CASE_STUDY_FIELDS, schema: SCHEMAS.caseStudy, save: saveCaseStudy },
  seo: { fields: SEO_FIELDS, schema: SCHEMAS.seo, save: saveSeo },
  competitive: { fields: COMPETITIVE_FIELDS, schema: SCHEMAS.competitive, save: saveCompetitive },
};

export function SingletonEditor({ kind, values }: { kind: keyof typeof EDITORS; values: FormValues }) {
  const router = useRouter();
  const editor = EDITORS[kind];
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-6">
      <EntityForm
        formId={kind}
        fields={editor.fields}
        schema={editor.schema}
        defaultValues={values}
        onSave={editor.save}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
