import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SamMotionApp } from "@/components/sammotion/app"
import { StoreProvider } from "@/lib/sammotion/store"
import "./sammotion.css"

// Force this page to be rendered at request time (not statically).
// The auth check needs cookies, which only exist per-request.
export const dynamic = "force-dynamic"

export default async function Page() {
  // Defensively try to read the user. If anything throws (bad env vars,
  // Supabase down, etc.) we still want to render the login redirect rather
  // than crash into a 404 / 500.
  let user: { id: string } | null = null
  try {
    const supabase = await createClient()
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (err) {
    console.error("[page] auth check failed:", err)
  }

  if (!user) redirect("/auth/login")

  return (
    <StoreProvider>
      <SamMotionApp />
    </StoreProvider>
  )
}
