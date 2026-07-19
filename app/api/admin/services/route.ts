import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { createService, listServices } from "@/lib/db/services";

export async function GET() {
  return withSalon(async (salonId) => {
    const services = await listServices(salonId);
    return NextResponse.json({ services });
  });
}

export async function POST(req: Request) {
  return withSalon(async (salonId) => {
    const body = await req.json();
    const service = await createService(salonId, body);
    return NextResponse.json({ service });
  });
}
