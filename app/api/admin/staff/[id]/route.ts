import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { deleteStaff, updateStaff } from "@/lib/db/staff";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateStaff(salonId, Number(id), body);
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
    await deleteStaff(salonId, Number(id));
    return NextResponse.json({ ok: true });
  });
}
