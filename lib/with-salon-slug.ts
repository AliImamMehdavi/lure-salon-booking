import "server-only";
import { NextResponse } from "next/server";
import { getSalonBySlug, type Salon } from "@/lib/db/salons";

export async function withSalonSlug<T>(
  slug: string,
  handler: (salon: Salon) => Promise<T>
): Promise<T | NextResponse> {
  const salon = await getSalonBySlug(slug);
  if (!salon) return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  return handler(salon);
}
