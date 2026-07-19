import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { createAddon, listAddonsForService } from "@/lib/db/services";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    const addons = await listAddonsForService(salonId, Number(id));
    return NextResponse.json({ addons });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    const body = await req.json();
    const addon = await createAddon(salonId, { ...body, serviceId: Number(id) });
    return NextResponse.json({ addon });
  });
}
