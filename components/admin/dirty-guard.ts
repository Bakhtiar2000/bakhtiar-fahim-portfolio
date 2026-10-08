"use client";

import { useEffect } from "react";

/** Tracks forms with unsaved changes so navigation can warn before discarding them. */
const dirtyForms = new Set<string>();

export function hasUnsavedChanges() {
  return dirtyForms.size > 0;
}

export function confirmDiscard(): boolean {
  if (!hasUnsavedChanges()) return true;
  const ok = window.confirm("You have unsaved changes. Leave without saving?");
  if (ok) dirtyForms.clear();
  return ok;
}

/** Registers a form's dirty state and warns on tab close / reload. */
export function useDirtyGuard(id: string, dirty: boolean) {
  useEffect(() => {
    if (dirty) dirtyForms.add(id);
    else dirtyForms.delete(id);
    return () => {
      dirtyForms.delete(id);
    };
  }, [id, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
