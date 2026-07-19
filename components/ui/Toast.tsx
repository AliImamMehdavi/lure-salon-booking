"use client";

import { createContext, useCallback, useContext, useState } from "react";
import clsx from "clsx";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error";
}

const ToastContext = createContext<{
  show: (message: string, variant?: Toast["variant"]) => void;
} | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "scale-in pointer-events-auto flex items-center gap-2 rounded-md px-4 py-3 text-sm shadow-lg",
              t.variant === "success" && "bg-[var(--color-ink)] text-[var(--color-bone)]",
              t.variant === "error" && "bg-[var(--color-danger-dim)] text-white"
            )}
          >
            {t.variant === "success" ? (
              <CheckCircleIcon className="h-4 w-4 shrink-0" />
            ) : (
              <XCircleIcon className="h-4 w-4 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.show;
}
