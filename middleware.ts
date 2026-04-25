import { type NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/session"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Run on every request except static assets, images, and API routes that don't need auth.
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest.json|.*\\.svg).*)",
  ],
}
