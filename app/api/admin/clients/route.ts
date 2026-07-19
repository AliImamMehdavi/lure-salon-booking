import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { getClients } from "@/lib/crm";

export async function GET() {
  return withSalon(async (salonId) => {
    const clients = await getClients(salonId);
    return NextResponse.json({ clients });
  });
}
