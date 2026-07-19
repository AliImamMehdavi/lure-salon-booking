// Browser-safe client for the guest-facing, tenant-scoped API routes
// under /api/t/[slug]/*. Every method takes the salon's slug so the same
// client works for any tenant.
import { fetchJSON, postJSON } from "@/lib/fetcher";
import type {
  Addon,
  BookingDraft,
  ConfirmedBooking,
  Location,
  Provider,
  Service,
  TimeSlot,
} from "./types";

export function tenantClient(slug: string) {
  return {
    getCatalog: () =>
      fetchJSON<{ salon: { id: number; slug: string; name: string }; services: Service[] }>(
        `/api/t/${slug}/catalog`
      ),

    getLocations: () => fetchJSON<{ locations: Location[] }>(`/api/t/${slug}/locations`),

    getServiceDetails: (serviceId: number, locationId?: number) => {
      const qs = locationId ? `?locationId=${locationId}` : "";
      return fetchJSON<{ addons: Addon[]; providers: Provider[] }>(
        `/api/t/${slug}/services/${serviceId}${qs}`
      );
    },

    async getSlots(params: {
      date: string;
      staffId?: number;
      serviceId?: number;
    }): Promise<TimeSlot[]> {
      const qs = new URLSearchParams({ date: params.date });
      if (params.staffId) qs.set("staffId", String(params.staffId));
      if (params.serviceId) qs.set("serviceId", String(params.serviceId));
      const { slots } = await fetchJSON<{ slots: TimeSlot[] }>(`/api/t/${slug}/slots?${qs}`);
      return slots;
    },

    confirmBooking: (draft: BookingDraft) =>
      postJSON<{ booking: ConfirmedBooking }>(`/api/t/${slug}/bookings`, {
        locationId: draft.locationId,
        serviceId: draft.serviceId,
        staffId: draft.staffId,
        startTime: draft.slot?.startTime,
        partySize: draft.guestCount,
        groupGuests: draft.groupGuests,
        addonIds: draft.addonIds,
        guestName: draft.guest?.name,
        guestPhone: draft.guest?.phone,
        guestEmail: draft.guest?.email,
        discountCode: draft.discountCode,
      }),
  };
}
