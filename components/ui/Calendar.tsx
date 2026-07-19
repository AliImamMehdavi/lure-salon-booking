"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import clsx from "clsx";
import { ChevronLeftIcon } from "@/components/ui/icons";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function Calendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate));
  const today = startOfDay(new Date());

  const gridStart = startOfWeek(startOfMonth(viewMonth));
  const gridEnd = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-md border border-[var(--color-line)] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--color-bone-dim)] hover:text-[var(--color-ink)]"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <p className="font-display text-base text-[var(--color-ink)]">{format(viewMonth, "MMMM yyyy")}</p>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--color-bone-dim)] hover:text-[var(--color-ink)]"
        >
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="py-1 text-center font-mono text-[10px] uppercase text-[var(--color-ink)]/40">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const isPast = isBefore(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayCell = isToday(day);
          const disabled = isPast;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={clsx(
                "relative flex h-9 items-center justify-center rounded-full text-sm font-mono transition-all",
                !inMonth && "text-[var(--color-ink)]/20",
                inMonth && !disabled && !isSelected && "text-[var(--color-ink)] hover:bg-[var(--color-clay)]/15",
                disabled && "cursor-not-allowed text-[var(--color-ink)]/20",
                isSelected && "gold-gradient scale-105 font-semibold text-[var(--color-ink)] shadow-sm",
                isTodayCell && !isSelected && "font-semibold text-[var(--color-clay-dim)]"
              )}
            >
              {format(day, "d")}
              {isTodayCell && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--color-clay)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
