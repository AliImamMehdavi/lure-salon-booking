import Link from "next/link";
import { format, isToday } from "date-fns";
import { requireSalonId } from "@/lib/tenant-auth";
import { listBookings } from "@/lib/db/bookings";
import { listStaff } from "@/lib/db/staff";
import { Avatar } from "@/components/ui/Avatar";
import { CalendarIcon, CheckCircleIcon, UsersIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const salonId = await requireSalonId();
  const allBookings = await listBookings(salonId);
  const bookings = allBookings.filter((b) => b.status === "confirmed");
  const staff = await listStaff(salonId);
  const todays = bookings.filter((b) => isToday(new Date(b.startTime)));
  const upcoming = bookings
    .filter((b) => new Date(b.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 8);

  const kpis = [
    { label: "Today's bookings", value: todays.length, icon: CalendarIcon },
    { label: "Total confirmed", value: bookings.length, icon: CheckCircleIcon },
    { label: "Staff bookable online", value: staff.filter((s) => s.availableOnline).length, icon: UsersIcon },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-lift rounded-md border border-[var(--color-line)] bg-white p-5 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-clay)]/15 text-[var(--color-clay-dim)]">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 font-mono text-3xl text-[var(--color-ink)]">{value}</p>
            <p className="mt-1 text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50">
            Upcoming appointments
          </h2>
          <Link
            href="/admin/bookings"
            className="font-mono text-xs uppercase tracking-wide text-[var(--color-clay-dim)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[var(--color-line)] rounded-md border border-[var(--color-line)] bg-white shadow-sm">
          {upcoming.length === 0 && (
            <p className="p-4 text-sm text-[var(--color-ink)]/50">No upcoming appointments.</p>
          )}
          {upcoming.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={b.staffName} size={32} />
                <div>
                  <p className="text-sm text-[var(--color-ink)]">
                    {b.guestName}
                    {b.groupGuests.length > 0 && ` +${b.groupGuests.length}`}
                  </p>
                  <p className="text-xs text-[var(--color-ink)]/50">
                    {b.serviceName} with {b.staffName}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-mono text-xs text-[var(--color-ink)]/50">
                {format(new Date(b.startTime), "MMM d, h:mm a")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
