import { InputHTMLAttributes } from "react";
import clsx from "clsx";

// The bare input styling, exported separately for the rare spot that needs
// an input next to something else (e.g. a discount code field beside an
// "Apply" button) rather than the full labeled block below.
export const inputClass =
  "rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none";

export const labelClass = "text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Field({ label, className, ...props }: FieldProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input className={clsx("mt-1", inputClass, className)} {...props} />
    </div>
  );
}
