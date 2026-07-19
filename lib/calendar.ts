// No external calendar API needed — a Google Calendar link is just a URL,
// and .ics is a plain text format Apple/Outlook/most calendar apps accept
// as a file download. Both work with zero backend involvement.

function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICSText(text: string): string {
  return text.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

export interface CalendarEventInput {
  title: string;
  description: string;
  location?: string;
  start: Date;
  end: Date;
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    dates: `${toICSDate(event.start)}/${toICSDate(event.end)}`,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildICSContent(event: CalendarEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zenith//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@zenithbeauty.com`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(event.start)}`,
    `DTEND:${toICSDate(event.end)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeICSText(event.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(filename: string, event: CalendarEventInput) {
  const blob = new Blob([buildICSContent(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
