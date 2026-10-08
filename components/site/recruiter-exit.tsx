"use client";

import { Button } from "@/components/ui/button";
import { setRecruiterMode } from "@/lib/client/stores";

export function RecruiterExit() {
  return (
    <Button variant="ghost" size="lg" onClick={() => setRecruiterMode(false)}>
      See the full portfolio
    </Button>
  );
}
