import { MapPinIcon } from "@/components/ui/icons";
import type { Location } from "@/lib/types";

export function LocationPicker({
  locations,
  salonName,
  onSelect,
}: {
  locations: Location[];
  salonName: string;
  onSelect: (location: Location) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Choose a location</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Which {salonName} location are you visiting?
      </p>
      <div className="mt-6 space-y-3">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelect(loc)}
            className="card-lift flex w-full items-start gap-3 rounded-md border border-[var(--color-line)] bg-white p-5 text-left hover:border-[var(--color-clay)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-clay)]/15 text-[var(--color-clay-dim)]">
              <MapPinIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-display text-lg text-[var(--color-ink)]">{loc.name}</p>
              {loc.address && <p className="mt-1 text-sm text-[var(--color-ink)]/60">{loc.address}</p>}
              {loc.phone && (
                <p className="mt-1 font-mono text-xs text-[var(--color-ink)]/40">{loc.phone}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
