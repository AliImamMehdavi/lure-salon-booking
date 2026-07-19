import { create } from "zustand";
import type {
  BookingDraft,
  ConfirmedBooking,
  Guest,
  Location,
  ProviderPreference,
  Service,
  TimeSlot,
} from "./types";

// The flow is a strict state machine, not ad hoc component state, so
// back/forward navigation never loses progress and every step reads/
// writes the same draft.
export const STEPS = [
  "location",
  "service",
  "guests",
  "groupGuests",
  "addons",
  "provider",
  "slot",
  "login",
  "checkout",
  "confirmed",
] as const;

export type Step = (typeof STEPS)[number];

interface BookingState {
  step: Step;
  draft: BookingDraft;
  selectedService?: Service;
  selectedLocation?: Location;
  confirmed?: ConfirmedBooking;
  multiLocation: boolean;

  setMultiLocation: (value: boolean) => void;
  selectLocation: (location: Location) => void;
  selectService: (service: Service) => void;
  setGuestCount: (count: number) => void;
  setGroupGuestNames: (names: string[]) => void;
  toggleAddon: (addonId: number) => void;
  setMandatoryAddons: (addonIds: number[]) => void;
  confirmAddons: () => void;
  setProviderPreference: (pref: ProviderPreference, staffId?: number) => void;
  selectSlot: (slot: TimeSlot) => void;
  setGuest: (guest: Guest) => void;
  applyDiscountCode: (code: string) => void;
  complete: (confirmed: ConfirmedBooking) => void;
  goTo: (step: Step) => void;
  back: () => void;
  reset: () => void;
}

const initialDraft: BookingDraft = {
  guestCount: 1,
  addonIds: [],
  providerPreference: "any",
};

export const useBookingStore = create<BookingState>((set) => ({
  step: "service",
  draft: initialDraft,
  selectedService: undefined,
  selectedLocation: undefined,
  confirmed: undefined,
  multiLocation: false,

  setMultiLocation: (value) =>
    set((s) => ({
      multiLocation: value,
      step: value && s.step === "service" && !s.draft.locationId ? "location" : s.step,
    })),

  selectLocation: (location) =>
    set((s) => ({
      selectedLocation: location,
      draft: { ...s.draft, locationId: location.id },
      step: "service",
    })),

  selectService: (service) =>
    set((s) => ({
      selectedService: service,
      draft: { ...initialDraft, locationId: s.draft.locationId, serviceId: service.id },
      step: "guests",
    })),

  setGuestCount: (count) =>
    set((s) => ({
      draft: { ...s.draft, guestCount: count },
      step: count > 1 ? "groupGuests" : "addons",
    })),

  setGroupGuestNames: (names) =>
    set((s) => ({
      draft: { ...s.draft, groupGuests: names.map((name) => ({ name, phone: "" })) },
      step: "addons",
    })),

  toggleAddon: (addonId) =>
    set((s) => {
      const has = s.draft.addonIds.includes(addonId);
      return {
        draft: {
          ...s.draft,
          addonIds: has
            ? s.draft.addonIds.filter((id) => id !== addonId)
            : [...s.draft.addonIds, addonId],
        },
      };
    }),

  setMandatoryAddons: (addonIds) =>
    set((s) => {
      const merged = new Set([...s.draft.addonIds, ...addonIds]);
      return { draft: { ...s.draft, addonIds: Array.from(merged) } };
    }),

  confirmAddons: () => set({ step: "provider" }),

  setProviderPreference: (pref, staffId) =>
    set((s) => ({
      draft: { ...s.draft, providerPreference: pref, staffId },
      step: "slot",
    })),

  selectSlot: (slot) =>
    set((s) => ({
      draft: { ...s.draft, slot, staffId: slot.staffId },
      step: s.draft.guest ? "checkout" : "login",
    })),

  setGuest: (guest) => set((s) => ({ draft: { ...s.draft, guest }, step: "checkout" })),

  applyDiscountCode: (code) => set((s) => ({ draft: { ...s.draft, discountCode: code } })),

  complete: (confirmed) => set({ confirmed, step: "confirmed" }),

  goTo: (step) => set({ step }),

  back: () =>
    set((s) => {
      const order = STEPS;
      const idx = order.indexOf(s.step);
      let prevIdx = Math.max(0, idx - 1);
      while (prevIdx > 0) {
        const candidate = order[prevIdx];
        if (candidate === "groupGuests" && s.draft.guestCount <= 1) {
          prevIdx -= 1;
          continue;
        }
        if (candidate === "location" && !s.multiLocation) {
          prevIdx -= 1;
          continue;
        }
        break;
      }
      return { step: order[prevIdx] };
    }),

  reset: () =>
    set((s) => ({
      step: s.multiLocation ? "location" : "service",
      draft: initialDraft,
      selectedService: undefined,
      confirmed: undefined,
    })),
}));
