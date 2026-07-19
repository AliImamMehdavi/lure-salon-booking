"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { CalendarIcon } from "@/components/ui/icons";
import { buildGoogleCalendarUrl, downloadICS } from "@/lib/calendar";
import type { ConfirmedBooking } from "@/lib/types";

const CONFETTI_COLORS = ["#f5c842", "#ff6b6b", "#00d2d3", "#10b981", "#1a1a2e"];

export function Confirmation({
  booking,
  salonSlug,
  salonName,
  onBookAgain,
}: {
  booking: ConfirmedBooking;
  salonSlug: string;
  salonName: string;
  onBookAgain: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const start = new Date(booking.startTime);
  const end = new Date(start.getTime() + booking.durationMinutes * 60_000);
  const partyNames = [booking.guestName, ...booking.groupGuests.map((g) => g.name)];

  const calendarEvent = {
    title: `${booking.serviceName} at ${salonName}`,
    description: `${booking.serviceName} with ${booking.staffName}.${
      partyNames.length > 1 ? ` Party: ${partyNames.join(", ")}.` : ""
    } Reference: ${booking.bookingRef}`,
    location: salonName,
    start,
    end,
  };

  return (
    <div className="text-center sm:text-left">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center sm:mx-0">
        <svg viewBox="0 0 40 40" className="scale-in h-16 w-16">
          <circle cx="20" cy="20" r="19" fill="var(--color-sage)" opacity="0.12" />
          <circle cx="20" cy="20" r="15" fill="var(--color-sage)" />
          <path
            d="M13 20.5l4.5 4.5L28 14.5"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-draw"
          />
        </svg>
        {CONFETTI_COLORS.map((color, i) => (
          <span
            key={color}
            className="confetti-piece absolute h-1.5 w-1.5 rounded-sm"
            style={{ backgroundColor: color, left: `${20 + i * 14}%`, top: "20%", animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>

      <p className="mt-3 font-mono text-xs uppercase tracking-wide text-[var(--color-sage)]">Confirmed</p>
      <h2 className="mt-1 font-display text-3xl text-[var(--color-ink)]">You&apos;re booked</h2>
      <div className="mt-6 inline-block rounded-md border border-[var(--color-line)] bg-white p-6 text-left shadow-sm ticket-notch">
        <p className="text-sm text-[var(--color-ink)]">{booking.serviceName}</p>
        <p className="mt-1 font-mono text-xs text-[var(--color-ink)]/50">
          {format(start, "EEEE, MMMM d · h:mm a")}
        </p>
        <p className="mt-1 text-xs text-[var(--color-ink)]/50">with {booking.staffName}</p>
        {partyNames.length > 1 && (
          <p className="mt-1 text-xs text-[var(--color-ink)]/50">
            Party of {partyNames.length}: {partyNames.join(", ")}
          </p>
        )}
        <div className="mt-4 border-t border-dashed border-[var(--color-line)] pt-4 font-mono text-xs text-[var(--color-ink)]/50">
          Booking #{booking.bookingRef}
        </div>
      </div>

      <div className="relative mt-6">
        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          <Button variant="ghost" onClick={() => setMenuOpen((v) => !v)}>
            <CalendarIcon className="h-4 w-4" />
            Add to calendar
          </Button>
          <Button variant="ghost" onClick={onBookAgain}>
            Book another
          </Button>
          <Link href={`/s/${salonSlug}/my-bookings`}>
            <Button variant="ghost">Manage bookings</Button>
          </Link>
        </div>
        {menuOpen && (
          <div className="fade-in absolute left-0 top-full z-10 mt-2 w-48 rounded-md border border-[var(--color-line)] bg-white shadow-lg">
            <a
              href={buildGoogleCalendarUrl(calendarEvent)}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-bone-dim)]"
              onClick={() => setMenuOpen(false)}
            >
              Google Calendar
            </a>
            <button
              className="block w-full px-4 py-2 text-left text-sm text-[var(--color-ink)] hover:bg-[var(--color-bone-dim)]"
              onClick={() => {
                downloadICS(`${salonSlug}-${booking.bookingRef}`, calendarEvent);
                setMenuOpen(false);
              }}
            >
              Apple / Outlook (.ics)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
