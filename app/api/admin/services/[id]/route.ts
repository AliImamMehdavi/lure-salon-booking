import { NextResponse } from "next/server";
import { withSalon } from "@/lib/with-salon";
import { deleteService } from "@/lib/db/services";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSalon(async (salonId) => {
    const { id } = await params;
    await deleteService(salonId, Number(id));
    return NextResponse.json({ ok: true });
  });
}
