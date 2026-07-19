// Sends SMS via Textbelt (https://textbelt.com) — a free tier with no
// signup: pass key=textbelt for 1 free text per day per IP. Fine for
// low-volume confirmations/reminders; set TEXTBELT_KEY to a paid key for
// real volume, or swap this file for Twilio/etc. later.
//
// Like lib/email.ts, this never throws in a way that breaks the booking
// flow — if sending fails or isn't configured, it logs instead.
import "server-only";
import type { Booking } from "@/lib/db/bookings";

const TEXTBELT_KEY = process.env.TEXTBELT_KEY ?? "textbelt";
const TEXTBELT_URL = "https://textbelt.com/text";

export interface SmsResult {
  sent: boolean;
  reason?: string;
}

export async function sendSMS(phone: string, message: string): Promise<SmsResult> {
  if (!phone) return { sent: false, reason: "no phone number on file" };

  try {
    const res = await fetch(TEXTBELT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, key: TEXTBELT_KEY }),
    });
    const data = await res.json();
    if (!data.success) {
      console.log("[sms:not-sent]", phone, "-", data.error ?? "unknown reason", "-- message was:", message);
      return { sent: false, reason: data.error ?? "send failed" };
    }
    return { sent: true };
  } catch (err) {
    console.log("[sms:mock]", phone, "-", message);
    return { sent: false, reason: err instanceof Error ? err.message : "network error" };
  }
}

export function buildConfirmationSms(booking: Booking): string {
  const when = new Date(booking.startTime).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `You're booked for ${booking.serviceName} on ${when} with ${booking.staffName}. Reference: ${booking.bookingRef}`;
}

export function buildReminderSms(booking: Booking): string {
  const when = new Date(booking.startTime).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return `Reminder: your ${booking.serviceName} appointment with ${booking.staffName} is coming up ${when}. See you soon!`;
}
