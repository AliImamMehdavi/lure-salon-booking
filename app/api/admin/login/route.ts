import { NextResponse } from "next/server";
import { verifySalonLogin } from "@/lib/db/salons";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/tenant-auth";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { salon, error } = await verifySalonLogin(email, password);
  if (error || !salon) {
    return NextResponse.json({ error: error ?? "Incorrect email or password." }, { status: 401 });
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

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
