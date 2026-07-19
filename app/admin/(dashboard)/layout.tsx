"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import clsx from "clsx";
import { fetchJSON } from "@/lib/fetcher";
import type { Salon } from "@/lib/db/salons";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/marketing", label: "Marketing" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useSWR("/api/admin/me", fetchJSON<{ salon: Salon }>);
  const salon = data?.salon;

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--color-bone)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-bone)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              {salon?.name ?? "Zenith"}
            </p>
            <p className="font-display text-lg">Back office</p>
          </div>
          <nav className="flex items-center gap-4 overflow-x-auto sm:gap-5">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "shrink-0 font-mono text-xs uppercase tracking-wide transition-opacity",
                    active ? "text-[var(--color-clay)] opacity-100" : "opacity-70 hover:opacity-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {salon && (
              <Link
                href={`/s/${salon.slug}`}
                target="_blank"
                className="shrink-0 font-mono text-xs uppercase tracking-wide opacity-70 hover:opacity-100"
              >
                View site ↗
              </Link>
            )}
            <button
              onClick={signOut}
              className="shrink-0 font-mono text-xs uppercase tracking-wide opacity-60 hover:opacity-100"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
