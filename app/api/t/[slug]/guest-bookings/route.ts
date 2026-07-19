import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { findBookingByRef, findBookingsByGuest } from "@/lib/db/bookings";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") ?? undefined;
  const name = searchParams.get("name") ?? undefined;
  const reference = searchParams.get("reference") ?? undefined;

  return withSalonSlug(slug, async (salon) => {
    if (reference) {
      const booking = await findBookingByRef(salon.id, reference);
      return NextResponse.json({ bookings: booking ? [booking] : [] });
    }
    if (!phone || !name) {
      return NextResponse.json(
        { error: "Provide phone and name, or a booking reference." },
        { status: 400 }
      );
    }
    const bookings = await findBookingsByGuest(salon.id, name, phone);
    return NextResponse.json({ bookings });
  });
}
