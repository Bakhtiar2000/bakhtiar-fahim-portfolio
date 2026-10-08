/** Abstract, original dashboard illustration with generic data. Not the real product. */
const BARS = [42, 58, 50, 66, 61, 74, 70, 83, 78, 88, 84, 92];

export function DashboardMockup() {
  return (
    <figure className="relative">
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl shadow-black/20"
      >
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="ml-3 h-2 w-32 rounded-full bg-surface-2" />
        </div>
        <div className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[9rem_1fr]">
          <div className="flex flex-col gap-3 border-r border-border p-3 sm:p-4">
            {["w-full", "w-4/5", "w-3/4", "w-5/6", "w-2/3", "w-3/4"].map((w, i) => (
              <span key={i} className={`h-2 rounded-full ${i === 1 ? "bg-gradient-accent" : "bg-surface-2"} ${w}`} />
            ))}
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                ["Active employees", "1,248"],
                ["Payroll run", "98.6%"],
                ["Pending approvals", "23"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-background/50 p-2 sm:p-3">
                  <p className="truncate text-[9px] text-subtle-foreground sm:text-[11px]">{label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold sm:text-lg">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="h-2 w-20 rounded-full bg-surface-2" />
                <span className="h-2 w-10 rounded-full bg-surface-2" />
              </div>
              <div className="flex h-20 items-end gap-1 sm:h-28 sm:gap-1.5">
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-accent-from/60 to-accent-to/80"
                    style={{ height: `${h}%`, opacity: 0.45 + (i / BARS.length) * 0.55 }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((r) => (
                <div key={r} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                  <span className="size-5 rounded-full bg-surface-2" />
                  <span className="h-2 flex-1 rounded-full bg-surface-2" />
                  <span className="h-2 w-10 rounded-full bg-emerald/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center font-mono text-[11px] text-subtle-foreground">
        Illustrative mockup with generic data — not the real product.
      </figcaption>
    </figure>
  );
}
