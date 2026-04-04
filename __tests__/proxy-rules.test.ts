/**
 * proxy-rules.test.ts
 * ───────────────────
 * Unit tests for route access control logic in proxy.ts.
 * Tests that each role is restricted to its allowed path prefixes
 * and cannot access other role portals.
 *
 * We test the core logic (ROLE_ALLOWED_PREFIXES) without importing the full
 * Next.js middleware, to keep tests fast and dependency-free.
 */

// ── Replicated from proxy.ts (kept in sync manually) ──────────────────────

const ALL_STAFF_PREFIXES_STATIC = [
  '/admin/', '/president/', '/ceo/', '/coo/', '/cgo/', '/cfo/', '/audit/',
  '/vp-sales/', '/vp-marketing/', '/vp-ops/', '/vp-product/',
  '/therapist/', '/secretary/', '/finance/', '/sales/', '/tech/',
  '/manager/', '/marketing/', '/product-manager/', '/product/', '/legal/',
  '/hr/', '/clinical/', '/ambassador/', '/institutional/', '/partner/',
  '/health-personnel/', '/compliance/', '/employee/', '/support/', '/center/',
];

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  super_admin:          ALL_STAFF_PREFIXES_STATIC,
  founder:              ALL_STAFF_PREFIXES_STATIC,
  admin:                ['/admin/'],
  president:            ['/president/'],
  ceo:                  ['/ceo/'],
  coo:                  ['/coo/'],
  cgo:                  ['/cgo/'],
  cfo:                  ['/cfo/'],
  audit:                ['/audit/'],
  vp_sales:             ['/vp-sales/', '/sales/'],
  vp_marketing:         ['/vp-marketing/', '/marketing/'],
  vp_operations:        ['/vp-ops/'],
  vp_product:           ['/vp-product/', '/product-manager/', '/product/'],
  therapist:            ['/therapist/'],
  clinical_advisor:     ['/clinical/'],
  secretary:            ['/secretary/'],
  finance:              ['/finance/'],
  hr:                   ['/hr/'],
  manager:              ['/manager/'],
  employee:             ['/employee/'],
  support:              ['/support/'],
  sales:                ['/sales/'],
  closer:               ['/sales/'],
  tech:                 ['/tech/'],
  tech_team:            ['/tech/'],
  marketing:            ['/marketing/'],
};

function canAccess(role: string, pathname: string): boolean {
  const allowed = ROLE_ALLOWED_PREFIXES[role];
  if (!allowed) return false;
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Admin strict isolation", () => {
  it("admin can access /admin/ paths", () => {
    expect(canAccess("admin", "/admin/dashboard")).toBe(true);
    expect(canAccess("admin", "/admin/users")).toBe(true);
  });

  it("admin cannot access /ceo/ paths (strict isolation)", () => {
    expect(canAccess("admin", "/ceo/dashboard")).toBe(false);
  });

  it("admin cannot access /coo/ paths", () => {
    expect(canAccess("admin", "/coo/dashboard")).toBe(false);
  });

  it("admin cannot access /president/ paths", () => {
    expect(canAccess("admin", "/president/dashboard")).toBe(false);
  });
});

describe("President portal", () => {
  it("president can access /president/ paths", () => {
    expect(canAccess("president", "/president/dashboard")).toBe(true);
    expect(canAccess("president", "/president/okr")).toBe(true);
  });

  it("president cannot access /admin/ paths", () => {
    expect(canAccess("president", "/admin/dashboard")).toBe(false);
  });

  it("president cannot access /ceo/ paths", () => {
    expect(canAccess("president", "/ceo/dashboard")).toBe(false);
  });
});

