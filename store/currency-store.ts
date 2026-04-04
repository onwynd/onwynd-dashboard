/**
 * Currency Store
 * ──────────────
 * Manages NGN/USD exchange rate fetched from the backend (which caches
 * the rate from frankfurter.app for 24h to stay within free-tier limits).
 *
 * Falls back to a hardcoded rate if the API is unreachable.
 */
import { create } from "zustand";
import client from "@/lib/api/client";

const FALLBACK_RATE = 1580; // NGN per 1 USD — update periodically as fallback

interface CurrencyState {
  /** NGN per 1 USD */
  usdToNgn: number;
  lastFetched: number | null;
  isFetching: boolean;
  /** Fetch exchange rate from backend; no-op if fetched within the last hour */
  fetchRate: () => Promise<void>;
  /** Format a value in NGN */
  formatNGN: (value: number, decimals?: number) => string;
  /** Format a value in USD */
  formatUSD: (value: number, decimals?: number) => string;
  /** Convert NGN to USD */
  toUSD: (ngn: number) => number;
  /** Convert USD to NGN */
  toNGN: (usd: number) => number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  usdToNgn: FALLBACK_RATE,
  lastFetched: null,
  isFetching: false,

  fetchRate: async () => {
    const { lastFetched, isFetching } = get();
    const now = Date.now();

    // Skip if we already fetched within the last hour or a request is in-flight
    if (isFetching) return;
    if (lastFetched && now - lastFetched < ONE_HOUR_MS) return;

    set({ isFetching: true });
    try {
      const res = await client.get("/api/v1/config/exchange-rate");
      const rate = res.data?.data?.usd_to_ngn ?? res.data?.usd_to_ngn;
      if (typeof rate === "number" && rate > 0) {
        set({ usdToNgn: rate, lastFetched: now });
      }
    } catch {
      // Silently fall back to the last known rate — don't break dashboards
    } finally {
      set({ isFetching: false });
    }
  },

  formatNGN: (value, decimals = 0) => {
    if (!isFinite(value)) return "₦—";
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_000_000_000) return `${sign}₦${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000)     return `${sign}₦${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)         return `${sign}₦${(abs / 1_000).toFixed(0)}K`;
    return `${sign}₦${abs.toFixed(decimals)}`;
  },

  formatUSD: (value, decimals = 2) => {
    if (!isFinite(value)) return "$—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  toUSD: (ngn) => {
    const rate = get().usdToNgn;
    return rate > 0 ? ngn / rate : 0;
  },

  toNGN: (usd) => {
    return usd * get().usdToNgn;
  },
}));
