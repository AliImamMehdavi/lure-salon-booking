import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import type { Provider, ProviderPreference } from "@/lib/types";

const PREFS: { id: ProviderPreference; label: string }[] = [
  { id: "any", label: "Any available" },
  { id: "any_female", label: "Any female stylist" },
  { id: "any_male", label: "Any male stylist" },
];

export function ProviderPicker({
  providers,
  onChoose,
}: {
  providers: Provider[];
  onChoose: (pref: ProviderPreference, staffId?: number) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Choose a stylist</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Pick a preference, or request someone by name.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PREFS.map((p) => (
          <button
            key={p.id}
            onClick={() => onChoose(p.id)}
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-mono uppercase tracking-wide text-[var(--color-ink)] hover:border-[var(--color-clay)] hover:text-[var(--color-clay-dim)]"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onChoose("specific", provider.id)}
            className={clsx(
              "card-lift flex flex-col items-center gap-2 rounded-md border border-[var(--color-line)] bg-white p-4 text-center"
            )}
          >
            <Avatar name={provider.name} size={56} />
            <p className="text-sm text-[var(--color-ink)]">{provider.name}</p>
            {provider.title && (
              <p className="text-xs text-[var(--color-ink)]/50">{provider.title}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