describe("C-Suite isolation", () => {
  it("ceo can access /ceo/ paths only", () => {
    expect(canAccess("ceo", "/ceo/dashboard")).toBe(true);
    expect(canAccess("ceo", "/admin/dashboard")).toBe(false);
    expect(canAccess("ceo", "/coo/dashboard")).toBe(false);
  });

  it("coo can access /coo/ paths only", () => {
    expect(canAccess("coo", "/coo/dashboard")).toBe(true);
    expect(canAccess("coo", "/admin/dashboard")).toBe(false);
    expect(canAccess("coo", "/ceo/dashboard")).toBe(false);
  });

  it("cgo accesses /cgo/ (not /coo/ — fixed from old bug)", () => {
    expect(canAccess("cgo", "/cgo/dashboard")).toBe(true);
    expect(canAccess("cgo", "/coo/dashboard")).toBe(false);
    expect(canAccess("cgo", "/admin/dashboard")).toBe(false);
  });

  it("cfo can access /cfo/ paths only", () => {
    expect(canAccess("cfo", "/cfo/dashboard")).toBe(true);
    expect(canAccess("cfo", "/finance/dashboard")).toBe(false);
    expect(canAccess("cfo", "/admin/dashboard")).toBe(false);
  });
});

describe("Audit portal isolation", () => {
  it("audit can access /audit/ paths", () => {
    expect(canAccess("audit", "/audit/dashboard")).toBe(true);
    expect(canAccess("audit", "/audit/log")).toBe(true);
  });

  it("audit cannot access /admin/ or any other portal", () => {
    expect(canAccess("audit", "/admin/dashboard")).toBe(false);
    expect(canAccess("audit", "/finance/dashboard")).toBe(false);
  });
});

describe("VP tier portals", () => {
  it("vp_sales can access /vp-sales/ and /sales/", () => {
    expect(canAccess("vp_sales", "/vp-sales/dashboard")).toBe(true);
    expect(canAccess("vp_sales", "/sales/dashboard")).toBe(true);
  });

  it("vp_sales cannot access /marketing/ or /admin/", () => {
    expect(canAccess("vp_sales", "/marketing/dashboard")).toBe(false);
    expect(canAccess("vp_sales", "/admin/dashboard")).toBe(false);
  });

  it("vp_marketing can access /vp-marketing/ and /marketing/", () => {
    expect(canAccess("vp_marketing", "/vp-marketing/dashboard")).toBe(true);
    expect(canAccess("vp_marketing", "/marketing/dashboard")).toBe(true);
  });

  it("vp_operations can access /vp-ops/ only", () => {
    expect(canAccess("vp_operations", "/vp-ops/dashboard")).toBe(true);
    expect(canAccess("vp_operations", "/hr/dashboard")).toBe(false);
  });

  it("vp_product can access /vp-product/, /product-manager/, /product/", () => {
    expect(canAccess("vp_product", "/vp-product/dashboard")).toBe(true);
    expect(canAccess("vp_product", "/product-manager/dashboard")).toBe(true);
    expect(canAccess("vp_product", "/product/dashboard")).toBe(true);
    expect(canAccess("vp_product", "/tech/dashboard")).toBe(false);
  });
});

describe("Super admin full access", () => {
  it("super_admin can access any staff portal", () => {
    const paths = [
      "/admin/dashboard", "/president/dashboard", "/ceo/dashboard", "/coo/dashboard",
      "/cfo/dashboard", "/audit/dashboard", "/vp-sales/dashboard", "/vp-marketing/dashboard",
      "/vp-ops/dashboard", "/vp-product/dashboard", "/finance/dashboard", "/hr/dashboard",
    ];
    for (const path of paths) {
      expect(canAccess("super_admin", path)).toBe(true);
    }
  });
});

describe("Closer role", () => {
  it("closer can access /sales/ paths", () => {
    expect(canAccess("closer", "/sales/dashboard")).toBe(true);
    expect(canAccess("closer", "/sales/closer")).toBe(true);
  });

  it("closer cannot access /admin/ paths", () => {
    expect(canAccess("closer", "/admin/dashboard")).toBe(false);
  });
});
