// DB1: Role-based route protection — runs via middleware.ts → proxy.ts.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { STAFF_PREFIXES, getAllowedPrefixesForRole, getDashboardPathForRole } from './lib/auth/role-routing'
import { parseAuthSessionState } from './lib/auth/session'

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
  return getDashboardPathForRole(role)
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
    // Only preserve the `from` param for real app routes, not browser/tool probe paths
    const isAppPath = !pathname.startsWith('/.well-known') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')
    if (isAppPath) url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  const home = defaultDashboard(role)

  // Patient/user role: non-staff users can only access patient paths (no staff prefixes)
  // 'user' is an alias for 'patient' (same home: /dashboard) — must be caught here
  // to prevent an infinite redirect loop (home = /dashboard, which is itself a patient path).
  const PATIENT_ROLES = ['patient', 'user']
  if (allRoles.every(r => PATIENT_ROLES.includes(r))) {
    const isStaffPath = STAFF_PREFIXES.some((p) => pathname.startsWith(p))
    if (isStaffPath) {
      return NextResponse.redirect(new URL(home, req.url))
    }
    return NextResponse.next()
  }

  const isRestrictedStaffPath = STAFF_PREFIXES.some((p) => pathname.startsWith(p))

  if (isRestrictedStaffPath) {
    // Check if current path is allowed by ANY of the user's roles
    const isAllowedByAnyRole = allRoles.some((r) => {
      const allowedPrefixes = getAllowedPrefixesForRole(r)
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
      const isPatientPath = !STAFF_PREFIXES.some((p) => pathname.startsWith(p))
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
