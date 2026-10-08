import { cacheLife, cacheTag } from "next/cache";
import { CONTENT_TAG, getSiteContent } from "@/lib/content";
import { buildSprite, platformIconId } from "@/lib/icons";

/** Fixed icons used by the layout itself (system map, competitive cards). */
const BASE_IDS = [
  "angular",
  "react",
  "nextdotjs",
  "keycloak",
  "dotnet",
  "apachekafka",
  "postgresql",
  "docker",
  "codeforces",
  "codechef",
];

async function sprite(): Promise<string> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  const { skillGroups, socials } = await getSiteContent();
  const ids = [
    ...BASE_IDS,
    ...skillGroups.flatMap((g) => g.skills.map((s) => s.icon.toLowerCase())),
    ...socials.map((s) => platformIconId(s.platform)).filter((id): id is string => id !== null),
  ];
  return buildSprite(ids);
}

export async function GET() {
  return new Response(await sprite(), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
