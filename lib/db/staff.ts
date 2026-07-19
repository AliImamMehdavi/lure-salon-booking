import "server-only";
import { query, queryOne } from "@/lib/db/pool";
import { ensureMigrated } from "@/lib/db/migrate";

export interface WorkingHours {
  dayOfWeek: number;
  start: string;
  end: string;
}

export interface StaffMember {
  id: number;
  salonId: number;
  locationId: number;
  name: string;
  title: string;
  availableOnline: boolean;
  serviceIds: number[];
  workingHours: WorkingHours[];
  daysOff: string[];
}

function toStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: row.id as number,
    salonId: row.salon_id as number,
    locationId: row.location_id as number,
    name: row.name as string,
    title: (row.title as string) ?? "",
    availableOnline: row.available_online as boolean,
    serviceIds: (row.service_ids as number[]) ?? [],
    workingHours: (row.working_hours as WorkingHours[]) ?? [],
    daysOff: (row.days_off as string[]) ?? [],
  };
}

export async function listStaff(salonId: number): Promise<StaffMember[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM staff WHERE salon_id = $1 ORDER BY id`,
    [salonId]
  );
  return rows.map(toStaff);
}

export async function createStaff(
  salonId: number,
  data: {
    locationId: number;
    name: string;
    title?: string;
    availableOnline?: boolean;
    serviceIds?: number[];
    workingHours?: WorkingHours[];
    daysOff?: string[];
  }
): Promise<StaffMember> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO staff (salon_id, location_id, name, title, available_online, service_ids, working_hours, days_off)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      salonId,
      data.locationId,
      data.name,
      data.title ?? "",
      data.availableOnline ?? true,
      data.serviceIds ?? [],
      JSON.stringify(data.workingHours ?? []),
      JSON.stringify(data.daysOff ?? []),
    ]
  );
  return toStaff(row!);
}

export async function updateStaff(
  salonId: number,
  staffId: number,
  data: Partial<{
    locationId: number;
    name: string;
    title: string;
    availableOnline: boolean;
    serviceIds: number[];
    workingHours: WorkingHours[];
    daysOff: string[];
  }>
): Promise<StaffMember | null> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `UPDATE staff SET
       location_id = COALESCE($3, location_id),
       name = COALESCE($4, name),
       title = COALESCE($5, title),
       available_online = COALESCE($6, available_online),
       service_ids = COALESCE($7, service_ids),
       working_hours = COALESCE($8, working_hours),
       days_off = COALESCE($9, days_off)
     WHERE id = $2 AND salon_id = $1 RETURNING *`,
    [
      salonId,
      staffId,
      data.locationId,
      data.name,
      data.title,
      data.availableOnline,
      data.serviceIds,
      data.workingHours ? JSON.stringify(data.workingHours) : undefined,
      data.daysOff ? JSON.stringify(data.daysOff) : undefined,
    ]
  );
  return row ? toStaff(row) : null;
}

export async function deleteStaff(salonId: number, staffId: number): Promise<void> {
  await ensureMigrated();
  await query(`DELETE FROM staff WHERE id = $1 AND salon_id = $2`, [staffId, salonId]);
}
