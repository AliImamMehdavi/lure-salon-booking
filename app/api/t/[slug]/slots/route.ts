import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { listStaff } from "@/lib/db/staff";
import { computeAvailableSlots } from "@/lib/availability";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  return withSalonSlug(slug, async (salon) => {
    const staff = await listStaff(salon.id);
    const slots = await computeAvailableSlots({
      staff,
      salonId: salon.id,
      date,
      serviceId: serviceId ? Number(serviceId) : undefined,
      staffId: staffId ? Number(staffId) : undefined,
    });
    return NextResponse.json({ slots });
  });
}
