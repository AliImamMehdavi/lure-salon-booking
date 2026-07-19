import { NextResponse } from "next/server";
import { withSalonSlug } from "@/lib/with-salon-slug";
import { listServices } from "@/lib/db/services";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return withSalonSlug(slug, async (salon) => {
    const services = await listServices(salon.id);
    return NextResponse.json({ salon: { id: salon.id, slug: salon.slug, name: salon.name }, services });
  });
}
