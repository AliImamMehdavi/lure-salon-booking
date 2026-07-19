import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { getBookingById, updateBookingStatus } from "@/lib/db/bookings";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const { phone, name, reference } = (await req.json()) as {
    phone?: string;
    name?: string;
    reference?: string;
  };

  return withSalonSlug(slug, async (salon) => {
    const booking = await getBookingById(salon.id, Number(id));
    if (!booking) return NextResponse.json({ error: "not found" }, { status: 404 });

    const referenceMatches =
      reference && booking.bookingRef.toUpperCase() === reference.trim().toUpperCase();
    const detailsMatch =
      phone === booking.guestPhone && name?.trim().toLowerCase() === booking.guestName.trim().toLowerCase();

    if (!referenceMatches && !detailsMatch) {
      return NextResponse.json({ error: "Details don't match this booking." }, { status: 403 });
    }

    const updated = await updateBookingStatus(salon.id, booking.id, "cancelled");
    return NextResponse.json({ booking: updated });
  });
}
