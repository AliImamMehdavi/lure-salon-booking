"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { format } from "date-fns";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { fetchJSON, patchJSON } from "@/lib/fetcher";
import type { ConfirmedBooking } from "@/lib/types";

type Lookup = { mode: "details"; name: string; phone: string } | { mode: "reference"; reference: string };

export default function MyBookingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [mode, setMode] = useState<"details" | "reference">("details");
  const [form, setForm] = useState({ name: "", phone: "", reference: "" });
  const [lookup, setLookup] = useState<Lookup>();
  const [cancelingId, setCancelingId] = useState<number>();
  const toast = useToast();

  const lookupUrl = (() => {
    if (!lookup) return null;
    if (lookup.mode === "reference") {
      return `/api/t/${slug}/guest-bookings?reference=${encodeURIComponent(lookup.reference)}`;
    }
    return `/api/t/${slug}/guest-bookings?name=${encodeURIComponent(lookup.name)}&phone=${encodeURIComponent(lookup.phone)}`;
  })();

  const { data, isLoading, mutate } = useSWR(lookupUrl, fetchJSON<{ bookings: ConfirmedBooking[] }>);
  const bookings = data?.bookings ?? [];
  const [now] = useState(() => Date.now());

  async function cancel(bookingId: number) {
    if (!lookup) return;
    setCancelingId(bookingId);
    try {
      const body = lookup.mode === "reference" ? { reference: lookup.reference } : lookup;
      await patchJSON(`/api/t/${slug}/guest-bookings/${bookingId}`, body);
      mutate();
      toast("Booking cancelled");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't cancel that booking", "error");
    } finally {
      setCancelingId(undefined);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/s/${slug}`}
        className="font-mono text-xs uppercase tracking-widest text-[var(--color-clay-dim)] hover:text-[var(--color-clay)]"
      >
        Back to booking
      </Link>
      <h1 className="mt-2 font-display text-3xl text-[var(--color-ink)]">My bookings</h1>
      <p className="mt-2 text-sm text-[var(--color-ink)]/60">
        Look up your booking to view, cancel, or rebook.
      </p>

      <div className="mt-6 flex gap-2">
        {(["details", "reference"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={clsx(
              "rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-wide transition-colors",
              mode === m
                ? "border-[var(--color-clay)] bg-[var(--color-clay)] text-[var(--color-ink)]"
                : "border-[var(--color-line)] text-[var(--color-ink)]/60 hover:border-[var(--color-clay)]"
            )}
          >
            {m === "details" ? "Name + phone" : "Booking reference"}
          </button>
        ))}
      </div>

      {mode === "details" ? (
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setLookup({ mode: "details", name: form.name.trim(), phone: form.phone.trim() });
          }}
        >
          <Field
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Field
            label="Phone"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Button type="submit">Find bookings</Button>
        </form>
      ) : (
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setLookup({ mode: "reference", reference: form.reference.trim() });
          }}
        >
          <Field
            label="Booking reference"
            required
            placeholder="e.g. A1B2C3D4"
            value={form.reference}
            onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
          />
          <Button type="submit">Find booking</Button>
        </form>
      )}

      {lookup && (
        <div className="mt-8 space-y-3">
          {isLoading && <p className="text-sm text-[var(--color-ink)]/50">Looking up…</p>}
          {!isLoading && bookings.length === 0 && (
            <p className="text-sm text-[var(--color-ink)]/50">No bookings found for that search.</p>
          )}
          {bookings.map((b) => {
            const isPast = new Date(b.startTime).getTime() < now;
            return (
              <div key={b.id} className="rounded-md border border-[var(--color-line)] bg-white p-5 ticket-notch">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-[var(--color-ink)]">{b.serviceName}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-ink)]/50">
                      {format(new Date(b.startTime), "EEE, MMM d · h:mm a")} · with {b.staffName}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-ink)]/40">#{b.bookingRef}</p>
                    <div className="mt-1">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/s/${slug}/booking?serviceId=${b.serviceId}`}>
                      <Button variant="ghost">Book again</Button>
                    </Link>
                    {b.status === "confirmed" && !isPast && (
                      <Button
                        variant="ghost"
                        onClick={() => cancel(b.id)}
                        disabled={cancelingId === b.id}
                      >
                        {cancelingId === b.id ? "Canceling…" : "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
