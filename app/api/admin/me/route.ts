import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { getSalonById } from "@/lib/db/salons";

export async function GET() {
  return withSalon(async (salonId) => {
    const salon = await getSalonById(salonId);
    if (!salon) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ salon });
  });
}
