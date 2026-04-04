/**
 * ROLE-BASED PERMISSION CONFIG
 * ════════════════════════════
 * Defines what each role can READ / WRITE / UPDATE / DELETE per resource.
 *
 * This is the single source of truth for frontend permission checks.
 * Backend enforces the same rules via Laravel policies/middleware.
 *
 * Usage:
 *   const { can } = usePermission();
 *   can('finance', 'write')   // true for finance/cfo/admin/president
 *   can('users', 'delete')    // true only for admin/super_admin
 *
 * Permission levels:
 *   read   → GET  (view data)
 *   write  → POST (create new records)
 *   update → PUT/PATCH (edit existing records)
 *   delete → DELETE (remove records)
 */

export type Permission = 'read' | 'write' | 'update' | 'delete';

export type Resource =
  | 'users'
  | 'roles'
  | 'therapists'
  | 'sessions'
  | 'finance'
  | 'invoices'
  | 'payouts'
  | 'salaries'
  | 'hr'
  | 'payroll'
  | 'leave'
  | 'recruitment'
  | 'sales'
  | 'deals'
  | 'leads'
  | 'contacts'
  | 'marketing'
  | 'campaigns'
  | 'subscribers'
  | 'support'
  | 'tickets'
  | 'knowledge_base'
  | 'tech'
  | 'deployments'
  | 'system_health'
  | 'product'
  | 'roadmap'
  | 'features'
  | 'compliance'
  | 'audit_log'
  | 'legal'
  | 'organizations'
  | 'okr'
  | 'kpi'
  | 'reports'
  | 'notifications'
  | 'feature_flags'
  | 'security_keys'
  | 'content'
  | 'ambassador'
  | 'partner'
  | 'budget'
  | 'campaign_expense'
  | 'page_views';

/** Full CRUD shorthand */
const ALL: Permission[] = ['read', 'write', 'update', 'delete'];
/** Read + create + edit but no delete */
const RWU: Permission[] = ['read', 'write', 'update'];
/** Read + edit only */
const RU: Permission[]  = ['read', 'update'];
/** Read only */
const R: Permission[]   = ['read'];

