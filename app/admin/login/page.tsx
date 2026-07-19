"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { postJSON } from "@/lib/fetcher";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await postJSON("/api/admin/login", { email, password });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-clay-dim)]">Zenith</p>
      <h1 className="mt-2 font-display text-3xl text-[var(--color-ink)]">Salon sign in</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Field
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        {error && <p className="text-sm text-[var(--color-danger-dim)]">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--color-ink)]/50">
        New salon?{" "}
        <Link href="/signup" className="text-[var(--color-clay-dim)] hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
