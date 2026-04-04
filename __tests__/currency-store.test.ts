/**
 * currency-store.test.ts
 * ──────────────────────
 * Unit tests for the Zustand currency store.
 * Tests formatting helpers and conversion logic without hitting the network.
 */

import { useCurrencyStore } from "@/store/currency-store";

// Reset store state between tests
beforeEach(() => {
  useCurrencyStore.setState({ usdToNgn: 1580, lastFetched: null, isFetching: false });
});

describe("formatNGN", () => {
  it("formats values in billions", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(1_500_000_000)).toBe("₦1.5B");
  });

  it("formats values in millions", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(2_500_000)).toBe("₦2.5M");
  });

  it("formats values in thousands", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(250_000)).toBe("₦250K");
  });

  it("formats small values as plain NGN", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(500)).toBe("₦500");
  });

  it("formats negative values correctly", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(-1_000_000)).toBe("-₦1.0M");
  });

  it("returns ₦— for Infinity", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(Infinity)).toBe("₦—");
  });

  it("returns ₦— for NaN", () => {
    const { formatNGN } = useCurrencyStore.getState();
    expect(formatNGN(NaN)).toBe("₦—");
  });
});

describe("formatUSD", () => {
  it("formats a dollar amount correctly", () => {
    const { formatUSD } = useCurrencyStore.getState();
    expect(formatUSD(1234.56)).toBe("$1,234.56");
  });

  it("returns $— for Infinity", () => {
    const { formatUSD } = useCurrencyStore.getState();
    expect(formatUSD(Infinity)).toBe("$—");
  });
});

describe("toUSD", () => {
  it("converts NGN to USD at the stored rate", () => {
    const { toUSD } = useCurrencyStore.getState();
    expect(toUSD(1_580_000)).toBeCloseTo(1000, 1);
  });

  it("returns 0 when rate is 0 (guard against division by zero)", () => {
    useCurrencyStore.setState({ usdToNgn: 0 });
    const { toUSD } = useCurrencyStore.getState();
    expect(toUSD(1000)).toBe(0);
  });
});

describe("toNGN", () => {
  it("converts USD to NGN at the stored rate", () => {
    const { toNGN } = useCurrencyStore.getState();
    expect(toNGN(100)).toBe(158_000);
  });
});

describe("fetchRate", () => {
  it("skips fetch if already fetched within 1 hour", async () => {
    useCurrencyStore.setState({ lastFetched: Date.now(), usdToNgn: 1600 });
    const { fetchRate } = useCurrencyStore.getState();
    await fetchRate();
    // Rate should not change — fetch was skipped
    expect(useCurrencyStore.getState().usdToNgn).toBe(1600);
  });

  it("skips fetch if already in-flight", async () => {
    useCurrencyStore.setState({ isFetching: true, usdToNgn: 1600 });
    const { fetchRate } = useCurrencyStore.getState();
    await fetchRate();
    expect(useCurrencyStore.getState().usdToNgn).toBe(1600);
  });
});
