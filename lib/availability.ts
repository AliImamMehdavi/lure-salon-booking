import "server-only";
import type { StaffMember } from "@/lib/db/staff";
import { isSlotTaken } from "@/lib/db/bookings";

const SLOT_INTERVAL_MINUTES = 30;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToISO(date: string, minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${date}T${h}:${m}:00`;
}

export interface AvailableSlot {
  startTime: string;
  staffId: number;
}

/**
 * Real availability computed from the admin back-office's own data:
 * - only staff marked "bookable online"
 * - only staff who can perform this service (empty serviceIds = any service)
 * - only within that staff member's working hours for this day of week
 * - not on a day they've been marked off
 * - not overlapping a booking they already have (checked against the
 *   database, so this reflects bookings from concurrent guests too)
 */
export async function computeAvailableSlots(params: {
  staff: StaffMember[];
  salonId: number;
  date: string; // "yyyy-MM-dd"
  serviceId?: number;
  staffId?: number;
}): Promise<AvailableSlot[]> {
  const { staff, salonId, date, serviceId, staffId } = params;
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const eligibleStaff = staff.filter((s) => {
    if (!s.availableOnline) return false;
    if (staffId && s.id !== staffId) return false;
    if (serviceId && s.serviceIds.length > 0 && !s.serviceIds.includes(serviceId)) return false;
    if (s.daysOff.includes(date)) return false;
    return s.workingHours.some((w) => w.dayOfWeek === dayOfWeek);
  });

  const slots: AvailableSlot[] = [];
  for (const member of eligibleStaff) {
    const hoursForDay = member.workingHours.filter((w) => w.dayOfWeek === dayOfWeek);
    for (const window of hoursForDay) {
      const start = timeToMinutes(window.start);
      const end = timeToMinutes(window.end);
      for (let m = start; m + SLOT_INTERVAL_MINUTES <= end; m += SLOT_INTERVAL_MINUTES) {
        const startTime = minutesToISO(date, m);
        const taken = await isSlotTaken(salonId, member.id, startTime, SLOT_INTERVAL_MINUTES);
        if (!taken) slots.push({ startTime, staffId: member.id });
      }
    }
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
