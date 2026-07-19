import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { createLocation, listLocations } from "@/lib/db/locations";

export async function GET() {
  return withSalon(async (salonId) => {
    const locations = await listLocations(salonId);
    return NextResponse.json({ locations });
  });
}

export async function POST(req: Request) {
  return withSalon(async (salonId) => {
    const body = await req.json();
    const location = await createLocation(salonId, body);
    return NextResponse.json(location);
  });
}
