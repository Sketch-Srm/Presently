import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignored
            }
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user?.email) {
      // Check if user exists in the database
      const { data: member } = await supabase
        .from('members')
        .select('role')
        .or(`email.ilike.${session.user.email},regular_email.ilike.${session.user.email}`)
        .single()

      if (!member) {
        // User not in the system
        return NextResponse.redirect(`${origin}/unregistered`)
      }

      // Route based on role
      if (member.role === 'super_admin' || member.role === 'club_admin') {
        return NextResponse.redirect(`${origin}/admin/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
