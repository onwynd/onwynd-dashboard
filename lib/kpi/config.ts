/**
 * KPI Configuration
 * ─────────────────
 * Static KPI definitions per role slug.
 * Each KPI maps to a metric key returned by GET /api/v1/kpi/snapshot?role={slug}.
 *
 * Anomaly thresholds:
 *   - `warnBelow`  → badge shows "amber" when value drops below this %
 *   - `alertBelow` → badge shows "red"   when value drops below this %
 *   - `alertAbove` → badge shows "red"   when value exceeds this (e.g. churn rate)
 *
 * Format helpers:
 *   - currency_ngn → ₦ formatted
 *   - currency_usd → $ formatted
 *   - percent       → append %
 *   - number        → integer
 *   - duration_h    → append "h"
 */

export type KpiFormat = "currency_ngn" | "currency_usd" | "percent" | "number" | "duration_h";

export interface KpiDefinition {
  /** Metric key from API snapshot */
  key: string;
  label: string;
  format: KpiFormat;
  /** Lower bound for warning (yellow) */
  warnBelow?: number;
  /** Lower bound for alert (red) */
  alertBelow?: number;
  /** Upper bound for alert (red) — e.g. churn rate, error rate */
  alertAbove?: number;
  /** URL to deep-link from the card */
  href?: string;
  description?: string;
}

export type RoleKpiConfig = KpiDefinition[];

