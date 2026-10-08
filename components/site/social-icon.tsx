import { Globe, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandIcon } from "./brand-icon";

export function SocialIcon({ platform, iconId, className }: { platform: string; iconId: string | null; className?: string }) {
  if (iconId) return <BrandIcon id={iconId} className={className} />;
  const Icon = platform === "email" ? Mail : platform === "phone" ? Phone : Globe;
  return <Icon aria-hidden="true" className={cn("size-4", className)} />;
}
