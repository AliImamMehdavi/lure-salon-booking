import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { listAddonsForService } from "@/lib/db/services";
import { listStaff } from "@/lib/db/staff";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; serviceId: string }> }
) {
  const { slug, serviceId } = await params;
  const locationId = new URL(req.url).searchParams.get("locationId");

  return withSalonSlug(slug, async (salon) => {
    const [addons, allStaff] = await Promise.all([
      listAddonsForService(salon.id, Number(serviceId)),
      listStaff(salon.id),
    ]);

    const providers = allStaff
      .filter(
        (s) =>
          s.availableOnline &&
          (!locationId || s.locationId === Number(locationId)) &&
          (s.serviceIds.length === 0 || s.serviceIds.includes(Number(serviceId)))
      )
      .map((s) => ({ id: s.id, name: s.name, title: s.title, availableOnline: s.availableOnline }));

    return NextResponse.json({ addons, providers });
  });
}
