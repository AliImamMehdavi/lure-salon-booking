// SMTP email sending (works with Gmail, Outlook, Zoho, or any provider's
// SMTP credentials). If SMTP isn't configured, mail is logged instead of
// sent, so local dev works without failing whatever triggered the email.
import "server-only";
import nodemailer from "nodemailer";
import type { Booking } from "@/lib/db/bookings";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@zenithbeauty.com";

const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

export async function sendEmail(params: { to: string; subject: string; text: string }): Promise<void> {
  if (!isConfigured) {
    console.log("[email:mock] would send to", params.to);
    console.log("[email:mock] subject:", params.subject);
    console.log("[email:mock] body:\n", params.text);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({ from: EMAIL_FROM, to: params.to, subject: params.subject, text: params.text });
}

function buildBookingEmailBody(booking: Booking): string {
  const party = [booking.guestName, ...booking.groupGuests.map((g) => g.name)];
  const lines = [
    `New booking confirmed on the website.`,
    ``,
    `Reference: ${booking.bookingRef}`,
    `Service: ${booking.serviceName} (${booking.durationMinutes} min)`,
    `Time: ${new Date(booking.startTime).toLocaleString()}`,
    `Stylist: ${booking.staffName}`,
    `Party size: ${party.length} (${party.join(", ")})`,
    ``,
    `Contact:`,
    `  Name: ${booking.guestName}`,
    `  Phone: ${booking.guestPhone}`,
    booking.guestEmail ? `  Email: ${booking.guestEmail}` : ``,
    ``,
    `Total: ${booking.currency} ${booking.total}`,
    ``,
    `Please reach out to the guest via email or WhatsApp to confirm details.`,
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

export async function sendBookingNotificationEmail(params: {
  booking: Booking;
  notifyEmail: string;
}): Promise<void> {
  await sendEmail({
    to: params.notifyEmail,
    subject: `New booking: ${params.booking.guestName} — ${params.booking.serviceName}`,
    text: buildBookingEmailBody(params.booking),
  });
}
