"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function FormSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-16 rounded-lg bg-surface-2" />
        <div className="h-16 rounded-lg bg-surface-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-16 rounded-lg bg-surface-2" />
        <div className="h-16 rounded-lg bg-surface-2" />
      </div>
      <div className="h-36 rounded-lg bg-surface-2" />
      <div className="h-12 w-40 rounded-lg bg-surface-2" />
    </div>
  );
}

const ContactForm = dynamic(() => import("./contact-form").then((m) => m.ContactForm), {
  ssr: false,
  loading: FormSkeleton,
});

/**
 * The form (react-hook-form + Zod) loads only as it approaches the viewport,
 * keeping that code off the critical path for the first screen.
 */
export function LazyContactForm() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{show ? <ContactForm /> : <FormSkeleton />}</div>;
}
