import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { getClients, type Client } from "@/lib/crm";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

type Audience = "all" | "lapsed30" | { locationId: number };

function matchesAudience(client: Client, audience: Audience): boolean {
  if (audience === "all") return true;
  if (audience === "lapsed30") {
    const daysSinceVisit = (Date.now() - new Date(client.lastVisit).getTime()) / 86_400_000;
    return daysSinceVisit >= 30;
  }
  return client.locationIds.includes(audience.locationId);
}

export async function POST(req: Request) {
  return withSalon(async (salonId) => {
    const body = (await req.json()) as {
      channel: "email" | "sms";
      audience: Audience;
      subject?: string;
      message: string;
    };

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const clients = (await getClients(salonId)).filter((c) => matchesAudience(c, body.audience));

    let sent = 0;
    let skipped = 0;
    const failures: string[] = [];

    for (const client of clients) {
      try {
        if (body.channel === "email") {
          if (!client.email) {
            skipped += 1;
            continue;
          }
          await sendEmail({
            to: client.email,
            subject: body.subject || "A message from your salon",
            text: body.message,
          });
        } else {
          const result = await sendSMS(client.phone, body.message);
          if (!result.sent) {
            skipped += 1;
            continue;
          }
        }
        sent += 1;
      } catch (err) {
        failures.push(client.name);
        console.error("Marketing send failed for", client.phone, err);
      }
    }

    return NextResponse.json({ audienceSize: clients.length, sent, skipped, failed: failures.length });
  });
}
