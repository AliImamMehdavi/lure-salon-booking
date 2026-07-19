"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { fetchJSON, postJSON } from "@/lib/fetcher";
import type { Addon, Service } from "@/lib/types";

export default function AdminServicesPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/services", fetchJSON<{ services: Service[] }>);
  const services = data?.services ?? [];
  const toast = useToast();

  const [form, setForm] = useState({
    category: "",
    name: "",
    description: "",
    durationMinutes: "60",
    price: "",
  });
  const [expanded, setExpanded] = useState<number>();

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category.trim() || !form.name.trim() || !form.price) return;
    try {
      await postJSON("/api/admin/services", {
        category: form.category,
        name: form.name,
        description: form.description,
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price),
      });
      setForm({ category: "", name: "", description: "", durationMinutes: "60", price: "" });
      mutate();
      toast(`${form.name} added`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add service", "error");
    }
  }

  async function removeService(id: number) {
    await fetchJSON(`/api/admin/services/${id}`, { method: "DELETE" });
    mutate();
    toast("Service removed");
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Services</h1>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        What guests see and book on your public site. Group related services under the same category
        name (e.g. &ldquo;Hair&rdquo;, &ldquo;Color&rdquo;) to organize the catalog.
      </p>

      <form onSubmit={addService} className="mt-6 grid gap-3 rounded-md border border-[var(--color-line)] bg-white p-5 shadow-sm sm:grid-cols-2">
        <Field label="Category" required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full" />
        <Field label="Service name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full" />
        <Field label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full sm:col-span-2" />
        <Field label="Duration (min)" type="number" required value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} className="w-full" />
        <Field label="Price ($)" type="number" step="0.01" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full" />
        <Button type="submit" className="sm:col-span-2">
          Add service
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>}
        {!isLoading && services.length === 0 && (
          <p className="text-sm text-[var(--color-ink)]/50">
            No services yet — add your first one above. Guests won&apos;t see anything to book until you do.
          </p>
        )}
        {!isLoading &&
          services.map((service) => (
            <div key={service.id} className="rounded-md border border-[var(--color-line)] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink)]/40">
                    {service.category}
                  </p>
                  <p className="font-display text-lg text-[var(--color-ink)]">{service.name}</p>
                  {service.description && (
                    <p className="mt-1 text-sm text-[var(--color-ink)]/60">{service.description}</p>
                  )}
                  <p className="mt-2 font-mono text-xs text-[var(--color-ink)]/50">
                    {service.durationMinutes} min · ${service.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setExpanded(expanded === service.id ? undefined : service.id)}>
                    {expanded === service.id ? "Hide add-ons" : "Add-ons"}
                  </Button>
                  <Button variant="ghost" onClick={() => removeService(service.id)}>
                    Remove
                  </Button>
                </div>
              </div>
              {expanded === service.id && <ServiceAddons serviceId={service.id} />}
            </div>
          ))}
      </div>
    </div>
  );
}

function ServiceAddons({ serviceId }: { serviceId: number }) {
  const { data, mutate } = useSWR(
    `/api/admin/services/${serviceId}/addons`,
    fetchJSON<{ addons: Addon[] }>
  );
  const addons = data?.addons ?? [];
  const [form, setForm] = useState({ name: "", price: "0", durationMinutes: "0", mandatory: false });
  const toast = useToast();

  async function addAddon(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await postJSON(`/api/admin/services/${serviceId}/addons`, {
      name: form.name,
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      mandatory: form.mandatory,
    });
    setForm({ name: "", price: "0", durationMinutes: "0", mandatory: false });
    mutate();
    toast("Add-on added");
  }

  return (
    <div className="mt-4 border-t border-dashed border-[var(--color-line)] pt-4">
      <div className="space-y-2">
        {addons.map((a) => (
          <div key={a.id} className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-ink)]">
              {a.name} {a.mandatory && <span className="text-[var(--color-ink)]/40">(required)</span>}
            </span>
            <span className="font-mono text-[var(--color-clay-dim)]">
              {a.price === 0 ? "included" : `+$${a.price}`}
            </span>
          </div>
        ))}
        {addons.length === 0 && <p className="text-xs text-[var(--color-ink)]/40">No add-ons yet.</p>}
      </div>
      <form onSubmit={addAddon} className="mt-3 flex flex-wrap items-end gap-2">
        <Field
          label="Add-on name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Field
          label="Price ($)"
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
        <label className="flex items-center gap-1.5 pb-2 text-xs text-[var(--color-ink)]/60">
          <input
            type="checkbox"
            checked={form.mandatory}
            onChange={(e) => setForm((f) => ({ ...f, mandatory: e.target.checked }))}
          />
          Required
        </label>
        <Button type="submit" variant="ghost">
          Add
        </Button>
      </form>
    </div>
  );
}
