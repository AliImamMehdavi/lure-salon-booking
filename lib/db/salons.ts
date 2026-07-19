import "server-only";
import { query, queryOne } from "@/lib/db/pool";
import { ensureMigrated } from "@/lib/db/migrate";
import { hashPassword, verifyPassword } from "@/lib/tenant-auth";

export interface Salon {
  id: number;
  slug: string;
  name: string;
  adminEmail: string;
  notifyEmail: string | null;
  createdAt: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "salon";
  let candidate = root;
  let n = 1;
  while (await queryOne(`SELECT 1 FROM salons WHERE slug = $1`, [candidate])) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

function toSalon(row: Record<string, unknown>): Salon {
  return {
    id: row.id as number,
    slug: row.slug as string,
    name: row.name as string,
    adminEmail: row.admin_email as string,
    notifyEmail: (row.notify_email as string) ?? null,
    createdAt: (row.created_at as Date).toString(),
  };
}

export async function createSalon(params: {
  name: string;
  adminEmail: string;
  password: string;
}): Promise<{ salon?: Salon; error?: string }> {
  await ensureMigrated();

  const existing = await queryOne(`SELECT 1 FROM salons WHERE admin_email = $1`, [
    params.adminEmail.toLowerCase(),
  ]);
  if (existing) return { error: "An account with that email already exists." };

  const slug = await uniqueSlug(params.name);
  const passwordHash = await hashPassword(params.password);

  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO salons (slug, name, admin_email, admin_password_hash)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [slug, params.name, params.adminEmail.toLowerCase(), passwordHash]
  );
  const salon = toSalon(row!);

  // Seed one default location so staff can be added immediately.
  await query(`INSERT INTO locations (salon_id, name) VALUES ($1, 'Main Location')`, [salon.id]);

  return { salon };
}

export async function verifySalonLogin(
  email: string,
  password: string
): Promise<{ salon?: Salon; error?: string }> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(`SELECT * FROM salons WHERE admin_email = $1`, [
    email.toLowerCase(),
  ]);
  if (!row) return { error: "Incorrect email or password." };
  const valid = await verifyPassword(password, row.admin_password_hash as string);
  if (!valid) return { error: "Incorrect email or password." };
  return { salon: toSalon(row) };
}

export async function getSalonById(salonId: number): Promise<Salon | null> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(`SELECT * FROM salons WHERE id = $1`, [salonId]);
  return row ? toSalon(row) : null;
}

export async function getSalonBySlug(slug: string): Promise<Salon | null> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(`SELECT * FROM salons WHERE slug = $1`, [slug]);
  return row ? toSalon(row) : null;
}
