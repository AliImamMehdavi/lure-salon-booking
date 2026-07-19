import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  CalendarIcon,
  MapPinIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/icons";

const FEATURES = [
  { icon: CalendarIcon, title: "Real booking flow", desc: "Month calendar, group bookings, add-ons — guests book in under a minute." },
  { icon: UsersIcon, title: "Staff & schedule", desc: "Working hours, days off, and availability computed automatically." },
  { icon: MapPinIcon, title: "Multi-location", desc: "One salon or ten — guests see a location picker only when you need it." },
];

export default function PlatformLandingPage() {
  return (
    <main>
      <div className="relative overflow-hidden bg-[var(--color-ink)] px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #f5c842, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #00d2d3, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-xl flex-col items-center">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[var(--color-clay)]">
            <SparklesIcon className="h-3.5 w-3.5" />
            Zenith
          </div>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-bone)] sm:text-5xl">
            Booking &amp; back office for salons
          </h1>
          <p className="mt-4 max-w-md text-[var(--color-bone)]/70">
            A branded booking site and full admin back office for your salon — staff scheduling,
            multi-location support, a client directory, and marketing, all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button>Create your salon</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost-inverse">Sign in</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-lift rounded-md border border-[var(--color-line)] bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-clay)]/15 text-[var(--color-clay-dim)]">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="mt-3 font-display text-lg text-[var(--color-ink)]">{title}</p>
              <p className="mt-1 text-sm text-[var(--color-ink)]/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
