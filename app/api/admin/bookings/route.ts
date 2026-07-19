import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { listBookings } from "@/lib/db/bookings";

export async function GET(req: Request) {
  return withSalon(async (salonId) => {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") ?? undefined;
    const locationId = searchParams.get("locationId");
    const bookings = await listBookings(salonId, {
      date,
      locationId: locationId ? Number(locationId) : undefined,
    });
    return NextResponse.json({ bookings });
  });
}
