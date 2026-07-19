import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { updateBookingStatus } from "@/lib/db/bookings";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    const { status } = (await req.json()) as { status: "confirmed" | "cancelled" };
    const updated = await updateBookingStatus(salonId, Number(id), status);
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated);
  });
}
