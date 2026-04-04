"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  toast: (options: { title?: string; description?: string; variant?: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    },
    [removeToast],
  );

  const toast = useCallback((options: { title?: string; description?: string; variant?: string; duration?: number }) => {
    const variant = options.variant === "destructive" ? "error" : (options.variant as Toast["variant"] | undefined);
    const message = options.description || options.title || "";
    addToast({ message, variant, duration: options.duration });
  }, [addToast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as Window & { __onwyndAddToast?: (t: Omit<Toast, "id">) => void }).__onwyndAddToast = addToast;
      return () => {
        const w = window as Window & { __onwyndAddToast?: (t: Omit<Toast, "id">) => void };
        if (w.__onwyndAddToast === addToast) {
          delete w.__onwyndAddToast;
        }
      };
    }
    return;
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function toast(options: { title?: string; description?: string; variant?: string; duration?: number }) {
  const add = typeof window !== "undefined"
    ? (window as Window & { __onwyndAddToast?: (t: Omit<Toast, "id">) => void }).__onwyndAddToast
    : undefined;
  const variant = options.variant === "destructive" ? "error" : (options.variant as Toast["variant"] | undefined);
  const message = options.description || options.title || "";
  if (add) {
    add({ message, variant, duration: options.duration });
  }
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 md:p-8 space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-2xl shadow-lg animate-slide-in pointer-events-auto",
            {
              "bg-[#9bb068] text-white": toast.variant === "success",
              "bg-[#fe814b] text-white": toast.variant === "error",
              "bg-[#ffce5c] text-[#4b3425]": toast.variant === "warning",
              "bg-white text-[#4b3425] border-2 border-[#f7f4f2]":
                toast.variant === "info" || !toast.variant,
            },
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {(toast.variant === "success" || !toast.variant) && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16.6667 5L7.50002 14.1667L3.33335 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {toast.variant === "error" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12.5"
                  y1="7.5"
                  x2="7.5"
                  y2="12.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="7.5"
                  y1="7.5"
                  x2="12.5"
                  y2="12.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {toast.variant === "warning" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6.66666V10M10 13.3333H10.0083M8.6 2.86666L2.35 13.3333C2.09762 13.7661 1.96667 14.2587 1.96667 14.76C1.96667 15.2613 2.09762 15.7539 2.35 16.1867C2.60238 16.6195 2.96609 16.9781 3.40237 17.2271C3.83865 17.4761 4.33309 17.6073 4.83667 17.6067H17.3367C17.8403 17.6073 18.3347 17.4761 18.771 17.2271C19.2073 16.9781 19.571 16.6195 19.8233 16.1867C20.0757 15.7539 20.2067 15.2613 20.2067 14.76C20.2067 14.2587 20.0757 13.7661 19.8233 13.3333L13.5733 2.86666C13.321 2.43388 12.9573 2.07526 12.521 1.82625C12.0847 1.57724 11.5903 1.44604 11.0867 1.44604C10.5831 1.44604 10.0887 1.57724 9.65237 1.82625C9.21609 2.07526 8.85238 2.43388 8.6 2.86666Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {toast.variant === "info" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="10"
                  y1="13.3333"
                  x2="10"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="10"
                  y1="6.66666"
                  x2="10.0083"
                  y2="6.66666"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <p className="flex-1 text-sm font-semibold leading-relaxed">
            {toast.message}
          </p>
          <button
            onClick={() => onClose(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
