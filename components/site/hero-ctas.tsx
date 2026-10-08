"use client";

import { ArrowDown, ArrowUpRight, MessageSquare } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/client/analytics";
import { scrollToId } from "@/lib/client/scroll";

export function HeroCtas({ workId, contactId }: { workId: string | null; contactId: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Magnetic>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("resume_click", { from: "hero" })}
          >
            View Resume <ArrowUpRight aria-hidden="true" />
          </a>
        </Button>
      </Magnetic>
      {contactId && (
        <Magnetic>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              trackEvent("contact_click", { from: "hero" });
              scrollToId(contactId);
            }}
          >
            <MessageSquare aria-hidden="true" /> Let&apos;s Talk
          </Button>
        </Magnetic>
      )}
      {workId && (
        <Button variant="ghost" size="lg" onClick={() => scrollToId(workId)}>
          See My Work <ArrowDown aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
