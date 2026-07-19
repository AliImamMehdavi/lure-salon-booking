"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function GroupGuestNames({
  guestCount,
  initialNames,
  onSubmit,
}: {
  guestCount: number;
  initialNames?: string[];
  onSubmit: (names: string[]) => void;
}) {
  const additionalCount = guestCount - 1;
  const [names, setNames] = useState<string[]>(
    initialNames && initialNames.length === additionalCount
      ? initialNames
      : Array.from({ length: additionalCount }, () => "")
  );

  const allFilled = names.every((n) => n.trim().length > 0);

  return (
    <div>
      <h2 className="font-display text-2xl text-[var(--color-ink)]">Who&apos;s in the party?</h2>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        You&apos;re the booking contact. Add a name for each other guest — everyone gets the
        same service, stylist, and time.
      </p>

      <form
        className="mt-6 max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(names);
        }}
      >
        {names.map((name, i) => (
          <Field
            key={i}
            label={`Guest ${i + 2}`}
            required
            value={name}
            placeholder="Full name"
            className="w-full"
            onChange={(e) => {
              const next = [...names];
              next[i] = e.target.value;
              setNames(next);
            }}
          />
        ))}
        <Button type="submit" disabled={!allFilled}>
          Continue
        </Button>
      </form>
    </div>
  );
}
