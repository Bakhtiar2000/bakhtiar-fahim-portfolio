"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSections } from "@/app/admin/content-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SECTION_META } from "@/lib/sections";
import type { SectionConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDirtyGuard } from "./dirty-guard";

function Row({ section, onChange }: { section: SectionConfig; onChange: (s: SectionConfig) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.key });
  const meta = SECTION_META[section.key];
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-xl border border-border bg-surface p-3",
        isDragging && "relative z-10 shadow-xl",
        !section.visible && "opacity-60",
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-subtle-foreground hover:bg-surface-2"
          aria-label={`Reorder ${meta.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="font-mono text-xs text-subtle-foreground">#{meta.anchor}</p>
        </div>
        <Switch
          checked={section.visible}
          onCheckedChange={(visible) => onChange({ ...section, visible })}
          aria-label={`${section.visible ? "Hide" : "Show"} ${meta.label}`}
        />
      </div>
      <label className="mt-3 flex flex-col gap-1 pl-12 text-xs text-subtle-foreground">
        Teaser line to the next section
        <Input
          value={section.teaser}
          maxLength={120}
          placeholder="e.g. The toolbox behind all of it"
          onChange={(e) => onChange({ ...section, teaser: e.target.value })}
        />
      </label>
    </li>
  );
}

export function SectionsManager({ initial }: { initial: SectionConfig[] }) {
  const [sections, setSections] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const dirty = JSON.stringify(sections) !== JSON.stringify(saved);
  useDirtyGuard("sections", dirty);

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const from = sections.findIndex((s) => s.key === e.active.id);
    const to = sections.findIndex((s) => s.key === e.over!.id);
    setSections(arrayMove(sections, from, to));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl border border-border bg-surface-2/50 p-3 text-xs text-muted-foreground">
        The hero and proof bar always come first and the footer last. Everything in between can be reordered or hidden.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {sections.map((s) => (
              <Row
                key={s.key}
                section={s}
                onChange={(next) => setSections(sections.map((x) => (x.key === next.key ? next : x)))}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <div className="flex items-center justify-end gap-3">
        {dirty && <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
        <Button
          disabled={!dirty || pending}
          onClick={() =>
            startTransition(async () => {
              const res = await saveSections({ sections });
              if (res.ok) {
                setSaved(sections);
                toast.success("Sections saved");
              } else toast.error(res.error);
            })
          }
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
          Save
        </Button>
      </div>
    </div>
  );
}
