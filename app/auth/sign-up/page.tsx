"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import "../auth.css"

export default function SignUpPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: { display_name: displayName || email.split("@")[0] },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="sm-auth-shell">
      <div className="sm-auth-card">
        <div className="sm-auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png?v=2" alt="XMotion" />
          <h1>XMOTION</h1>
          <p>Train smarter. Track everything.</p>
        </div>

        <form className="sm-auth-form" onSubmit={handleSignUp}>
          <h2>Create your account</h2>
          <p className="sub">Your routines, sessions, and PRs will sync across devices.</p>

          <div className="sm-auth-field">
            <label htmlFor="name">Display name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Sam"
            />
          </div>

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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="sm-auth-field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <div className="sm-auth-error">{error}</div>}

          <button type="submit" className="sm-auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          <div className="sm-auth-foot">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </div>
        </form>
      </div>
    </main>
  )
}
