import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

type CookieToSet = { name: string; value: string; options?: CookieOptions }

// Refresh the Supabase session and (if logged out) redirect to /auth/login.
// This wrapper NEVER throws — any error is logged to Vercel's function logs and the
// request is allowed through. The page-level guard in app/page.tsx still enforces auth.
export async function updateSession(request: NextRequest) {
  const passthrough = NextResponse.next({ request })

  // Skip auth/middleware work for paths that never need a Supabase session.
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".jpg")
  ) {
    return passthrough
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Missing env vars — let the request through; page-level guard will handle it.
  if (!url || !key) {
    console.error("[middleware] Missing Supabase env vars; allowing request through.")
    return passthrough
  }

  let supabaseResponse = passthrough

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = pathname.startsWith("/auth")

    // Anonymous + not on an auth page → redirect to login.
    if (!user && !isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/auth/login"
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (err) {
    // Defensive: never crash middleware. Log and let the request through.
    console.error("[middleware] updateSession failed:", err)
    return passthrough
  }
}
