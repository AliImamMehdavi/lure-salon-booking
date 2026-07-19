"use client";

import { Fragment, useMemo, useState } from "react";
import { format } from "date-fns";
import useSWR from "swr";
import clsx from "clsx";
import { fetchJSON } from "@/lib/fetcher";
import { DayPicker } from "@/components/ui/DayPicker";
import { LocationFilter } from "@/components/ui/LocationFilter";
import { useLocations } from "@/lib/hooks";
import type { ConfirmedBooking } from "@/lib/types";

interface StaffMember {
  id: number;
  locationId: number;
  name: string;
  title: string;
  workingHours: { dayOfWeek: number; start: string; end: string }[];
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function AdminSchedulePage() {
  const [date, setDate] = useState(new Date());
  const [locationFilter, setLocationFilter] = useState("");
  const dateStr = format(date, "yyyy-MM-dd");
  const dayOfWeek = date.getDay();

  const { data: staffData, isLoading: staffLoading } = useSWR(
    "/api/admin/staff",
    fetchJSON<{ staff: StaffMember[] }>
  );
  const { data: bookingsData, isLoading: bookingsLoading } = useSWR(
    `/api/admin/bookings?date=${dateStr}`,
    fetchJSON<{ bookings: ConfirmedBooking[] }>
  );
  const { locations } = useLocations();

  const allStaff = staffData?.staff ?? [];
  const staff = locationFilter ? allStaff.filter((s) => String(s.locationId) === locationFilter) : allStaff;
  const bookings = (bookingsData?.bookings ?? []).filter((b) => b.status === "confirmed");
  const loading = staffLoading || bookingsLoading;

  // 9:00 - 18:00 in 30-min increments
  const timeSlots = useMemo(() => Array.from({ length: 18 }, (_, i) => 9 * 60 + i * 30), []);

  function bookingFor(staffId: number, minutes: number) {
    return bookings.find((b) => {
      if (b.staffId !== staffId) return false;
      const start = new Date(b.startTime);
      const startMin = start.getHours() * 60 + start.getMinutes();
      const endMin = startMin + b.durationMinutes;
      return minutes >= startMin && minutes < endMin;
    });
  }

  function isBookingStart(staffId: number, minutes: number) {
    const b = bookingFor(staffId, minutes);
    if (!b) return false;
    const start = new Date(b.startTime);
    return start.getHours() * 60 + start.getMinutes() === minutes;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Schedule</h1>
        <LocationFilter locations={locations} value={locationFilter} onChange={setLocationFilter} />
      </div>

      <div className="mt-5">
        <DayPicker selectedDate={date} onSelect={setDate} />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-[var(--color-ink)]/50">Loading…</p>
      ) : staff.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-ink)]/50">No staff to show for this location.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div
            className="grid min-w-[600px]"
            style={{ gridTemplateColumns: `80px repeat(${staff.length}, 1fr)` }}
          >
            <div />
            {staff.map((s) => (
              <div key={s.id} className="border-b border-[var(--color-line)] p-2 text-center">
                <p className="text-sm text-[var(--color-ink)]">{s.name}</p>
                <p className="text-[10px] text-[var(--color-ink)]/40">{s.title}</p>
              </div>
            ))}

            {timeSlots.map((minutes) => (
              <Fragment key={minutes}>
                <div className="border-b border-[var(--color-line)] p-2 text-right font-mono text-[10px] text-[var(--color-ink)]/40">
                  {String(Math.floor(minutes / 60)).padStart(2, "0")}:
                  {String(minutes % 60).padStart(2, "0")}
                </div>
                {staff.map((s) => {
                  const working = s.workingHours.some(
                    (w) =>
                      w.dayOfWeek === dayOfWeek &&
                      minutes >= timeToMinutes(w.start) &&
                      minutes < timeToMinutes(w.end)
                  );
                  const b = bookingFor(s.id, minutes);
                  const isStart = isBookingStart(s.id, minutes);
                  return (
                    <div
                      key={`${s.id}-${minutes}`}
                      className={clsx(
                        "border-b border-l border-[var(--color-line)] p-1 text-[10px]",
                        !working && "bg-[var(--color-ink)]/5",
                        b && "bg-[var(--color-clay)]/15"
                      )}
                    >
                      {isStart && b && (
                        <div className="rounded-sm bg-[var(--color-clay)] px-1 py-0.5 text-[var(--color-bone)]">
                          {b.guestName} · {b.serviceName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
