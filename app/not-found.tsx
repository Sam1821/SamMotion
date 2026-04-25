import Link from "next/link"

// Catches any unmatched route AND any place Next would otherwise show
// the framework's default 404. Without this file, Vercel sometimes serves
// its own generic 404 page instead of letting our app handle it.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#070707",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 900, color: "#FF6B2B", letterSpacing: -2 }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Page not found</div>
      <Link
        href="/"
        style={{
          marginTop: 24,
          padding: "10px 18px",
          background: "#FF6B2B",
          color: "#0a0a0a",
          fontWeight: 700,
          borderRadius: 999,
          textDecoration: "none",
        }}
      >
        Go home
      </Link>
    </main>
  )
}
