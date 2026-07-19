// The core guarantee for "no data leakage between tenants" lives here.
//
// Every admin API route calls requireSalonId() to get a salonId — and
// that salonId comes from a cookie that's signed with SESSION_SECRET, not
// from anything the client can set directly (a query param, a form field,
// a header). If someone tampers with the cookie, the signature check
// fails and the request is rejected. Every subsequent database call in
// that request then filters explicitly by that verified salonId.
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "zenith_salon_session";
export const SESSION_COOKIE_NAME = SESSION_COOKIE;
const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionToken(salonId: number): string {
  const payload = String(salonId);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  // Constant-time comparison — avoids leaking timing information about
  // how much of the signature matched.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const salonId = Number(payload);
  return Number.isInteger(salonId) ? salonId : null;
}

export async function getSalonIdFromSession(): Promise<number | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export class UnauthorizedError extends Error {}

// Every admin API route calls this first. If it doesn't throw, the
// returned salonId is guaranteed to have come from a validly-signed
// session cookie — safe to filter every subsequent query by.
export async function requireSalonId(): Promise<number> {
  const salonId = await getSalonIdFromSession();
  if (salonId === null) throw new UnauthorizedError("Not signed in");
  return salonId;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
