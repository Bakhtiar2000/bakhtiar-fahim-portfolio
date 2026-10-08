import type { NavSection } from "./section-dots";

export interface SocialItem {
  platform: string;
  label: string;
  url: string;
  /** Sprite id from /icons.svg resolved on the server; null = generic icon. */
  iconId: string | null;
}

/** Data the client-side chrome (navbar, palette, terminal) needs. */
export interface SiteChrome {
  name: string;
  email: string;
  sections: NavSection[];
  socials: SocialItem[];
  openToWork: boolean;
}
