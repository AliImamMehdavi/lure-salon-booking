"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { postJSON } from "@/lib/fetcher";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ salonName: "", email: "", password: "" });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const { slug } = await postJSON<{ slug: string }>("/api/signup", form);
      router.push(`/admin?welcome=${slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-clay-dim)]">Zenith</p>
      <h1 className="mt-2 font-display text-3xl text-[var(--color-ink)]">Create your salon</h1>
      <p className="mt-2 text-sm text-[var(--color-ink)]/60">
        Free to set up — get your own booking site and back office in a minute.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Salon name"
          required
          value={form.salonName}
          onChange={(e) => setForm((f) => ({ ...f, salonName: e.target.value }))}
          className="w-full"
        />
        <Field
          label="Your email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full"
        />
        <Field
          label="Password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full"
        />
        {error && <p className="text-sm text-[var(--color-danger-dim)]">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating…" : "Create salon"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--color-ink)]/50">
        Already have a salon?{" "}
        <Link href="/admin/login" className="text-[var(--color-clay-dim)] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
