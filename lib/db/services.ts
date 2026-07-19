import "server-only";
import { query, queryOne } from "@/lib/db/pool";
import { ensureMigrated } from "@/lib/db/migrate";

export interface Service {
  id: number;
  salonId: number;
  category: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
}

export interface Addon {
  id: number;
  salonId: number;
  serviceId: number;
  name: string;
  price: number;
  durationMinutes: number;
  mandatory: boolean;
}

function toService(row: Record<string, unknown>): Service {
  return {
    id: row.id as number,
    salonId: row.salon_id as number,
    category: row.category as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    durationMinutes: row.duration_minutes as number,
    price: Number(row.price),
    currency: row.currency as string,
  };
}

function toAddon(row: Record<string, unknown>): Addon {
  return {
    id: row.id as number,
    salonId: row.salon_id as number,
    serviceId: row.service_id as number,
    name: row.name as string,
    price: Number(row.price),
    durationMinutes: row.duration_minutes as number,
    mandatory: row.mandatory as boolean,
  };
}

export async function listServices(salonId: number): Promise<Service[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM services WHERE salon_id = $1 ORDER BY category, id`,
    [salonId]
  );
  return rows.map(toService);
}

export async function getService(salonId: number, serviceId: number): Promise<Service | null> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM services WHERE id = $1 AND salon_id = $2`,
    [serviceId, salonId]
  );
  return row ? toService(row) : null;
}

export async function createService(
  salonId: number,
  data: {
    category: string;
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    currency?: string;
  }
): Promise<Service> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO services (salon_id, category, name, description, duration_minutes, price, currency)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      salonId,
      data.category,
      data.name,
      data.description ?? "",
      data.durationMinutes,
      data.price,
      data.currency ?? "USD",
    ]
  );
  return toService(row!);
}

export async function deleteService(salonId: number, serviceId: number): Promise<void> {
  await ensureMigrated();
  await query(`DELETE FROM services WHERE id = $1 AND salon_id = $2`, [serviceId, salonId]);
}

export async function listAddonsForService(salonId: number, serviceId: number): Promise<Addon[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM addons WHERE salon_id = $1 AND service_id = $2 ORDER BY id`,
    [salonId, serviceId]
  );
  return rows.map(toAddon);
}

export async function listAddonsByIds(salonId: number, addonIds: number[]): Promise<Addon[]> {
  if (addonIds.length === 0) return [];
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM addons WHERE salon_id = $1 AND id = ANY($2::int[])`,
    [salonId, addonIds]
  );
  return rows.map(toAddon);
}

export async function createAddon(
  salonId: number,
  data: {
    serviceId: number;
    name: string;
    price?: number;
    durationMinutes?: number;
    mandatory?: boolean;
  }
): Promise<Addon> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO addons (salon_id, service_id, name, price, duration_minutes, mandatory)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      salonId,
      data.serviceId,
      data.name,
      data.price ?? 0,
      data.durationMinutes ?? 0,
      data.mandatory ?? false,
    ]
  );
  return toAddon(row!);
}