const KPI_BY_ROLE: Record<string, RoleKpiConfig> = {
  admin: [
    { key: "total_revenue",       label: "Total Revenue",        format: "currency_ngn", warnBelow: 0,    href: "/admin/finance/revenue"     },
    { key: "active_users",        label: "Active Users",          format: "number",       warnBelow: 100,  href: "/admin/analytics"           },
    { key: "sessions_this_month", label: "Sessions (MTD)",        format: "number",       warnBelow: 50,   href: "/admin/sessions"            },
    { key: "therapist_count",     label: "Active Therapists",     format: "number",       warnBelow: 10,   href: "/admin/therapists"          },
    { key: "open_support_tickets",label: "Open Tickets",          format: "number",       alertAbove: 50,  href: "/admin/support"             },
    { key: "churn_rate",          label: "Churn Rate",            format: "percent",      alertAbove: 5,   href: "/admin/analytics"           },
  ],

  president: [
    { key: "total_revenue",       label: "Total Revenue",         format: "currency_ngn", warnBelow: 0,    href: "/president/dashboard"       },
    { key: "active_users",        label: "Active Users",           format: "number",       warnBelow: 100,  href: "/president/dashboard"       },
    { key: "company_okr_health",  label: "OKR Health Score",       format: "percent",      warnBelow: 70,   alertBelow: 50, href: "/okr"      },
    { key: "employee_count",      label: "Headcount",              format: "number",       href: "/president/departments"                     },
    { key: "open_alerts",         label: "Priority Alerts",        format: "number",       alertAbove: 5,   href: "/president/dashboard"       },
    { key: "sessions_this_month", label: "Sessions (MTD)",         format: "number",       warnBelow: 50,   href: "/president/dashboard"       },
  ],

  ceo: [
    { key: "mrr",                  label: "MRR",                   format: "currency_ngn", warnBelow: 0,    href: "/ceo/revenue"               },
    { key: "active_users",         label: "Active Users",           format: "number",       warnBelow: 100,  href: "/ceo/analytics"             },
    { key: "revenue_growth_pct",   label: "Revenue Growth",         format: "percent",      warnBelow: 5,    alertBelow: 0, href: "/ceo/revenue"},
    { key: "cac",                  label: "CAC",                    format: "currency_ngn", alertAbove: 50000, href: "/ceo/leads"              },
    { key: "churn_rate",           label: "Churn Rate",             format: "percent",      alertAbove: 5,   href: "/ceo/analytics"             },
    { key: "okr_health_score",     label: "OKR Score",              format: "percent",      warnBelow: 70,   href: "/okr"                       },
  ],

  coo: [
    { key: "sessions_live",        label: "Sessions Live Now",      format: "number",       href: "/coo/dashboard"                             },
    { key: "open_support_tickets", label: "Open Tickets",           format: "number",       alertAbove: 20,  href: "/coo/support"               },
    { key: "win_rate",             label: "Sales Win Rate",         format: "percent",      warnBelow: 20,   href: "/coo/sales"                 },
    { key: "avg_resolution_h",     label: "Avg Resolution Time",    format: "duration_h",   alertAbove: 48,  href: "/coo/support"               },
    { key: "on_leave_today",       label: "Staff on Leave",         format: "number",       href: "/coo/dashboard"                             },
    { key: "api_error_rate",       label: "API Error Rate",         format: "percent",      alertAbove: 1,   href: "/coo/platform"              },
  ],

  cgo: [
    { key: "new_leads_mtd",        label: "New Leads (MTD)",        format: "number",       warnBelow: 50,   href: "/cgo/leads"                 },
    { key: "active_campaigns",     label: "Active Campaigns",       format: "number",       href: "/cgo/campaigns"                             },
    { key: "subscriber_count",     label: "Total Subscribers",      format: "number",       warnBelow: 1000, href: "/cgo/subscribers"           },
    { key: "email_open_rate",      label: "Email Open Rate",        format: "percent",      warnBelow: 20,   href: "/cgo/campaigns"             },
    { key: "ambassador_count",     label: "Active Ambassadors",     format: "number",       href: "/cgo/ambassadors"                           },
    { key: "cac",                  label: "CAC",                    format: "currency_ngn", alertAbove: 50000, href: "/cgo/dashboard"           },
  ],

  cfo: [
    { key: "total_revenue",        label: "Total Revenue",          format: "currency_ngn", href: "/cfo/revenue"                               },
    { key: "mrr",                  label: "MRR",                    format: "currency_ngn", href: "/cfo/revenue"                               },
    { key: "gross_margin",         label: "Gross Margin",           format: "percent",      warnBelow: 40,   alertBelow: 20, href: "/cfo/revenue"},
    { key: "burn_rate",            label: "Monthly Burn",           format: "currency_ngn", alertAbove: 5000000, href: "/cfo/expenses"         },
    { key: "cash_runway_months",   label: "Cash Runway",            format: "number",       alertBelow: 6,   warnBelow: 12, href: "/cfo/statements"},
    { key: "outstanding_invoices", label: "Outstanding Invoices",   format: "currency_ngn", alertAbove: 2000000, href: "/cfo/invoices"         },
  ],

  audit: [
    { key: "events_today",         label: "Events Today",           format: "number",       href: "/audit/log"                                 },
    { key: "flagged_events",       label: "Flagged Events",         format: "number",       alertAbove: 0,   href: "/audit/log"                 },
    { key: "compliance_score",     label: "Compliance Score",       format: "percent",      warnBelow: 90,   alertBelow: 70, href: "/audit/compliance"},
    { key: "active_violations",    label: "Active Violations",      format: "number",       alertAbove: 0,   href: "/audit/compliance"          },
    { key: "security_events",      label: "Security Events",        format: "number",       alertAbove: 5,   href: "/audit/security"            },
    { key: "users_audited",        label: "Users Audited",          format: "number",       href: "/audit/users"                               },
  ],

  vp_sales: [
    { key: "total_leads",          label: "Total Leads",            format: "number",       warnBelow: 50,   href: "/vp-sales/leads"            },
    { key: "deals_closed_mtd",     label: "Deals Closed (MTD)",     format: "number",       warnBelow: 5,    href: "/vp-sales/deals"            },
    { key: "pipeline_value",       label: "Pipeline Value",         format: "currency_ngn", href: "/vp-sales/pipeline"                         },
    { key: "win_rate",             label: "Win Rate",               format: "percent",      warnBelow: 20,   href: "/vp-sales/pipeline"         },
    { key: "avg_deal_size",        label: "Avg Deal Size",          format: "currency_ngn", href: "/vp-sales/deals"                            },
    { key: "revenue_target_pct",   label: "Revenue Target",         format: "percent",      warnBelow: 80,   href: "/vp-sales/reports"          },
  ],

  vp_marketing: [
    { key: "active_campaigns",     label: "Active Campaigns",       format: "number",       href: "/vp-marketing/campaigns"                    },
    { key: "new_leads_mtd",        label: "New Leads (MTD)",        format: "number",       warnBelow: 30,   href: "/vp-marketing/leads"        },
    { key: "email_open_rate",      label: "Email Open Rate",        format: "percent",      warnBelow: 20,   href: "/vp-marketing/campaigns"    },
    { key: "subscriber_growth",    label: "Subscriber Growth",      format: "number",       href: "/vp-marketing/subscribers"                  },
    { key: "cac",                  label: "CAC",                    format: "currency_ngn", alertAbove: 50000, href: "/vp-marketing/reports"   },
    { key: "content_published",    label: "Content Published",      format: "number",       href: "/vp-marketing/content"                      },
  ],

  vp_operations: [
    { key: "sessions_live",        label: "Sessions Live",          format: "number",       href: "/vp-ops/sessions"                           },
    { key: "open_support_tickets", label: "Open Tickets",           format: "number",       alertAbove: 20,  href: "/vp-ops/support"            },
    { key: "hr_headcount",         label: "Headcount",              format: "number",       href: "/vp-ops/hr"                                 },
    { key: "on_leave_today",       label: "On Leave Today",         format: "number",       href: "/vp-ops/leave"                              },
    { key: "open_positions",       label: "Open Positions",         format: "number",       href: "/vp-ops/recruitment"                        },
    { key: "avg_ticket_resolution",label: "Avg Resolution",         format: "duration_h",   alertAbove: 48,  href: "/vp-ops/support"            },
  ],

  vp_product: [
    { key: "features_shipped_mtd", label: "Features Shipped (MTD)", format: "number",      href: "/vp-product/features"                       },
    { key: "in_development",       label: "In Development",         format: "number",       href: "/vp-product/features"                       },
    { key: "bug_count",            label: "Open Bugs",              format: "number",       alertAbove: 20,  href: "/vp-product/tech"           },
    { key: "deploy_frequency",     label: "Deploys / Week",         format: "number",       href: "/vp-product/deployments"                    },
    { key: "system_uptime_pct",    label: "System Uptime",          format: "percent",      alertBelow: 99,  href: "/vp-product/tech"           },
    { key: "api_error_rate",       label: "API Error Rate",         format: "percent",      alertAbove: 1,   href: "/vp-product/tech"           },
  ],

  finance: [
    { key: "total_revenue",        label: "Total Revenue",          format: "currency_ngn", href: "/finance/dashboard"                         },
    { key: "outstanding_invoices", label: "Outstanding Invoices",   format: "currency_ngn", alertAbove: 1000000, href: "/finance/invoices"     },
    { key: "payouts_this_month",   label: "Payouts (MTD)",          format: "currency_ngn", href: "/finance/payouts"                           },
    { key: "pending_payouts",      label: "Pending Payouts",        format: "currency_ngn", alertAbove: 500000, href: "/finance/payouts"       },
  ],

  marketing: [
    { key: "active_campaigns",     label: "Active Campaigns",       format: "number",       href: "/marketing/dashboard"                       },
    { key: "new_leads_mtd",        label: "New Leads (MTD)",        format: "number",       href: "/marketing/dashboard"                       },
    { key: "email_open_rate",      label: "Email Open Rate",        format: "percent",      warnBelow: 20,   href: "/marketing/dashboard"      },
    { key: "subscriber_count",     label: "Subscribers",            format: "number",       href: "/marketing/dashboard"                       },
  ],

  sales: [
    { key: "total_leads",          label: "Total Leads",            format: "number",       href: "/sales/dashboard"                           },
    { key: "deals_closed_mtd",     label: "Deals Closed (MTD)",     format: "number",       href: "/sales/dashboard"                           },
    { key: "win_rate",             label: "Win Rate",               format: "percent",      warnBelow: 20,   href: "/sales/dashboard"          },
  ],

  support: [
    { key: "open_support_tickets", label: "Open Tickets",           format: "number",       alertAbove: 30,  href: "/support/dashboard"         },
    { key: "avg_first_response_h", label: "Avg First Response",     format: "duration_h",   alertAbove: 4,   href: "/support/dashboard"         },
    { key: "avg_resolution_h",     label: "Avg Resolution",         format: "duration_h",   alertAbove: 48,  href: "/support/dashboard"         },
  ],

  hr: [
    { key: "hr_headcount",         label: "Headcount",              format: "number",       href: "/hr/dashboard"                              },
    { key: "on_leave_today",       label: "On Leave Today",         format: "number",       href: "/hr/dashboard"                              },
    { key: "pending_leave_requests", label: "Pending Leave",        format: "number",       alertAbove: 5,   href: "/hr/dashboard"              },
    { key: "open_positions",       label: "Open Positions",         format: "number",       href: "/hr/dashboard"                              },
  ],
};

/**
 * Returns the KPI definitions for a given role slug.
 * Falls back to an empty array for unknown roles.
 */
export function getKpisForRole(role: string): RoleKpiConfig {
  return KPI_BY_ROLE[role] ?? [];
}

export default KPI_BY_ROLE;
