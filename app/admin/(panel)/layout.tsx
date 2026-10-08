import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

// Admin pages read the session and uncached data on every request.
export const instant = false;

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-lg bg-surface-2" />
      <div className="h-4 w-80 max-w-full rounded bg-surface-2" />
      <div className="h-64 rounded-2xl bg-surface-2" />
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </AdminShell>
  );
}
