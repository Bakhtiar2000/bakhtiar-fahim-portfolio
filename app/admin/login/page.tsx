import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-gradient-accent text-white shadow-[0_0_30px_-6px_var(--accent-from)]">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">Manage everything on the portfolio.</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/10">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
