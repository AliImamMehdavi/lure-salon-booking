"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import useSWR from "swr";
import { useBookingStore, STEPS, type Step } from "@/lib/booking-store";
import { tenantClient } from "@/lib/tenant-client";
import { StepRail } from "@/components/booking/StepRail";
import { LocationPicker } from "@/components/booking/LocationPicker";
import { ServiceCard } from "@/components/booking/ServiceCard";
import { GuestCounter } from "@/components/booking/GuestCounter";
import { GroupGuestNames } from "@/components/booking/GroupGuestNames";
import { AddonPrompt } from "@/components/booking/AddonPrompt";
import { ProviderPicker } from "@/components/booking/ProviderPicker";
import { SlotGrid } from "@/components/booking/SlotGrid";
import { LoginForm } from "@/components/booking/LoginForm";
import { CheckoutSummary } from "@/components/booking/CheckoutSummary";
import { Confirmation } from "@/components/booking/Confirmation";
import { ChevronLeftIcon } from "@/components/ui/icons";
import type { Service, TimeSlot } from "@/lib/types";

export function BookingFlow({ slug, initialServiceId }: { slug: string; initialServiceId?: number }) {
  const client = tenantClient(slug);
  const {
    step,
    draft,
    selectedService,
    confirmed,
    multiLocation,
    setMultiLocation,
    selectLocation,
    selectService,
    setGuestCount,
    setGroupGuestNames,
    toggleAddon,
    setMandatoryAddons,
    confirmAddons,
    setProviderPreference,
    selectSlot,
    setGuest,
    applyDiscountCode,
    complete,
    back,
    goTo,
    reset,
  } = useBookingStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string>();
  const [resolvingDeepLink, setResolvingDeepLink] = useState(() => Boolean(initialServiceId));

  const { data: catalogData } = useSWR(["catalog", slug], () => client.getCatalog());
  const salonName = catalogData?.salon.name ?? "";
  const services = catalogData?.services ?? [];

  const { data: locationsData } = useSWR(["locations", slug], () => client.getLocations());
  const locations = locationsData?.locations ?? [];

  useEffect(() => {
    if (locations.length === 0) return;
    if (locations.length > 1) {
      setMultiLocation(true);
    } else if (!draft.locationId) {
      selectLocation(locations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations.length, draft.locationId]);

  const { data: serviceDetails } = useSWR(
    draft.serviceId ? (["service-details", slug, draft.serviceId, draft.locationId] as const) : null,
    ([, , serviceId, locationId]) => client.getServiceDetails(serviceId, locationId)
  );
  const addons = serviceDetails?.addons ?? [];
  const providers = serviceDetails?.providers ?? [];

  useEffect(() => {
    const mandatoryIds = addons.filter((a) => a.mandatory).map((a) => a.id);
    if (mandatoryIds.length > 0) setMandatoryAddons(mandatoryIds);
  }, [serviceDetails, setMandatoryAddons]); // eslint-disable-line react-hooks/exhaustive-deps

  const slotsKey =
    step === "slot"
      ? (["slots", slug, format(selectedDate, "yyyy-MM-dd"), draft.staffId, draft.serviceId] as const)
      : null;
  const { data: slots = [], isLoading: slotsLoading, error: slotsError } = useSWR(
    slotsKey,
    ([, , date, staffId, serviceId]) => client.getSlots({ date, staffId, serviceId })
  );

  // Auto-select a service if arriving from a catalog deep link — gated so
  // the full catalog never flashes on screen before jumping forward.
  useEffect(() => {
    if (initialServiceId && !selectedService && services.length > 0) {
      const svc = services.find((s) => s.id === initialServiceId);
      if (svc) selectService(svc);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time resolve-on-mount, not a data loop
      setResolvingDeepLink(false);
    } else if (!initialServiceId) {
      setResolvingDeepLink(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServiceId, services.length]);

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(undefined);
    try {
      const { booking } = await client.confirmBooking(draft);
      complete(booking);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  const visibleSteps: Step[] = STEPS.filter((s) => {
    if (s === "groupGuests") return draft.guestCount > 1;
    if (s === "location") return multiLocation;
    return true;
  });

  if (resolvingDeepLink) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-8 w-32 animate-pulse rounded-md bg-[var(--color-bone-dim)]" />
        <div className="mt-8 h-64 animate-pulse rounded-md bg-[var(--color-bone-dim)]" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={`/s/${slug}`}
        className="mb-8 inline-block font-mono text-xs uppercase tracking-widest text-[var(--color-clay-dim)] hover:text-[var(--color-clay)]"
      >
        {salonName || "Back to booking"}
      </Link>
      <div className="flex flex-col gap-8 md:flex-row">
        {step !== "confirmed" && (
          <StepRail current={step} visibleSteps={visibleSteps} onStepClick={goTo} />
        )}

        <div className="min-w-0 flex-1">
          {step !== "service" && step !== "confirmed" && step !== "location" && (
            <button
              onClick={back}
              className="mb-6 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50 hover:text-[var(--color-clay)]"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          {step === "location" && (
            <LocationPicker locations={locations} salonName={salonName} onSelect={selectLocation} />
          )}

          {step === "service" && (
            <div>
              <h2 className="font-display text-2xl text-[var(--color-ink)]">Choose a service</h2>
              <div className="mt-6 space-y-3">
                {services.map((s: Service) => (
                  <ServiceCard key={s.id} service={s} onSelect={selectService} />
                ))}
                {services.length === 0 && (
                  <p className="text-sm text-[var(--color-ink)]/50">
                    No services published yet — check back soon.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "guests" && <GuestCounter value={draft.guestCount} onChange={setGuestCount} />}

          {step === "groupGuests" && (
            <GroupGuestNames
              guestCount={draft.guestCount}
              initialNames={draft.groupGuests?.map((g) => g.name)}
              onSubmit={setGroupGuestNames}
            />
          )}

          {step === "addons" && (
            <AddonPrompt
              addons={addons}
              selected={draft.addonIds}
              onToggle={toggleAddon}
              onContinue={confirmAddons}
            />
          )}

          {step === "provider" && (
            <ProviderPicker providers={providers} onChoose={setProviderPreference} />
          )}

          {step === "slot" && (
            <SlotGrid
              slots={slots}
              providers={providers}
              loading={slotsLoading}
              error={slotsError ? "Couldn't load times right now. Please try again." : undefined}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onSelectSlot={(slot: TimeSlot) => selectSlot(slot)}
            />
          )}

          {step === "login" && <LoginForm onSubmit={setGuest} />}

          {step === "checkout" && selectedService && (
            <CheckoutSummary
              draft={draft}
              service={selectedService}
              addons={addons}
              onApplyCode={applyDiscountCode}
              onConfirm={handleConfirm}
              confirming={confirming}
              error={confirmError}
            />
          )}

          {step === "confirmed" && confirmed && (
            <Confirmation
              booking={confirmed}
              salonSlug={slug}
              salonName={salonName}
              onBookAgain={reset}
            />
          )}
        </div>
      </div>
    </main>
  );
}
