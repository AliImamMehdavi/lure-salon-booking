"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { fetchJSON } from "@/lib/fetcher";
import type { Client } from "@/lib/crm";

export default function AdminClientsPage() {
  const { data, isLoading } = useSWR("/api/admin/clients", fetchJSON<{ clients: Client[] }>);
  const [search, setSearch] = useState("");

  const clients = (data?.clients ?? []).filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Clients</h1>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Built automatically from booking history — no separate setup needed.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone"
        className="mt-6 w-full max-w-sm rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none sm:w-auto"
      />

      <div className="mt-6 overflow-x-auto rounded-md border border-[var(--color-line)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50">
              <th className="p-3">Client</th>
              <th className="p-3">Visits</th>
              <th className="p-3">Total spent</th>
              <th className="p-3">Last visit</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="p-4 text-[var(--color-ink)]/50" colSpan={4}>
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && clients.length === 0 && (
              <tr>
                <td className="p-4 text-[var(--color-ink)]/50" colSpan={4}>
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.phone} className="border-b border-[var(--color-line)] last:border-0 transition-colors hover:bg-[var(--color-bone-dim)]">
                <td className="p-3">
                  {c.name}
                  <div className="text-xs text-[var(--color-ink)]/50">{c.phone}</div>
                </td>
                <td className="p-3 font-mono">{c.visitCount}</td>
                <td className="p-3 font-mono text-[var(--color-clay-dim)]">
                  {c.currency} {c.totalSpent}
                </td>
                <td className="p-3 font-mono text-xs">{format(new Date(c.lastVisit), "MMM d, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
