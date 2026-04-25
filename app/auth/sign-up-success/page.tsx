import Link from "next/link"
import "../auth.css"

export default function SignUpSuccessPage() {
  return (
    <main className="sm-auth-shell">
      <div className="sm-auth-card">
        <div className="sm-auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png?v=2" alt="SamMotion" />
          <h1>SAMMOTION</h1>
        </div>

        <div className="sm-auth-success">
          <strong>Check your inbox.</strong>
          <br />
          We sent you a confirmation link. Tap it to verify your email and start training.
        </div>

        <div className="sm-auth-foot">
          <Link href="/auth/login">Back to sign in</Link>
        </div>
      </div>
    </main>
  )
}
