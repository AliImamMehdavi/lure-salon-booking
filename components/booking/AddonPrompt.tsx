import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import type { Addon } from "@/lib/types";

export function AddonPrompt({
  addons,
  selected,
  onToggle,
  onContinue,
}: {
  addons: Addon[];
  selected: number[];
  onToggle: (id: number) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Anything to add?</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Suggested for this service. Required add-ons are already included.
      </p>
      <div className="mt-6 space-y-2">
        {addons.map((addon) => {
          const isOn = addon.mandatory || selected.includes(addon.id);
          return (
            <button
              key={addon.id}
              disabled={addon.mandatory}
              onClick={() => onToggle(addon.id)}
              className={clsx(
                "card-lift flex w-full items-center justify-between rounded-md border bg-white px-4 py-3 text-left",
                isOn
                  ? "border-[var(--color-sage)] bg-[var(--color-sage)]/10"
                  : "border-[var(--color-line)] hover:border-[var(--color-clay)]",
                addon.mandatory && "cursor-default opacity-80"
              )}
            >
              <span>
                <span className="block text-sm text-[var(--color-ink)]">{addon.name}</span>
                <span className="block text-xs text-[var(--color-ink)]/50 font-mono">
                  +{addon.durationMinutes} min
                  {addon.mandatory ? " · required" : ""}
                </span>
              </span>
              <span className="font-mono text-sm text-[var(--color-clay-dim)]">
                {addon.price === 0 ? "included" : `+$${addon.price}`}
              </span>
            </button>
          );
        })}
        {addons.length === 0 && (
          <p className="text-sm text-[var(--color-ink)]/50">No add-ons for this service.</p>
        )}
      </div>
      <Button className="mt-6" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
