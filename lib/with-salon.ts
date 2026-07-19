import "server-only";
import { NextResponse } from "next/server";
import { requireSalonId, UnauthorizedError } from "@/lib/tenant-auth";

export async function withSalon<T>(
  handler: (salonId: number) => Promise<T>
): Promise<T | NextResponse> {
  try {
    const salonId = await requireSalonId();
    return await handler(salonId);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
