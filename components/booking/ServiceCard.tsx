import type { Service } from "@/lib/types";

export function ServiceCard({
  service,
  onSelect,
}: {
  service: Service;
  onSelect: (service: Service) => void;
}) {
  return (
    <button
      onClick={() => onSelect(service)}
      className="card-lift group w-full text-left rounded-md border border-[var(--color-line)] bg-white p-5 hover:border-[var(--color-clay)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-clay)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg leading-snug text-[var(--color-ink)]">
            {service.name}
          </h3>
          {service.description && (
            <p className="mt-1 text-sm text-[var(--color-ink)]/60">{service.description}</p>
          )}
          <p className="mt-3 font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/40">
            {service.durationMinutes} min
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-base text-[var(--color-clay-dim)]">
            ${service.price}
          </p>
          <span className="mt-2 inline-block text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/40 group-hover:text-[var(--color-clay)]">
            Book →
          </span>
        </div>
      </div>
    </button>
  );
}
