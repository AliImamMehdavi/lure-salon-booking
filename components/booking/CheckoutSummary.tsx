"use client";

import { useState } from "react";
import { format } from "date-fns";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import type { Addon, BookingDraft, Service } from "@/lib/types";

export function CheckoutSummary({
  draft,
  service,
  addons,
  onApplyCode,
  onConfirm,
  confirming,
  error,
}: {
  draft: BookingDraft;
  service: Service;
  addons: Addon[];
  onApplyCode: (code: string) => void;
  onConfirm: () => void;
  confirming: boolean;
  error?: string;
}) {
  const [code, setCode] = useState("");

  const chosenAddons = addons.filter((a) => draft.addonIds.includes(a.id));
  const addonsTotal = chosenAddons.reduce((sum, a) => sum + a.price, 0);
  const perGuestTotal = service.price + addonsTotal;
  const total = perGuestTotal * draft.guestCount;

  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Review & confirm</h2>

      <div className="mt-6 rounded-md border border-[var(--color-line)] bg-white p-5 ticket-notch">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-ink)]">{service.name}</span>
          <span className="font-mono text-[var(--color-clay-dim)]">${service.price}</span>
        </div>
        {chosenAddons.map((a) => (
          <div key={a.id} className="mt-1 flex justify-between text-xs text-[var(--color-ink)]/60">
            <span>+ {a.name}</span>
            <span className="font-mono">{a.price === 0 ? "included" : `+$${a.price}`}</span>
          </div>
        ))}
        {draft.slot && (
          <p className="mt-2 text-xs font-mono text-[var(--color-ink)]/50">
            {format(new Date(draft.slot.startTime), "EEE, MMM d · h:mm a")} · {draft.guestCount}{" "}
            guest{draft.guestCount > 1 ? "s" : ""}
          </p>
        )}
        {draft.groupGuests && draft.groupGuests.length > 0 && draft.guest && (
          <p className="mt-1 text-xs text-[var(--color-ink)]/50">
            Party: {[draft.guest.name, ...draft.groupGuests.map((g) => g.name)].join(", ")}
          </p>
        )}

        <div className="mt-4 border-t border-dashed border-[var(--color-line)] pt-4">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Discount code"
              className={clsx("flex-1", inputClass)}
            />
            <Button variant="ghost" type="button" onClick={() => onApplyCode(code)}>
              Apply
            </Button>
          </div>
          {draft.discountCode && (
            <p className="mt-2 text-xs text-[var(--color-sage)]">
              Code &ldquo;{draft.discountCode}&rdquo; will be applied at confirmation.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
          <span className="text-sm text-[var(--color-ink)]">
            Total{draft.guestCount > 1 ? ` (×${draft.guestCount} guests)` : ""}
          </span>
          <span className="font-mono text-lg text-[var(--color-clay-dim)]">${total}</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-sm border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger-dim)]">
          {error}
        </p>
      )}

      <Button className="mt-4 w-full sm:w-auto" onClick={onConfirm} disabled={confirming}>
        {confirming ? "Confirming…" : "Confirm booking"}
      </Button>
      <p className="mt-3 text-xs text-[var(--color-ink)]/45">
        No payment is collected online. We&apos;ll email/WhatsApp you to confirm details.
      </p>
    </div>
  );
}
