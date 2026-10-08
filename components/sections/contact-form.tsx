"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { trackEvent } from "@/lib/client/analytics";
import { CONTACT_PREFILL_EVENT, takePendingPrefill } from "@/lib/client/stores";
import { contactSchema, type ContactInput } from "@/lib/validators";

const initial: ContactState = { status: "idle", message: "" };

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-danger" role="alert">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const honeypot = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", subject: "", message: "" },
  });

  // "Discuss this" on a project card prefills the subject.
  useEffect(() => {
    const onPrefill = () => {
      const subject = takePendingPrefill();
      if (!subject) return;
      setValue("subject", subject, { shouldDirty: true });
      setTimeout(() => setFocus("message"), 400);
    };
    onPrefill(); // a prefill may have happened before this form loaded
    window.addEventListener(CONTACT_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(CONTACT_PREFILL_EVENT, onPrefill);
  }, [setValue, setFocus]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      trackEvent("contact_submit");
      reset();
    } else if (state.status === "error") {
      toast.error(state.message);
      for (const [key, message] of Object.entries(state.fieldErrors ?? {})) {
        setError(key as keyof ContactInput, { message });
      }
    }
  }, [state, reset, setError]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const website = honeypot.current?.value ?? "";
    return handleSubmit((values) => {
      startTransition(() => action({ ...values, website }));
    })(e);
  };

  const field = (name: keyof ContactInput) => ({
    id: `contact-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    ...register(name),
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input ref={honeypot} id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input autoComplete="name" placeholder="Jane Doe" {...field("name")} />
          <FieldError id="contact-name-error" message={errors.name?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input type="email" autoComplete="email" placeholder="jane@company.com" {...field("email")} />
          <FieldError id="contact-email-error" message={errors.email?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-company">
            Company <span className="font-normal text-subtle-foreground">(optional)</span>
          </Label>
          <Input autoComplete="organization" placeholder="Acme Inc." {...field("company")} />
          <FieldError id="contact-company-error" message={errors.company?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input placeholder="Frontend role / project" {...field("subject")} />
          <FieldError id="contact-subject-error" message={errors.subject?.message} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea rows={5} placeholder="Tell me about the role, team or project…" {...field("message")} />
        <FieldError id="contact-message-error" message={errors.message?.message} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {pending ? "Sending…" : "Send message"}
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {state.status === "success" && (
            <span className="inline-flex items-center gap-1.5 text-emerald">
              <CheckCircle2 className="size-4" aria-hidden="true" /> {state.message}
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
