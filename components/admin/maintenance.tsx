"use client";

import { Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { cleanUpFiles, purgeSiteCache } from "@/app/admin/content-actions";
import { Button } from "@/components/ui/button";

export function Maintenance() {
  const [purging, startPurge] = useTransition();
  const [cleaning, startClean] = useTransition();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        disabled={purging}
        onClick={() =>
          startPurge(async () => {
            const res = await purgeSiteCache();
            if (res.ok) toast.success("Public site will re-read all content on the next visit");
            else toast.error(res.error);
          })
        }
      >
        {purging ? <Loader2 className="animate-spin" aria-hidden="true" /> : <RefreshCcw aria-hidden="true" />}
        Refresh public site cache
      </Button>
      <Button
        variant="secondary"
        disabled={cleaning}
        onClick={() =>
          startClean(async () => {
            const res = await cleanUpFiles();
            if (res.ok) toast.success(`Removed ${res.data ?? 0} unused file(s)`);
            else toast.error(res.error);
          })
        }
      >
        {cleaning ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
        Clean up unused uploads
      </Button>
    </div>
  );
}
