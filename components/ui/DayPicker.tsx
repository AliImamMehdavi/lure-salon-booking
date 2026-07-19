import { useMemo } from "react";
import { addDays, format } from "date-fns";
import clsx from "clsx";

export function DayPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);
  const selectedStr = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((d) => {
        const active = format(d, "yyyy-MM-dd") === selectedStr;
        return (
          <button
            key={d.toISOString()}
            onClick={() => onSelect(d)}
            className={clsx(
              "shrink-0 rounded-sm border px-3 py-2 text-center",
              active
                ? "border-[var(--color-clay)] bg-[var(--color-clay)] text-[var(--color-bone)]"
                : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-clay)]"
            )}
          >
            <div className="text-[10px] font-mono uppercase tracking-wide opacity-70">
              {format(d, "EEE")}
            </div>
            <div className="text-sm font-mono">{format(d, "d")}</div>
          </button>
        );
      })}
    </div>
  );
}
