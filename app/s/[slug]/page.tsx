import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalonBySlug } from "@/lib/db/salons";
import { listServices } from "@/lib/db/services";
import { DropIcon, LeafIcon, ScissorsIcon, SparklesIcon, StarIcon } from "@/components/ui/icons";

const CATEGORY_ICONS = [ScissorsIcon, DropIcon, LeafIcon, StarIcon];

// Server-rendered: the catalog never shows a blank loading state.
export default async function SalonHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const services = await listServices(salon.id);
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <main className="mx-auto max-w-4xl px-6 pb-16">
      <div className="relative -mx-6 mb-12 overflow-hidden bg-[var(--color-ink)] px-6 py-16 text-center sm:rounded-b-2xl sm:text-left">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #f5c842, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #00d2d3, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center sm:mx-0 sm:items-start">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-clay)]">
            <SparklesIcon className="h-3.5 w-3.5" />
            {salon.name}
          </div>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-bone)] sm:text-5xl">
            Book your appointment
          </h1>
          <p className="mt-3 max-w-md text-[var(--color-bone)]/70">
            Choose a service to get started — pick your stylist and time next.
          </p>
          <Link
            href={`/s/${slug}/my-bookings`}
            className="mt-6 font-mono text-xs uppercase tracking-wide text-[var(--color-bone)]/70 underline decoration-[var(--color-clay)] underline-offset-4 hover:text-[var(--color-clay)]"
          >
            Already booked? Manage your visit →
          </Link>
        </div>
      </div>

      {services.length === 0 && (
        <p className="text-sm text-[var(--color-ink)]/50">No services published yet — check back soon.</p>
      )}

      {categories.map((category, i) => {
        const catServices = services.filter((s) => s.category === category);
        const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
        return (
          <section key={category} className="mb-10">
            <h2 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50">
              <Icon className="h-4 w-4 text-[var(--color-clay-dim)]" />
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {catServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/s/${slug}/booking?serviceId=${s.id}`}
                  className="card-lift group rounded-md border border-[var(--color-line)] bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg text-[var(--color-ink)]">{s.name}</h3>
                      {s.description && (
                        <p className="mt-1 text-sm text-[var(--color-ink)]/60">{s.description}</p>
                      )}
                      <p className="mt-3 font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/40">
                        {s.durationMinutes} min
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-base text-[var(--color-clay-dim)]">${s.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
