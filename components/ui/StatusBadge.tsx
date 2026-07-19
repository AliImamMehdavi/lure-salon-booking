import clsx from "clsx";
import { DotIcon } from "@/components/ui/icons";
import type { BookingStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs",
        isConfirmed ? "text-[var(--color-sage)]" : "text-[var(--color-ink)]/40 line-through"
      )}
    >
      <DotIcon className="h-1.5 w-1.5" />
      {status}
    </span>
  );
}
