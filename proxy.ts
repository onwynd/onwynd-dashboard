// DB1: Role-based route protection — runs via middleware.ts → proxy.ts.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_DASHBOARD_PATHS } from './lib/auth/role-routing'
import { parseAuthSessionState } from './lib/auth/session'

// ── Role → home dashboard ──────────────────────────────────────────────────
const ROLE_HOME: Record<string, string> = {
  // Platform control tower
  super_admin:          '/admin/dashboard',
  admin:                '/admin/dashboard',
  founder:              '/admin/dashboard',
  // Oversight tier
  president:            '/president/dashboard',
  // C-Suite
  ceo:                  '/ceo/dashboard',
  coo:                  '/coo/dashboard',
  cgo:                  ROLE_DASHBOARD_PATHS.cgo,
  cfo:                  '/cfo/dashboard',
  // Audit
  audit:                '/audit/dashboard',
  // VP tier
  vp_sales:             '/vp-sales/dashboard',
  vp_marketing:         '/vp-marketing/dashboard',
  vp_operations:        '/vp-ops/dashboard',
  vp_product:           '/vp-product/dashboard',
  // Clinical
  therapist:            '/therapist/dashboard',
  clinical_advisor:     '/clinical/dashboard',
  // Operations
  secretary:            '/secretary/dashboard',
  finance:              '/finance/dashboard',
  hr:                   '/hr/dashboard',
  manager:              '/manager/dashboard',
  employee:             '/employee/dashboard',
  support:              '/support/dashboard',
  // Sales
  sales:                '/sales/dashboard',
  finder:               '/sales/dashboard',
  closer:               '/sales/closer',
  relationship_manager: '/sales/dashboard',
  builder:              '/sales/dashboard', // sales-support role (mirrors login.tsx)
  // Tech & Product
  tech:                 '/tech/dashboard',
  tech_team:            '/tech/dashboard',
  product_manager:      '/product-manager/dashboard',
  product:              '/product-manager/dashboard',
  // Marketing & Growth
  marketing:            '/marketing/dashboard',
  ambassador:           '/ambassador/dashboard',
  // Legal & Compliance
  legal_advisor:        '/legal/dashboard',
  compliance:           '/compliance/dashboard',
  // Miscellaneous roles from RoleSeeder — no staff portal, send to /dashboard
  customer:             '/dashboard',
  data_entry:           '/admin/dashboard', // treated as limited admin support
  investor:             '/dashboard',
  // External
  institutional:        '/institutional/dashboard',
  institution_admin:    '/institutional/dashboard',
  university_admin:     ROLE_DASHBOARD_PATHS.university_admin,
  ngo_admin:            '/ngo/dashboard',
  partner:              '/partner/dashboard',
  center:               '/center/dashboard',
  // Health
  health_personnel:     '/health-personnel/dashboard',
  // Patient / user (non-staff)
  patient:              '/dashboard',
  user:                 '/dashboard',
}

// ── Role → allowed path prefixes ──────────────────────────────────────────
// Super-admin roles: access every staff prefix
const ALL_STAFF_PREFIXES_STATIC = [
  '/admin/', '/president/', '/ceo/', '/coo/', '/cgo/', '/cfo/', '/audit/',
  '/vp-sales/', '/vp-marketing/', '/vp-ops/', '/vp-product/',
  '/therapist/', '/secretary/', '/finance/', '/sales/', '/tech/',
  '/manager/', '/marketing/', '/product-manager/', '/product/', '/legal/',
  '/hr/', '/clinical/', '/ambassador/', '/institutional/', '/university/', '/ngo/', '/partner/',
  '/health-personnel/', '/compliance/', '/employee/', '/support/', '/center/',
]

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  // Platform-level: full access to all staff prefixes
  super_admin:          ALL_STAFF_PREFIXES_STATIC,
  founder:              ALL_STAFF_PREFIXES_STATIC,

  // Control tower: strictly isolated — admin UI only
  admin:                ['/admin/'],

  // Oversight tier: own portal only (reads data via API, not UI cross-access)
  president:            ['/president/'],

  // C-Suite: each role's own portal only (strict isolation)
  ceo:                  ['/ceo/'],
  coo:                  ['/coo/'],
  cgo:                  ['/cgo/'],
  cfo:                  ['/cfo/'],

  // Audit: own portal only
  audit:                ['/audit/'],

  // VP tier: own portal + their department's paths
  vp_sales:             ['/vp-sales/', '/sales/'],
  vp_marketing:         ['/vp-marketing/', '/marketing/'],
  vp_operations:        ['/vp-ops/'],
  vp_product:           ['/vp-product/', '/product-manager/', '/product/'],

  // Clinical
  therapist:            ['/therapist/'],
  clinical_advisor:     ['/clinical/'],

  // Operations
  secretary:            ['/secretary/'],
  finance:              ['/finance/'],
  hr:                   ['/hr/'],
  manager:              ['/manager/'],
  employee:             ['/employee/'],
  support:              ['/support/'],

  // Sales — closer is restricted to /sales/ and /sales/closer only
  sales:                ['/sales/'],
  finder:               ['/sales/'],
  closer:               ['/sales/'],
  relationship_manager: ['/sales/'],
  builder:              ['/sales/'],

  // Tech & Product
  tech:                 ['/tech/'],
  tech_team:            ['/tech/'],
  product_manager:      ['/product-manager/', '/product/'],
  product:              ['/product-manager/', '/product/'],

  // Marketing & Growth
  marketing:            ['/marketing/'],
  ambassador:           ['/ambassador/'],

  // Legal & Compliance
  legal_advisor:        ['/legal/'],
  compliance:           ['/compliance/'],
  // Misc roles from seeder — limited access
  data_entry:           ['/admin/'],

  // External Partners / Institutional
  institutional:        ['/institutional/'],
  institution_admin:    ['/institutional/'],
  university_admin:     ['/university/'],
  ngo_admin:            ['/ngo/'],
  partner:              ['/partner/'],
  center:               ['/center/'],

  // Health
  health_personnel:     ['/health-personnel/'],
}

