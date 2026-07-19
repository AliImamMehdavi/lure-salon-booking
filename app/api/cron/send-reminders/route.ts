import { NextResponse } from "next/server";
import { listBookingsDueForReminder, markReminderSent } from "@/lib/db/bookings";
import { sendSMS, buildReminderSms } from "@/lib/sms";

const REMINDER_WINDOW_HOURS = 24;
const CRON_SECRET = process.env.CRON_SECRET;

// Call this from any scheduler (cron-job.org, GitHub Actions cron, etc.)
// roughly once an hour:
//   GET https://yoursite.com/api/cron/send-reminders?secret=YOUR_CRON_SECRET
// Runs across every salon in one pass — no per-tenant scheduling needed.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (CRON_SECRET && searchParams.get("secret") !== CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const due = await listBookingsDueForReminder(REMINDER_WINDOW_HOURS);

  const results = await Promise.all(
    due.map(async (b) => {
      const result = await sendSMS(b.guestPhone, buildReminderSms(b));
      if (result.sent) await markReminderSent(b.salonId, b.id);
      return { bookingRef: b.bookingRef, guest: b.guestName, ...result };
    })
  );

  return NextResponse.json({ remindersSent: results.length, results });
}
