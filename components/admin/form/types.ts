export type FormValues = Record<string, unknown>;

interface Base {
  name: string;
  label: string;
  help?: string;
  /** Span both columns of the form grid. */
  wide?: boolean;
}

export type FieldDef =
  | (Base & { kind: "text" | "email" | "url" | "number" | "month"; placeholder?: string })
  | (Base & { kind: "textarea"; placeholder?: string; rows?: number })
  | (Base & { kind: "switch" })
  | (Base & { kind: "select"; options: { value: string; label: string }[] })
  | (Base & { kind: "tags"; placeholder?: string })
  | (Base & { kind: "lines"; placeholder?: string; rows?: number })
  | (Base & { kind: "richtext" })
  | (Base & { kind: "image"; aspect?: string })
  | (Base & { kind: "images"; max?: number })
  | (Base & {
      kind: "objectList";
      fields: FieldDef[];
      newItem: FormValues;
      itemLabel: (item: FormValues, index: number) => string;
      addLabel?: string;
    })
  | { kind: "heading"; name: string; label: string; help?: string; wide?: true };
