"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { LocationFilter } from "@/components/ui/LocationFilter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { fetchJSON, patchJSON } from "@/lib/fetcher";
import { useLocations } from "@/lib/hooks";
import type { ConfirmedBooking } from "@/lib/types";

export default function AdminBookingsPage() {
  const { data, isLoading, mutate } = useSWR(
    "/api/admin/bookings",
    fetchJSON<{ bookings: ConfirmedBooking[] }>
  );
  const { locations } = useLocations();
  const locationName = (id: number | null) => locations.find((l) => l.id === id)?.name ?? "—";
  const toast = useToast();

  const [locationFilter, setLocationFilter] = useState("");
  const allBookings = data?.bookings ?? [];
  const bookings = locationFilter
    ? allBookings.filter((b) => String(b.locationId) === locationFilter)
    : allBookings;

  async function cancel(bookingId: number) {
    await patchJSON(`/api/admin/bookings/${bookingId}`, { status: "cancelled" });
    mutate();
    toast("Booking cancelled");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Bookings</h1>
        <LocationFilter locations={locations} value={locationFilter} onChange={setLocationFilter} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-[var(--color-line)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50">
              <th className="p-3">Guest</th>
              <th className="p-3">Service</th>
              <th className="p-3">Stylist</th>
              {locations.length > 1 && <th className="p-3">Location</th>}
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="p-4 text-[var(--color-ink)]/50" colSpan={locations.length > 1 ? 7 : 6}>
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && bookings.length === 0 && (
              <tr>
                <td className="p-4 text-[var(--color-ink)]/50" colSpan={locations.length > 1 ? 7 : 6}>
                  No bookings yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-[var(--color-line)] last:border-0 transition-colors hover:bg-[var(--color-bone-dim)]">
                <td className="p-3">
                  {b.guestName}
                  {b.groupGuests.length > 0 && (
                    <span className="text-[var(--color-ink)]/50"> +{b.groupGuests.length}</span>
                  )}
                  <div className="text-xs text-[var(--color-ink)]/50">{b.guestPhone}</div>
                </td>
                <td className="p-3">{b.serviceName}</td>
                <td className="p-3">{b.staffName}</td>
                {locations.length > 1 && <td className="p-3 text-xs">{locationName(b.locationId)}</td>}
                <td className="p-3 font-mono text-xs">{format(new Date(b.startTime), "MMM d, h:mm a")}</td>
                <td className="p-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="p-3">
                  {b.status === "confirmed" && (
                    <Button variant="ghost" onClick={() => cancel(b.id)}>
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
