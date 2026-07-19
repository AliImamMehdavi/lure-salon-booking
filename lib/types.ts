// Client-safe types shared between components and the tenant-scoped API
// client. Mirrors the shapes returned by /api/t/[slug]/* routes.

export interface ServiceCategory {
  id: string;
  name: string;
}

export interface Service {
  id: number;
  category: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
}

export interface Addon {
  id: number;
  serviceId: number;
  name: string;
  price: number;
  durationMinutes: number;
  mandatory: boolean;
}

export type ProviderPreference = "any" | "any_female" | "any_male" | "specific";

export interface Provider {
  id: number;
  name: string;
  title?: string;
  availableOnline: boolean;
}

export interface Location {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface TimeSlot {
  startTime: string;
  staffId: number;
}

export interface Guest {
  name: string;
  phone: string;
  email?: string;
}

export interface GroupGuest {
  name: string;
  phone?: string;
}

export interface BookingDraft {
  locationId?: number;
  serviceId?: number;
  addonIds: number[];
  providerPreference: ProviderPreference;
  staffId?: number;
  slot?: TimeSlot;
  guestCount: number;
  groupGuests?: GroupGuest[];
  guest?: Guest;
  discountCode?: string;
}

export interface ConfirmedBooking {
  id: number;
  bookingRef: string;
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
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  status: "confirmed" | "cancelled";
}

export type BookingStatus = "confirmed" | "cancelled";
