import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_ROLES = ['domain_lead', 'club_admin', 'super_admin']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login')
  const isAdminRoute = pathname.startsWith('/admin')
  const isMemberRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/sessions') ||
    pathname.startsWith('/profile')

  // 1. Unauthenticated → redirect to login for any protected route
  if (!user && (isAdminRoute || isMemberRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Authenticated user trying to hit /login → send them home
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 3. Role check for /admin routes — regular members must not get in
  if (user && isAdminRoute) {
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .or(`email.ilike.${user.email},regular_email.ilike.${user.email}`)
      .single()

    if (!member || !ADMIN_ROLES.includes(member.role)) {
      // Logged in but not an admin/lead — kick to member dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
