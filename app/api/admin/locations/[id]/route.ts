import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { deleteLocation, updateLocation } from "@/lib/db/locations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateLocation(salonId, Number(id), body);
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated);
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    const result = await deleteLocation(salonId, Number(id));
    if (result.error) return NextResponse.json({ error: result.error }, { status: 409 });
    return NextResponse.json({ ok: true });
  });
}
