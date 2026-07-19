import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { createStaff, listStaff } from "@/lib/db/staff";

export async function GET() {
  return withSalon(async (salonId) => {
    const staff = await listStaff(salonId);
    return NextResponse.json({ staff });
  });
}

export async function POST(req: Request) {
  return withSalon(async (salonId) => {
    const body = await req.json();
    const member = await createStaff(salonId, body);
    return NextResponse.json(member);
  });
}
