import "server-only";
import { query, queryOne } from "@/lib/db/pool";
import { ensureMigrated } from "@/lib/db/migrate";

export interface Location {
  id: number;
  salonId: number;
  name: string;
  address: string;
  phone: string;
}

function toLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as number,
    salonId: row.salon_id as number,
    name: row.name as string,
    address: (row.address as string) ?? "",
    phone: (row.phone as string) ?? "",
  };
}

export async function listLocations(salonId: number): Promise<Location[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM locations WHERE salon_id = $1 ORDER BY id`,
    [salonId]
  );
  return rows.map(toLocation);
}

export async function createLocation(
  salonId: number,
  data: { name: string; address?: string; phone?: string }
): Promise<Location> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO locations (salon_id, name, address, phone) VALUES ($1, $2, $3, $4) RETURNING *`,
    [salonId, data.name, data.address ?? "", data.phone ?? ""]
  );
  return toLocation(row!);
}

export async function updateLocation(
  salonId: number,
  locationId: number,
  data: Partial<{ name: string; address: string; phone: string }>
): Promise<Location | null> {
  await ensureMigrated();
  // Ownership check baked into the WHERE clause — a request for another
  // salon's location ID simply matches zero rows, not an error that could
  // leak whether the ID exists.
  const row = await queryOne<Record<string, unknown>>(
    `UPDATE locations SET
       name = COALESCE($3, name),
       address = COALESCE($4, address),
       phone = COALESCE($5, phone)
     WHERE id = $2 AND salon_id = $1 RETURNING *`,
    [salonId, locationId, data.name, data.address, data.phone]
  );
  return row ? toLocation(row) : null;
}

export async function deleteLocation(
  salonId: number,
  locationId: number
): Promise<{ error?: string }> {
  await ensureMigrated();
  const staffCount = await queryOne<{ count: string }>(
    `SELECT count(*) FROM staff WHERE salon_id = $1 AND location_id = $2`,
    [salonId, locationId]
  );
  if (Number(staffCount?.count ?? 0) > 0) {
    return { error: "Move or remove this location's staff first." };
  }
  await query(`DELETE FROM locations WHERE id = $1 AND salon_id = $2`, [locationId, salonId]);
  return {};
}
