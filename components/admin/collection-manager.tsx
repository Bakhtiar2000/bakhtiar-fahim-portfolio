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
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteItem, reorderItems, saveItem, setPublished } from "@/app/admin/content-actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { CollectionKey } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { COLLECTION_CONFIGS, type CollectionConfig, type CollectionItems } from "./configs";
import { confirmDiscard } from "./dirty-guard";
import { EntityForm } from "./form/entity-form";
import { PageHeader } from "./page-header";

type Item = { id: string; published: boolean };

function Row<D extends Item>({
  item,
  config,
  onEdit,
  onDelete,
  onTogglePublished,
}: {
  item: D;
  config: CollectionConfig<D>;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const title = config.itemTitle(item);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-surface p-2 pr-3 sm:gap-3",
        isDragging && "relative z-10 border-accent-from/50 shadow-xl",
        !item.published && "opacity-60",
      )}
    >
      <button
        type="button"
        className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-subtle-foreground hover:bg-surface-2 active:cursor-grabbing"
        aria-label={`Reorder ${title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 cursor-pointer text-left">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-subtle-foreground">{config.itemSubtitle(item)}</span>
      </button>
      <Switch
        checked={item.published}
        onCheckedChange={onTogglePublished}
        aria-label={item.published ? `Unpublish ${title}` : `Publish ${title}`}
      />
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${title}`}>
        <Pencil aria-hidden="true" />
      </Button>
      <ConfirmDialog
        title={`Delete “${title}”?`}
        description="This removes it from the site permanently."
        onConfirm={onDelete}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Delete ${title}`}>
            <Trash2 aria-hidden="true" />
          </Button>
        }
      />
    </li>
  );
}

export function CollectionManager<K extends CollectionKey>({
  collection,
  items: initial,
}: {
  collection: K;
  items: CollectionItems[K][];
}) {
  const config = COLLECTION_CONFIGS[collection] as unknown as CollectionConfig<CollectionItems[K]>;
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [syncedFrom, setSyncedFrom] = useState(initial);
  const [editing, setEditing] = useState<CollectionItems[K] | "new" | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Take fresh server data after router.refresh().
  if (initial !== syncedFrom) {
    setSyncedFrom(initial);
    setItems(initial);
  }

  const refresh = () => startTransition(() => router.refresh());

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    const next = arrayMove(items, from, to);
    const previous = items;
    setItems(next); // optimistic
    startTransition(async () => {
      const res = await reorderItems(
        collection,
        next.map((i) => i.id),
      );
      if (res.ok) toast.success("Order saved");
      else {
        setItems(previous);
        toast.error(res.error);
      }
    });
  }

  function togglePublished(id: string, value: boolean) {
    const previous = items;
    setItems(items.map((i) => (i.id === id ? { ...i, published: value } : i)));
    startTransition(async () => {
      const res = await setPublished(collection, id, value);
      if (res.ok) toast.success(value ? "Published" : "Unpublished");
      else {
        setItems(previous);
        toast.error(res.error);
      }
    });
  }

  function remove(id: string) {
    const previous = items;
    setItems(items.filter((i) => i.id !== id));
    startTransition(async () => {
      const res = await deleteItem(collection, id);
      if (res.ok) {
        toast.success("Deleted");
        refresh();
      } else {
        setItems(previous);
        toast.error(res.error);
      }
    });
  }

  const editingItem = editing === "new" ? null : editing;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" /> New {config.singular}
          </Button>
        }
      />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Create the first {config.singular}.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  config={config}
                  onEdit={() => setEditing(item)}
                  onDelete={() => remove(item.id)}
                  onTogglePublished={(v) => togglePublished(item.id, v)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <p className="mt-4 text-xs text-subtle-foreground">Drag the handle (or focus it and use Space + arrow keys) to reorder.</p>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && confirmDiscard() && setEditing(null)}>
        {editing !== null && (
          <DialogContent side="right" className="max-w-2xl p-6" onInteractOutside={(e) => e.preventDefault()}>
            <DialogTitle>{editingItem ? `Edit ${config.singular}` : `New ${config.singular}`}</DialogTitle>
            <DialogDescription className="mb-6">
              {editingItem ? config.itemTitle(editingItem) : "Fill in the details and save."}
            </DialogDescription>
            <EntityForm<string>
              key={editingItem?.id ?? "new"}
              formId={`${collection}-${editingItem?.id ?? "new"}`}
              fields={config.fields}
              schema={config.schema}
              defaultValues={editingItem ? config.toForm(editingItem) : config.empty()}
              onSave={(values) => saveItem(collection, editingItem?.id ?? null, values)}
              onSaved={() => {
                setEditing(null);
                refresh();
              }}
              submitLabel={editingItem ? "Save changes" : `Create ${config.singular}`}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
