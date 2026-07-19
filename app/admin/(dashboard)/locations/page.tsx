"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { fetchJSON, patchJSON, postJSON } from "@/lib/fetcher";
import { useToast } from "@/components/ui/Toast";
import type { Location } from "@/lib/types";

export default function AdminLocationsPage() {
  const { data, isLoading, mutate } = useSWR(
    "/api/admin/locations",
    fetchJSON<{ locations: Location[] }>
  );
  const locations = data?.locations ?? [];
  const toast = useToast();

  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [error, setError] = useState<string>();

  async function addLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await postJSON("/api/admin/locations", form);
    const name = form.name;
    setForm({ name: "", address: "", phone: "" });
    mutate();
    toast(`${name} added`);
  }

  async function updateLocation(id: number, updates: Partial<Location>) {
    await patchJSON(`/api/admin/locations/${id}`, updates);
    mutate();
  }

  async function removeLocation(id: number) {
    setError(undefined);
    try {
      await fetchJSON(`/api/admin/locations/${id}`, { method: "DELETE" });
      mutate();
      toast("Location removed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't remove that location.";
      setError(message);
      toast(message, "error");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Locations</h1>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Add more than one to show guests a location picker at the start of booking.
      </p>

      <form onSubmit={addLocation} className="mt-6 flex flex-wrap items-end gap-3">
        <Field label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Field
          label="Address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
        <Field label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Button type="submit">Add location</Button>
      </form>

      {error && <p className="mt-4 text-sm text-[var(--color-danger-dim)]">{error}</p>}

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>}
        {!isLoading &&
          locations.map((loc) => (
            <div key={loc.id} className="rounded-md border border-[var(--color-line)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    defaultValue={loc.name}
                    onBlur={(e) => e.target.value !== loc.name && updateLocation(loc.id, { name: e.target.value })}
                    className="w-full max-w-xs font-display text-lg text-[var(--color-ink)] bg-transparent focus:outline-none focus:border-b focus:border-[var(--color-clay)]"
                  />
                  <input
                    defaultValue={loc.address}
                    placeholder="Address"
                    onBlur={(e) => e.target.value !== loc.address && updateLocation(loc.id, { address: e.target.value })}
                    className="mt-1 block w-full max-w-xs text-sm text-[var(--color-ink)]/60 bg-transparent focus:outline-none focus:border-b focus:border-[var(--color-clay)]"
                  />
                </div>
                <Button variant="ghost" onClick={() => removeLocation(loc.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
