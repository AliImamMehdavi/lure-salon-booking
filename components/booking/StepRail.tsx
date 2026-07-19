import clsx from "clsx";
import type { Step } from "@/lib/booking-store";

const LABELS: Record<Step, string> = {
  location: "Location",
  service: "Service",
  guests: "Party size",
  groupGuests: "Names",
  addons: "Add-ons",
  provider: "Provider",
  slot: "Time",
  login: "You",
  checkout: "Confirm",
  confirmed: "Booked",
};

export function StepRail({
  current,
  visibleSteps,
  onStepClick,
}: {
  current: Step;
  visibleSteps: Step[];
  onStepClick: (step: Step) => void;
}) {
  const currentIdx = visibleSteps.indexOf(current);

  return (
    <aside className="relative flex md:flex-col gap-0 md:gap-1 md:w-40 shrink-0 overflow-x-auto md:overflow-visible">
      {/* perforation line running the length of the rail */}
      <div className="hidden md:block absolute left-[9px] top-2 bottom-2 w-px perforation" aria-hidden />
      {visibleSteps.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = step === current;
        const clickable = isDone && step !== "confirmed";
        return (
          <button
            key={step}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepClick(step)}
            className={clsx(
              "flex md:flex-row items-center gap-3 py-2 pr-4 md:pr-0 relative text-left",
              clickable && "cursor-pointer group"
            )}
          >
            <span
              className={clsx(
                "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors",
                isCurrent && "border-[var(--color-clay)] bg-[var(--color-clay)] text-[var(--color-bone)]",
                isDone && "border-[var(--color-sage)] bg-[var(--color-sage)] text-[var(--color-bone)]",
                clickable && "group-hover:border-[var(--color-clay)] group-hover:bg-[var(--color-clay)]",
                !isCurrent && !isDone && "border-[var(--color-line)] bg-[var(--color-bone)] text-[var(--color-ink)]/40"
              )}
            >
              {i + 1}
            </span>
            <span
              className={clsx(
                "whitespace-nowrap text-xs tracking-wide font-mono uppercase transition-colors",
                isCurrent ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]/45",
                clickable && "group-hover:text-[var(--color-clay)]"
              )}
            >
              {LABELS[step]}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
