import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { CodeforcesData } from "./types";

const HANDLE_RE = /^[A-Za-z0-9_.-]{3,24}$/;

interface CfUser {
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}
interface CfSubmission {
  verdict?: string;
  problem?: { contestId?: number; index?: string; name?: string };
}

export interface CodeforcesResult {
  data: CodeforcesData;
  live: boolean;
}

/** Live stats from the public Codeforces API, cached for 12h. Falls back to admin-entered values. */
export async function getCodeforcesStats(handle: string, fallback: CodeforcesData): Promise<CodeforcesResult> {
  "use cache";
  cacheTag("codeforces");
  if (!HANDLE_RE.test(handle)) {
    cacheLife("days");
    return { data: fallback, live: false };
  }
  try {
    const base = "https://codeforces.com/api";
    const [infoRes, statusRes] = await Promise.all([
      fetch(`${base}/user.info?handles=${encodeURIComponent(handle)}`, { signal: AbortSignal.timeout(6000) }),
      fetch(`${base}/user.status?handle=${encodeURIComponent(handle)}`, { signal: AbortSignal.timeout(8000) }),
    ]);
    const info = (await infoRes.json()) as { status: string; result?: CfUser[] };
    if (info.status !== "OK" || !info.result?.[0]) throw new Error("user.info failed");
    const user = info.result[0];

    let solved = fallback.solved;
    const status = (await statusRes.json().catch(() => null)) as { status: string; result?: CfSubmission[] } | null;
    if (status?.status === "OK" && status.result) {
      const unique = new Set<string>();
      for (const s of status.result) {
        if (s.verdict === "OK" && s.problem)
          unique.add(`${s.problem.contestId ?? ""}-${s.problem.index ?? s.problem.name ?? ""}`);
      }
      solved = unique.size;
    }

    cacheLife("halfDay");
    return {
      data: {
        rating: user.rating ?? fallback.rating,
        maxRating: user.maxRating ?? fallback.maxRating,
        rank: user.rank ?? fallback.rank,
        maxRank: user.maxRank ?? fallback.maxRank,
        solved,
      },
      live: true,
    };
  } catch {
    cacheLife("hours");
    return { data: fallback, live: false };
  }
}
