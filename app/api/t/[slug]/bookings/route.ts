import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { getService, listAddonsByIds } from "@/lib/db/services";
import { listStaff } from "@/lib/db/staff";
import { createBooking, isSlotTaken, type GroupGuest } from "@/lib/db/bookings";
import { sendBookingNotificationEmail } from "@/lib/email";
import { sendSMS, buildConfirmationSms } from "@/lib/sms";
import type { Salon } from "@/lib/db/salons";

interface ConfirmBody {
  locationId?: number;
  serviceId: number;
  staffId: number;
  startTime: string;
  partySize: number;
  groupGuests?: GroupGuest[];
  addonIds: number[];
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  discountCode?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return withSalonSlug(slug, async (salon) => {
    const body = (await req.json()) as ConfirmBody;

    const [service, staff] = await Promise.all([
      getService(salon.id, body.serviceId),
      listStaff(salon.id),
    ]);
    if (!service) {
      return NextResponse.json({ error: "That service is no longer available." }, { status: 400 });
    }
    const provider = staff.find((s) => s.id === body.staffId);
    if (!provider) {
      return NextResponse.json(
        { error: "That stylist is no longer available. Please pick another." },
        { status: 400 }
      );
    }

    const addons = await listAddonsByIds(salon.id, body.addonIds ?? []);
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const partySize = Math.max(1, body.partySize || 1);
    const subtotal = (service.price + addonsTotal) * partySize;
    const discount = body.discountCode ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const total = subtotal - discount;

    const taken = await isSlotTaken(salon.id, provider.id, body.startTime, service.durationMinutes);
    if (taken) {
      return NextResponse.json(
        { error: "That time was just booked by someone else. Please pick another slot." },
        { status: 409 }
      );
    }

    const booking = await createBooking(salon.id, {
      locationId: body.locationId ?? null,
      serviceId: service.id,
      staffId: provider.id,
      startTime: body.startTime,
      durationMinutes: service.durationMinutes,
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      guestEmail: body.guestEmail,
      partySize,
      groupGuests: body.groupGuests ?? [],
      addonIds: body.addonIds ?? [],
      subtotal,
      discount,
      total,
      currency: service.currency,
    });

    await notifyBookingCreated(salon, booking);

    return NextResponse.json({ booking });
  });
}

async function notifyBookingCreated(
  salon: Salon,
  booking: Awaited<ReturnType<typeof createBooking>>
) {
  try {
    await sendBookingNotificationEmail({
      booking,
      notifyEmail: salon.notifyEmail ?? salon.adminEmail,
    });
  } catch (err) {
    console.error("Failed to send booking notification email:", err);
  }
  try {
    await sendSMS(booking.guestPhone, buildConfirmationSms(booking));
  } catch (err) {
    console.error("Failed to send booking confirmation SMS:", err);
  }
}