// All staff path prefixes — used to identify paths requiring staff roles
const ALL_STAFF_PREFIXES = ALL_STAFF_PREFIXES_STATIC

// Paths always public (no auth required)
const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/sso',
  '/auth/exchange',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/about',
  '/contact',
  '/editorial',
  '/therapist-booking',
  '/therapist-signup',
  '/institutional-signup',
]

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/favicon')) return true
  if (pathname.startsWith('/api')) return true
  if (pathname.startsWith('/sanctum')) return true
  if (pathname.startsWith('/images/')) return true
  if (pathname === '/firebase-messaging-sw.js') return true
  if (pathname === '/manifest.json') return true
  if (/\.(?:ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|otf|css|js|map)$/.test(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return false
}

function defaultDashboard(role: string | undefined): string {
  return ROLE_HOME[role ?? ''] ?? '/login'
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('auth_token')?.value
  const authState = parseAuthSessionState(req.cookies.get('auth_state')?.value)
  const role = authState?.primaryRole
  const allRoles = authState?.allRoles ?? []

  // Always pass through static / public assets
  if (isPublicPath(pathname)) {
    // Redirect logged-in users away from auth pages — only when session is intact
    if (token && allRoles.length > 0 && (pathname === '/login' || pathname === '/register' || pathname === '/sso')) {
      const dest = defaultDashboard(role)
      if (dest !== '/login') {
        const url = req.nextUrl.clone()
        url.pathname = dest
        return NextResponse.redirect(url)
      }
    }
    return NextResponse.next()
  }

  // No token → send to login
  if (!token || allRoles.length === 0) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  const home = defaultDashboard(role)

  // Patient/user role: non-staff users can only access patient paths (no staff prefixes)
  // 'user' is an alias for 'patient' (same home: /dashboard) — must be caught here
  // to prevent an infinite redirect loop (home = /dashboard, which is itself a patient path).
  const PATIENT_ROLES = ['patient', 'user']
  if (allRoles.every(r => PATIENT_ROLES.includes(r))) {
    const isStaffPath = ALL_STAFF_PREFIXES.some((p) => pathname.startsWith(p))
    if (isStaffPath) {
      return NextResponse.redirect(new URL(home, req.url))
    }
    return NextResponse.next()
  }

  const isRestrictedStaffPath = ALL_STAFF_PREFIXES.some((p) => pathname.startsWith(p))

  if (isRestrictedStaffPath) {
    // Check if current path is allowed by ANY of the user's roles
    const isAllowedByAnyRole = allRoles.some((r) => {
      const allowedPrefixes = ROLE_ALLOWED_PREFIXES[r]
      return allowedPrefixes?.some((p) => pathname.startsWith(p))
    })

    if (!isAllowedByAnyRole) {
      return NextResponse.redirect(new URL(home, req.url))
    }
  }

  // Staff accessing a patient path → redirect to their home
  if (!isRestrictedStaffPath && pathname !== '/') {
    const SHARED_PATHS = ['/settings', '/notifications', '/profile']
    const isShared = SHARED_PATHS.some((p) => pathname.startsWith(p))
    if (!isShared) {
      const isPatientPath = !ALL_STAFF_PREFIXES.some((p) => pathname.startsWith(p))
      if (isPatientPath) {
        const homeUrl = new URL(home, req.url)
        if (homeUrl.pathname !== pathname) {
          return NextResponse.redirect(homeUrl)
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
