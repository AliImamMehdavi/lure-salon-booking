import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { listLocations } from "@/lib/db/locations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return withSalonSlug(slug, async (salon) => {
    const locations = await listLocations(salon.id);
    return NextResponse.json({ locations });
  });
}
