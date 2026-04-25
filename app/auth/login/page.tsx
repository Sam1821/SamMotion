"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import "../auth.css"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="sm-auth-shell">
      <div className="sm-auth-card">
        <div className="sm-auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="SamMotion" />
          <h1>SAMMOTION</h1>
          <p>Premium Fitness &amp; Workout Tracker</p>
        </div>

        <form className="sm-auth-form" onSubmit={handleLogin}>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to access your routines, gyms, and stats.</p>

          <div className="sm-auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="sm-auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="sm-auth-error">{error}</div>}

          <button type="submit" className="sm-auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="sm-auth-foot">
            New here? <Link href="/auth/sign-up">Create an account</Link>
          </div>
        </form>
      </div>
    </main>
  )
}
