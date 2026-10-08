"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          toast.success("Email copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error(`Couldn't copy — it's ${email}`);
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span className="truncate font-mono text-xs">{email}</span>
    </Button>
  );
}
