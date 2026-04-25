import Link from "next/link"
import "../auth.css"

export default function AuthErrorPage() {
  return (
    <main className="sm-auth-shell">
      <div className="sm-auth-card">
        <div className="sm-auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png?v=2" alt="SamMotion" />
          <h1>SAMMOTION</h1>
        </div>

        <div className="sm-auth-error">Something went wrong while signing you in. Please try again.</div>

        <div className="sm-auth-foot">
          <Link href="/auth/login">Back to sign in</Link>
        </div>
      </div>
    </main>
  )
}
