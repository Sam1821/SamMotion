import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SamMotionApp } from "@/components/sammotion/app"
import { StoreProvider } from "@/lib/sammotion/store"
import "./sammotion.css"

export default async function Page() {
  // Server-side auth gate. The middleware also redirects anonymous users to /auth/login,
  // but we double-check here so a logged-in user always reaches the app cleanly.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <StoreProvider>
      <SamMotionApp />
    </StoreProvider>
  )
}
