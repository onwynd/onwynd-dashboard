/**
 * kpi-config.test.ts
 * ──────────────────
 * Unit tests for KPI anomaly threshold logic.
 * Tests that the right alert/warn levels fire for each role's KPIs.
 */

import { getKpisForRole } from "@/lib/kpi/config";

describe("getKpisForRole", () => {
  it("returns a non-empty array for known roles", () => {
    const roles = ["admin", "president", "ceo", "coo", "cgo", "cfo", "audit",
                   "vp_sales", "vp_marketing", "vp_operations", "vp_product"];
    for (const role of roles) {
      const kpis = getKpisForRole(role);
      expect(kpis.length).toBeGreaterThan(0);
    }
  });

  it("returns an empty array for unknown roles", () => {
    expect(getKpisForRole("nonexistent_role")).toEqual([]);
  });

  it("every KPI definition has required fields", () => {
    const allRoles = ["admin", "ceo", "coo", "cfo", "audit", "vp_sales"];
    for (const role of allRoles) {
      const kpis = getKpisForRole(role);
      for (const kpi of kpis) {
        expect(kpi.key).toBeTruthy();
        expect(kpi.label).toBeTruthy();
        expect(["currency_ngn", "currency_usd", "percent", "number", "duration_h"])
          .toContain(kpi.format);
      }
    }
  });
});

describe("KPI anomaly threshold coverage", () => {
  it("cfo gross_margin has warn and alert thresholds", () => {
    const kpis = getKpisForRole("cfo");
    const gm = kpis.find((k) => k.key === "gross_margin");
    expect(gm).toBeDefined();
    expect(gm?.warnBelow).toBeDefined();
    expect(gm?.alertBelow).toBeDefined();
    expect(gm?.warnBelow).toBeGreaterThan(gm?.alertBelow!);
  });

  it("audit compliance_score triggers at correct thresholds", () => {
    const kpis = getKpisForRole("audit");
    const cs = kpis.find((k) => k.key === "compliance_score");
    expect(cs).toBeDefined();
    expect(cs?.warnBelow).toBe(90);
    expect(cs?.alertBelow).toBe(70);
  });

  it("vp_product system_uptime_pct alerts below 99%", () => {
    const kpis = getKpisForRole("vp_product");
    const uptime = kpis.find((k) => k.key === "system_uptime_pct");
    expect(uptime).toBeDefined();
    expect(uptime?.alertBelow).toBe(99);
  });

  it("ceo churn_rate alerts above threshold", () => {
    const kpis = getKpisForRole("ceo");
    const churn = kpis.find((k) => k.key === "churn_rate");
    expect(churn).toBeDefined();
    expect(churn?.alertAbove).toBeGreaterThan(0);
  });

  it("cash_runway_months for cfo alerts below 6 and warns below 12", () => {
    const kpis = getKpisForRole("cfo");
    const runway = kpis.find((k) => k.key === "cash_runway_months");
    expect(runway?.alertBelow).toBe(6);
    expect(runway?.warnBelow).toBe(12);
  });
});

describe("KPI href deep-links", () => {
  it("all KPIs with hrefs start with /", () => {
    const roles = ["admin", "ceo", "cfo", "vp_sales"];
    for (const role of roles) {
      const kpis = getKpisForRole(role);
      for (const kpi of kpis) {
        if (kpi.href) {
          expect(kpi.href).toMatch(/^\//);
        }
      }
    }
  });
});
