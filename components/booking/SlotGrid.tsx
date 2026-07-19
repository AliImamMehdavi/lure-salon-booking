"use client";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/Calendar";
import { ClockIcon } from "@/components/ui/icons";
import type { Provider, TimeSlot } from "@/lib/types";

function groupByPeriod(slots: TimeSlot[]) {
  const morning: TimeSlot[] = [];
  const afternoon: TimeSlot[] = [];
  const evening: TimeSlot[] = [];
  for (const s of slots) {
    const hour = new Date(s.startTime).getHours();
    if (hour < 12) morning.push(s);
    else if (hour < 17) afternoon.push(s);
    else evening.push(s);
  }
  return [
    { label: "Morning", slots: morning },
    { label: "Afternoon", slots: afternoon },
    { label: "Evening", slots: evening },
  ].filter((g) => g.slots.length > 0);
}

export function SlotGrid({
  slots,
  providers,
  loading,
  error,
  selectedDate,
  onDateChange,
  onSelectSlot,
}: {
  slots: TimeSlot[];
  providers: Provider[];
  loading: boolean;
  error?: string;
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  onSelectSlot: (slot: TimeSlot) => void;
}) {
  const providerName = (id: number) => providers.find((p) => p.id === id)?.name;
  // Only worth labeling each slot with a stylist name when slots from more
  // than one provider are mixed together (i.e. guest picked "any available").
  const multipleProviders = new Set(slots.map((s) => s.staffId)).size > 1;
  const groups = groupByPeriod(slots);

  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Pick a time</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        A slot is held for you for 5 minutes once selected.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-[280px_1fr]">
        <Calendar selectedDate={selectedDate} onSelect={onDateChange} />

        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50">
            {format(selectedDate, "EEEE, MMMM d")}
          </p>

          <div className="mt-3 space-y-5">
            {loading && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-[var(--color-bone-dim)]" />
                ))}
              </div>
            )}
            {!loading && error && (
              <p className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger-dim)]">
                {error}
              </p>
            )}
            {!loading && !error && slots.length === 0 && (
              <p className="rounded-md border border-dashed border-[var(--color-line)] px-4 py-6 text-center text-sm text-[var(--color-ink)]/50">
                No openings this day — try another date.
              </p>
            )}
            {!loading &&
              !error &&
              groups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink)]/40">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {group.slots.map((slot) => (
                      <button
                        key={`${slot.staffId}-${slot.startTime}`}
                        onClick={() => onSelectSlot(slot)}
                        className="slot-enter card-lift flex flex-col items-center gap-0.5 rounded-md border border-[var(--color-line)] bg-white py-2.5 font-mono text-sm text-[var(--color-ink)] hover:border-[var(--color-clay)] hover:text-[var(--color-clay-dim)]"
                      >
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3 opacity-50" />
                          {format(new Date(slot.startTime), "h:mm a")}
                        </span>
                        {multipleProviders && providerName(slot.staffId) && (
                          <span className="text-[9px] font-sans normal-case tracking-normal text-[var(--color-ink)]/45">
                            {providerName(slot.staffId)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
