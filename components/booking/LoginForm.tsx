"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { Guest } from "@/lib/types";

export function LoginForm({ onSubmit }: { onSubmit: (guest: Guest) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">You&apos;re almost there</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        We&apos;ll text a confirmation and hold your slot under this name.
      </p>
      <form
        className="mt-6 max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name, phone, email: email || undefined });
        }}
      >
        <Field label="Full name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
        <Field
          label="Mobile number"
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
        />
        <Field
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Button type="submit">Continue</Button>
      </form>
    </div>
  );
}
