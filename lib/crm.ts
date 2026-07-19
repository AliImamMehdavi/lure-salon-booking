import "server-only";
import { query } from "@/lib/db/pool";
import { ensureMigrated } from "@/lib/db/migrate";

export interface Client {
  name: string;
  phone: string;
  email: string | null;
  visitCount: number;
  totalSpent: number;
  currency: string;
  lastVisit: string;
  locationIds: number[];
}

// A client directory derived entirely from booking history via a single
// aggregate query — no separate "customers" table to keep in sync.
export async function getClients(salonId: number): Promise<Client[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `SELECT
       guest_name AS name,
       guest_phone AS phone,
       (array_agg(guest_email ORDER BY created_at DESC) FILTER (WHERE guest_email IS NOT NULL))[1] AS email,
       count(*)::int AS visit_count,
       coalesce(sum(total) FILTER (WHERE status = 'confirmed'), 0) AS total_spent,
       max(currency) AS currency,
       max(created_at) AS last_visit,
       array_agg(DISTINCT location_id) FILTER (WHERE location_id IS NOT NULL) AS location_ids
     FROM bookings
     WHERE salon_id = $1
     GROUP BY guest_phone, guest_name
     ORDER BY max(created_at) DESC`,
    [salonId]
  );
  return rows.map((row) => ({
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    visitCount: row.visit_count as number,
    totalSpent: Number(row.total_spent),
    currency: (row.currency as string) ?? "USD",
    lastVisit: (row.last_visit as Date).toString(),
    locationIds: (row.location_ids as number[]) ?? [],
  }));
}
