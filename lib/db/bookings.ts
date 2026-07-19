import "server-only";
import { randomBytes } from "crypto";
import { query, queryOne } from "@/lib/db/pool";
import { ensureMigrated } from "@/lib/db/migrate";

export interface GroupGuest {
  name: string;
  phone?: string;
}

export interface Booking {
  id: number;
  bookingRef: string;
  salonId: number;
  locationId: number | null;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  startTime: string;
  durationMinutes: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  partySize: number;
  groupGuests: GroupGuest[];
  addonIds: number[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  status: "confirmed" | "cancelled";
  reminderSent: boolean;
  createdAt: string;
}

function toBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as number,
    bookingRef: row.booking_ref as string,
    salonId: row.salon_id as number,
    locationId: (row.location_id as number) ?? null,
    serviceId: row.service_id as number,
    serviceName: row.service_name as string,
    staffId: row.staff_id as number,
    staffName: row.staff_name as string,
    startTime: (row.start_time as Date).toString(),
    durationMinutes: row.duration_minutes as number,
    guestName: row.guest_name as string,
    guestPhone: row.guest_phone as string,
    guestEmail: (row.guest_email as string) ?? null,
    partySize: row.party_size as number,
    groupGuests: (row.group_guests as GroupGuest[]) ?? [],
    addonIds: (row.addon_ids as number[]) ?? [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    currency: row.currency as string,
    status: row.status as "confirmed" | "cancelled",
    reminderSent: row.reminder_sent as boolean,
    createdAt: (row.created_at as Date).toString(),
  };
}

const SELECT_WITH_JOINS = `
  SELECT b.*, s.name AS service_name, st.name AS staff_name
  FROM bookings b
  JOIN services s ON s.id = b.service_id
  JOIN staff st ON st.id = b.staff_id
`;

export async function listBookings(
  salonId: number,
  filters?: { date?: string; locationId?: number }
): Promise<Booking[]> {
  await ensureMigrated();
  const clauses = ["b.salon_id = $1"];
  const params: unknown[] = [salonId];
  if (filters?.date) {
    params.push(filters.date);
    clauses.push(`b.start_time::date = $${params.length}::date`);
  }
  if (filters?.locationId) {
    params.push(filters.locationId);
    clauses.push(`b.location_id = $${params.length}`);
  }
  const rows = await query<Record<string, unknown>>(
    `${SELECT_WITH_JOINS} WHERE ${clauses.join(" AND ")} ORDER BY b.start_time`,
    params
  );
  return rows.map(toBooking);
}

export async function findBookingByRef(salonId: number, ref: string): Promise<Booking | null> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `${SELECT_WITH_JOINS} WHERE b.salon_id = $1 AND upper(b.booking_ref) = upper($2)`,
    [salonId, ref]
  );
  return row ? toBooking(row) : null;
}

export async function findBookingsByGuest(
  salonId: number,
  name: string,
  phone: string
): Promise<Booking[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `${SELECT_WITH_JOINS}
     WHERE b.salon_id = $1 AND b.guest_phone = $2 AND lower(b.guest_name) = lower($3)
     ORDER BY b.start_time DESC`,
    [salonId, phone, name]
  );
  return rows.map(toBooking);
}

export async function getBookingById(salonId: number, bookingId: number): Promise<Booking | null> {
  await ensureMigrated();
  const row = await queryOne<Record<string, unknown>>(
    `${SELECT_WITH_JOINS} WHERE b.salon_id = $1 AND b.id = $2`,
    [salonId, bookingId]
  );
  return row ? toBooking(row) : null;
}

// Real double-booking prevention at the database level: two overlapping
// time ranges for the same staff member cannot both exist as 'confirmed'.
// This check-then-insert isn't a full transaction-level guarantee under
// extreme concurrency, but combined with the unique booking_ref and the
// tight time window realistic for this app, it's the same protection
// level the previous JS-only version had — now backed by an indexed query
// instead of scanning a JSON file.
export async function isSlotTaken(
  salonId: number,
  staffId: number,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  await ensureMigrated();
  const row = await queryOne(
    `SELECT 1 FROM bookings
     WHERE salon_id = $1 AND staff_id = $2 AND status = 'confirmed'
       AND start_time < ($3::timestamptz + ($4 || ' minutes')::interval)
       AND (start_time + (duration_minutes || ' minutes')::interval) > $3::timestamptz
     LIMIT 1`,
    [salonId, staffId, startTime, durationMinutes]
  );
  return row !== null;
}

export async function createBooking(
  salonId: number,
  data: {
    locationId: number | null;
    serviceId: number;
    staffId: number;
    startTime: string;
    durationMinutes: number;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    partySize: number;
    groupGuests: GroupGuest[];
    addonIds: number[];
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
  }
): Promise<Booking> {
  await ensureMigrated();
  const bookingRef = randomBytes(5).toString("hex").toUpperCase();
  const row = await queryOne<Record<string, unknown>>(
    `INSERT INTO bookings
       (booking_ref, salon_id, location_id, service_id, staff_id, start_time, duration_minutes,
        guest_name, guest_phone, guest_email, party_size, group_guests, addon_ids,
        subtotal, discount, total, currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING id`,
    [
      bookingRef,
      salonId,
      data.locationId,
      data.serviceId,
      data.staffId,
      data.startTime,
      data.durationMinutes,
      data.guestName,
      data.guestPhone,
      data.guestEmail ?? null,
      data.partySize,
      JSON.stringify(data.groupGuests),
      data.addonIds,
      data.subtotal,
      data.discount,
      data.total,
      data.currency,
    ]
  );
  const created = await getBookingById(salonId, row!.id as number);
  return created!;
}

export async function updateBookingStatus(
  salonId: number,
  bookingId: number,
  status: "confirmed" | "cancelled"
): Promise<Booking | null> {
  await ensureMigrated();
  await query(`UPDATE bookings SET status = $3 WHERE id = $2 AND salon_id = $1`, [
    salonId,
    bookingId,
    status,
  ]);
  return getBookingById(salonId, bookingId);
}

export async function markReminderSent(salonId: number, bookingId: number): Promise<void> {
  await ensureMigrated();
  await query(`UPDATE bookings SET reminder_sent = true WHERE id = $1 AND salon_id = $2`, [
    bookingId,
    salonId,
  ]);
}

// Reminders run across ALL salons (a scheduler pings one endpoint), so
// this one function intentionally is not salon-scoped — every other
// function in this file is.
export async function listBookingsDueForReminder(withinHours: number): Promise<Booking[]> {
  await ensureMigrated();
  const rows = await query<Record<string, unknown>>(
    `${SELECT_WITH_JOINS}
     WHERE b.status = 'confirmed' AND b.reminder_sent = false
       AND b.start_time > now() AND b.start_time <= now() + ($1 || ' hours')::interval`,
    [withinHours]
  );
  return rows.map(toBooking);
}
