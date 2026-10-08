"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { login, type LoginState } from "../auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  const from = useSearchParams().get("from") ?? "";

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="from" value={from} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Sign in
      </Button>
    </form>
  );
}
