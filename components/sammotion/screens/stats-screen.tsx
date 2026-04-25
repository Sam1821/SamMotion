"use client"

import { EX } from "@/lib/sammotion/data"
import { calcWeekStreak, fmtVol, getPRsToShow } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"

export function StatsScreen({ active }: { active: boolean }) {
  const { state } = useStore()
  const { streak, thisWeek } = calcWeekStreak(state)
  const real = state.history.filter((w) => !w.sample)

  const weekSess = real.filter((w) => Date.now() - new Date(w.date).getTime() < 7 * 86400000)
  const weekVol = weekSess.reduce((a, w) => a + (w.vol || 0), 0)
  const prevWeek = real.filter((w) => {
    const ms = Date.now() - new Date(w.date).getTime()
    return ms >= 7 * 86400000 && ms < 14 * 86400000
  })
  const prevVol = prevWeek.reduce((a, w) => a + (w.vol || 0), 0)
  const delta = prevVol ? Math.round(((weekVol - prevVol) / prevVol) * 100) : 0

  // Week chart
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const now = new Date()
  const dow = (now.getDay() + 6) % 7
  const weekData = Array(7).fill(0) as number[]
  real.forEach((w) => {
    const ms = Date.now() - new Date(w.date).getTime()
    if (ms < 7 * 86400000) {
      const d = new Date(w.date)
      const di = (d.getDay() + 6) % 7
      weekData[di] += w.vol || 0
    }
  })
  const max = Math.max(...weekData, 1)

  const prs = getPRsToShow(state)
  const prKeys = Object.keys(prs)

  return (
    <section className={`sm-scr ${active ? "on" : ""}`} aria-label="Stats">
      <div className="statsHdr">
        <div className="t10 w7 c2 upper mb8">Overview</div>
        <div className="t26 w9" style={{ letterSpacing: "-.5px" }}>
          Performance
        </div>
        <div className="t13 c2 mt4">Your training analytics</div>
      </div>

      {/* Streak card */}
      <div className="streakCard">
        <div className="row jb">
          <div>
            <div className="t10 w7 c2 upper mb6" style={{ letterSpacing: ".8px" }}>
              Weekly Streak
            </div>
            <div className="row g8 mt4">
              <span className="t32 w9 cg mono">{streak}</span>
              <span
                className="t13 c2 w5"
                style={{ alignSelf: "flex-end", marginBottom: 4 }}
              >
                weeks
              </span>
            </div>
            <div className="t11 c2 mt6">
              {streak
                ? `${streak} consecutive week${streak > 1 ? "s" : ""} with 3+ sessions`
                : "3 sessions/week required"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="liveDot" />
            <div className="t10 c2 mt6">This week: {thisWeek}/3</div>
            <div className="t10 c2 mt4">{real.length} total sessions</div>
          </div>
        </div>
      </div>

      {/* Volume chart */}
      <div className="sm-card mx mb10">
        <div className="row jb mb8">
          <div>
            <div className="t10 w7 c2 upper">Weekly Volume</div>
            <div className="t20 w9 mt4 mono co">
              {fmtVol(weekVol)} <span className="t11 c2 w5">kg</span>
            </div>
          </div>
          <span className="bdg bdg2">
            {prevVol ? (delta >= 0 ? "↑ " : "↓ ") + Math.abs(delta) + "%" : "New"}
          </span>
        </div>
        <div className="vchart">
          {weekData.map((v, i) => (
            <div key={i} className="vbarW">
              <div
                className={`vbar ${i === dow ? "today" : ""}`}
                style={{
                  height: `${Math.max(5, Math.round((v / max) * 100))}%`,
                  ...(v ? {} : { background: "var(--border)" }),
                }}
              />
            </div>
          ))}
        </div>
        <div className="row jb mt6">
          {days.map((d, i) => (
            <div
              key={d}
              className="t10"
              style={{
                color: i === dow ? "var(--orange)" : "var(--t3)",
                fontWeight: i === dow ? 700 : 500,
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Sessions grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: "0 16px",
          marginBottom: 16,
        }}
      >
        <div className="cardsm">
          <div className="t10 w7 c2 upper mb6">This Week</div>
          <div className="t26 w9 co mono">{weekSess.length}</div>
          <div className="t10 c2 mt4">sessions</div>
        </div>
        <div className="cardsm">
          <div className="t10 w7 c2 upper mb6">All Time</div>
          <div className="t26 w9 mono">{real.length}</div>
          <div className="t10 c2 mt4">sessions</div>
        </div>
      </div>

      {/* All PRs */}
      <div className="shdr">
        <span className="stitle">All Records</span>
        <span className="t11 c2">Personal Bests</span>
      </div>
      <div className="sm-card mx mb16">
        {prKeys.length ? (
          prKeys.map((k) => {
            const p = prs[k]
            const name = p.n || EX[k]?.n || k
            return (
              <div key={k} className="prRow">
                <div>
                  <div className="t15 w7">{name}</div>
                  <div className="t10 c2 mt4">{p.date || "—"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="t17 w9 co mono">
                    {p.w} <span className="t10 c2 w5">kg</span>
                  </div>
                  <div className="t10 c2 mt4">{p.r} reps</div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="t13 c2" style={{ textAlign: "center", padding: "8px 0" }}>
            No records yet — keep training!
          </div>
        )}
      </div>

      <div className="bspace" />
    </section>
  )
}