type RolePermissions = Partial<Record<Resource, Permission[]>>;

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {

  // ── CONTROL TOWER ──────────────────────────────────────────────────────────
  super_admin: Object.fromEntries(
    (Object.keys({} as Record<Resource, never>)).map((r) => [r, ALL])
  ) as RolePermissions,

  admin: {
    users:          ALL,
    roles:          ALL,
    therapists:     ALL,
    sessions:       ALL,
    finance:        RWU,
    invoices:       RWU,
    payouts:        RWU,
    salaries:       RWU,
    hr:             RWU,
    payroll:        RWU,
    leave:          RWU,
    recruitment:    RWU,
    sales:          RWU,
    deals:          RWU,
    leads:          RWU,
    contacts:       RWU,
    marketing:      RWU,
    campaigns:      RWU,
    subscribers:    RWU,
    support:        RWU,
    tickets:        RWU,
    knowledge_base: ALL,
    tech:           RWU,
    deployments:    RWU,
    system_health:  R,
    product:        RWU,
    roadmap:        RWU,
    features:       RWU,
    compliance:     RWU,
    audit_log:      R,
    legal:          R,
    organizations:  ALL,
    okr:            ALL,
    kpi:            ALL,
    reports:        R,
    notifications:  ALL,
    feature_flags:  ALL,
    security_keys:  ALL,
    content:        ALL,
    ambassador:       RWU,
    partner:          RWU,
    budget:           ALL,
    campaign_expense: ALL,
    page_views:       ALL,
  },

  // ── OVERSIGHT TIER ─────────────────────────────────────────────────────────
  president: {
    users:          R,
    roles:          R,
    therapists:     R,
    sessions:       R,
    finance:        R,
    invoices:       R,
    payouts:        R,
    salaries:       R,
    hr:             R,
    payroll:        R,
    leave:          R,
    recruitment:    R,
    sales:          R,
    deals:          R,
    leads:          R,
    contacts:       R,
    marketing:      R,
    campaigns:      R,
    subscribers:    R,
    support:        R,
    tickets:        R,
    knowledge_base: R,
    tech:           R,
    deployments:    R,
    system_health:  R,
    product:        R,
    roadmap:        R,
    features:       R,
    compliance:     R,
    audit_log:      R,
    legal:          R,
    organizations:  R,
    okr:            RWU,   // President can set objectives
    kpi:            R,
    reports:        R,
    notifications:  R,
    feature_flags:  R,
    security_keys:  R,
    content:        R,
    ambassador:       R,
    partner:          R,
    budget:           RU,            // President can view + approve at CEO level
    campaign_expense: R,
    page_views:       R,
  },

  // ── C-SUITE ────────────────────────────────────────────────────────────────
  ceo: {
    users:         R,
    therapists:    R,
    sessions:      R,
    finance:       R,
    invoices:      R,
    payouts:       R,
    salaries:      R,
    sales:         R,
    deals:         R,
    leads:         R,
    marketing:     R,
    campaigns:     R,
    support:       R,
    tickets:       R,
    tech:          R,
    system_health: R,
    product:       R,
    roadmap:       R,
    hr:            R,
    compliance:    R,
    audit_log:     R,
    organizations: R,
    okr:           ALL,
    kpi:           R,
    reports:       R,
    notifications: R,
    partner:          R,
    budget:           RU,            // CEO approves budgets
    campaign_expense: R,
    page_views:       R,
  },

  coo: {
    users:         R,
    sessions:      R,
    sales:         RU,
    deals:         RU,
    support:       RU,
    tickets:       RU,
    hr:            RU,
    payroll:       R,
    leave:         RU,
    finance:       R,
    marketing:     R,
    campaigns:     R,
    tech:          R,
    system_health: R,
    product:       R,
    okr:              RWU,
    kpi:              R,
    reports:          R,
    notifications:    R,
    budget:           RU,            // COO approves budgets
    campaign_expense: R,
    page_views:       R,
  },

  cgo: {
    marketing:    ALL,
    campaigns:    ALL,
    subscribers:  ALL,
    ambassador:   ALL,
    partner:      RWU,
    leads:        RWU,
    contacts:     RWU,
    sales:        R,
    users:        R,
    okr:          RWU,
    kpi:          R,
    reports:      R,
    notifications:R,
  },

  cfo: {
    finance:      ALL,
    invoices:     ALL,
    payouts:      ALL,
    salaries:     ALL,
    payroll:      ALL,
    reports:      R,
    users:        R,
    sessions:     R,
    sales:        R,
    deals:        R,
    okr:          RWU,
    kpi:          R,
    notifications:R,
    organizations:R,
    partner:          R,
    budget:           RU,            // CFO gives final finance approval
    campaign_expense: RU,            // CFO can review/approve campaign expenses
    page_views:       R,
  },

  // ── AUDIT / COMPLIANCE ─────────────────────────────────────────────────────
  audit: {
    users:         R,
    roles:         R,
    therapists:    R,
    sessions:      R,
    finance:       R,
    invoices:      R,
    payouts:       R,
    salaries:      R,
    hr:            R,
    payroll:       R,
    sales:         R,
    deals:         R,
    marketing:     R,
    support:       R,
    tickets:       R,
    tech:          R,
    deployments:   R,
    system_health: R,
    compliance:    R,
    audit_log:     R,
    legal:         R,
    organizations: R,
    okr:           R,
    kpi:           R,
    reports:       R,
    notifications: R,
    feature_flags: R,
    security_keys:    R,
    budget:           R,
    campaign_expense: R,
    page_views:       ALL,           // Audit role owns the "who viewed" feature
  },

  // ── VP TIER ────────────────────────────────────────────────────────────────
  vp_sales: {
    sales:         ALL,
    deals:         ALL,
    leads:         ALL,
    contacts:      ALL,
    users:         R,
    finance:       R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  vp_marketing: {
    marketing:        ALL,
    campaigns:        ALL,
    subscribers:      ALL,
    leads:            RWU,
    contacts:         RWU,
    ambassador:       RWU,
    users:            R,
    reports:          R,
    okr:              RWU,
    kpi:              R,
    notifications:    R,
    budget:           RWU,           // VP Marketing submits + can see own budgets
    campaign_expense: RWU,           // VP Marketing can review expenses
  },

  vp_operations: {
    hr:            RWU,
    payroll:       R,
    leave:         ALL,
    recruitment:   RWU,
    support:       RWU,
    tickets:       RWU,
    sessions:      R,
    users:         R,
    finance:       R,
    okr:           RWU,
    kpi:           R,
    reports:       R,
    notifications: R,
  },

  vp_product: {
    product:       ALL,
    roadmap:       ALL,
    features:      ALL,
    tech:          RU,
    deployments:   R,
    system_health: R,
    users:         R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  // ── DEPARTMENT LEADS ───────────────────────────────────────────────────────
  finance: {
    finance:       RWU,
    invoices:      RWU,
    payouts:       RWU,
    salaries:      R,
    reports:       R,
    users:         R,
    sessions:      R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  hr: {
    hr:            ALL,
    payroll:       RWU,
    leave:         ALL,
    recruitment:   ALL,
    users:         R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  marketing: {
    marketing:        ALL,
    campaigns:        ALL,
    subscribers:      ALL,
    leads:            RWU,
    contacts:         RWU,
    ambassador:       RWU,
    users:            R,
    reports:          R,
    okr:              RWU,
    kpi:              R,
    notifications:    R,
    budget:           RWU,           // Marketing can submit budget requests
    campaign_expense: RWU,           // Marketing logs campaign expenses + proof
  },

  sales: {
    sales:         RWU,
    deals:         RWU,
    leads:         RWU,
    contacts:      RWU,
    users:         R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
    budget:        RWU,              // Sales can submit budget requests
  },

  closer: {
    sales:         RWU,
    deals:         ALL,
    leads:         RWU,
    contacts:      R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  support: {
    support:       ALL,
    tickets:       ALL,
    knowledge_base:RWU,
    users:         R,
    sessions:      R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  tech: {
    tech:          ALL,
    deployments:   ALL,
    system_health: R,
    feature_flags: RWU,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  tech_team: {
    tech:          ALL,
    deployments:   ALL,
    system_health: R,
    feature_flags: RWU,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  product_manager: {
    product:       ALL,
    roadmap:       ALL,
    features:      ALL,
    tech:          R,
    users:         R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  compliance: {
    compliance:    ALL,
    audit_log:     R,
    users:         R,
    sessions:      R,
    legal:         R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  legal_advisor: {
    legal:         ALL,
    compliance:    R,
    audit_log:     R,
    users:         R,
    sessions:      R,
    organizations: R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  clinical_advisor: {
    sessions:      RU,
    therapists:    R,
    users:         R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  manager: {
    users:         R,
    sessions:      R,
    hr:            R,
    reports:       R,
    okr:           RWU,
    kpi:           R,
    notifications: R,
  },

  // ── CONTRIBUTORS ───────────────────────────────────────────────────────────
  relationship_manager: {
    organizations: RWU,
    partner:       RWU,
    contacts:      RWU,
    sales:         R,
    users:         R,
    okr:           RU,
    kpi:           R,
    notifications: R,
  },

  secretary: {
    sessions:      RWU,
    users:         R,
    notifications: R,
    kpi:           R,
  },

  employee: {
    users:         R,
    notifications: R,
    kpi:           R,
  },

  ambassador: {
    ambassador:    RWU,
    users:         R,
    notifications: R,
  },

  partner: {
    partner:       RWU,
    organizations: R,
    users:         R,
    notifications: R,
  },

  health_personnel: {
    sessions:      R,
    users:         R,
    notifications: R,
  },
};

/**
 * Check if a role has a given permission on a resource.
 */
export function hasPermission(
  role: string,
  resource: Resource,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role]?.[resource]?.includes(permission) ?? false;
}
