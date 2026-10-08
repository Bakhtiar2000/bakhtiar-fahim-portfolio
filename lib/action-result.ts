/** Shape every admin server action returns. Safe to import from client code. */
export type ActionResult<T = undefined> =
  { ok: true; data?: T; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };
