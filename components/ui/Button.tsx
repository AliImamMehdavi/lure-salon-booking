import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "ghost-inverse";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-clay)]",
        variant === "primary" &&
          "bg-[var(--color-ink)] text-[var(--color-bone)] hover:bg-[var(--color-clay-dim)]",
        variant === "ghost" &&
          "border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-clay)] hover:text-[var(--color-clay-dim)]",
        variant === "ghost-inverse" &&
          "border border-[var(--color-bone)]/30 text-[var(--color-bone)] hover:border-[var(--color-clay)] hover:text-[var(--color-clay)]",
        className
      )}
      {...props}
    />
  );
}
