import { NextResponse } from "next/server";
import { createSalon } from "@/lib/db/salons";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/tenant-auth";

export async function POST(req: Request) {
  const { salonName, email, password } = (await req.json()) as {
    salonName?: string;
    email?: string;
    password?: string;
  };

  if (!salonName?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Salon name, email, and an 8+ character password are all required." },
      { status: 400 }
    );
  }

  const { salon, error } = await createSalon({
    name: salonName.trim(),
    adminEmail: email.trim(),
    password,
  });
  if (error || !salon) {
    return NextResponse.json({ error: error ?? "Could not create your account." }, { status: 400 });
  }

  const res = NextResponse.json({ slug: salon.slug });
  res.cookies.set(SESSION_COOKIE_NAME, createSessionToken(salon.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
