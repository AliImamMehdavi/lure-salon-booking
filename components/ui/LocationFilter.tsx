import type { Location } from "@/lib/types";

export function LocationFilter({
  locations,
  value,
  onChange,
}: {
  locations: Location[];
  value: string;
  onChange: (locationId: string) => void;
}) {
  if (locations.length <= 1) return null;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none"
    >
      <option value="">All locations</option>
      {locations.map((l) => (
        <option key={l.id} value={l.id}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
