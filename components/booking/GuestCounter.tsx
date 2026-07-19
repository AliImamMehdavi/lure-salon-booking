import clsx from "clsx";

export function GuestCounter({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Who&apos;s coming in?</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Booking for more than one guest reserves the same time slot for everyone.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={clsx(
              "h-12 w-12 rounded-full border font-mono text-sm transition-colors",
              value === n
                ? "border-[var(--color-clay)] bg-[var(--color-clay)] text-[var(--color-bone)]"
                : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-clay)]"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
