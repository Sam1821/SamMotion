"use client"

import { useMemo, useState } from "react"
import { EX } from "@/lib/sammotion/data"
import {
  type ChartMetric,
  calcWeekStreak,
  fmtDate,
  fmtVol,
  getExerciseSeries,
  getPRsToShow,
} from "@/lib/sammotion/helpers"
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

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const dow = (new Date().getDay() + 6) % 7
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

  // ─── Per-exercise progression chart ───
  const exerciseOptions = useMemo(() => {
    const seen = new Set<string>()
    const out: Array<{ id: string; name: string }> = []
    for (const h of real) {
      if (!h.details) continue
      for (const ex of h.details) {
        if (seen.has(ex.id)) continue
        seen.add(ex.id)
        out.push({ id: ex.id, name: ex.n })
      }
    }
    if (out.length === 0) {
      Object.keys(prs).slice(0, 6).forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id)
          out.push({ id, name: prs[id].n || EX[id]?.n || id })
        }
      })
    }
    return out
  }, [real, prs])

  const [selectedExId, setSelectedExId] = useState<string>("")
  const [metric, setMetric] = useState<ChartMetric>("e1rm")
  const [rangeDays, setRangeDays] = useState<number | undefined>(90)

  const effectiveExId = selectedExId || exerciseOptions[0]?.id || ""
  const series = useMemo(
    () => effectiveExId ? getExerciseSeries(real, effectiveExId, metric, rangeDays) : [],
    [real, effectiveExId, metric, rangeDays]
  )

  return (
    <section className={`sm-scr ${active ? "on" : ""}`} aria-label="Stats">
      <div className="statsHdr">
        <div className="t10 w7 c2 upper mb8">Overview</div>
        <div className="t26 w9" style={{ letterSpacing: "-.5px" }}>
          Performance
        </div>
        <div className="t13 c2 mt4">Your training analytics</div>
      </div>

      <div className="streakCard">
        <div className="row jb">
          <div>
            <div className="t10 w7 c2 upper mb6" style={{ letterSpacing: ".8px" }}>
              Weekly Streak
            </div>
            <div className="row g8 mt4">
              <span className="t32 w9 cg mono">{streak}</span>
              <span className="t13 c2 w5" style={{ alignSelf: "flex-end", marginBottom: 4 }}>weeks</span>
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

      <div className="shdr">
        <span className="stitle">Exercise Progression</span>
      </div>
      <div className="sm-card mx mb12">
        {exerciseOptions.length === 0 ? (
          <div className="t11 c2" style={{ textAlign: "center", padding: 12 }}>
            Log a session with set details to see progression curves here.
          </div>
        ) : (
          <>
            <select
              className="inp"
              value={effectiveExId}
              onChange={(e) => setSelectedExId(e.target.value)}
              style={{ marginBottom: 8 }}
            >
              {exerciseOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>

            <div className="row g4 mb8" style={{ flexWrap: "wrap" }}>
              {([
                { k: "e1rm" as const, lbl: "e1RM" },
                { k: "weight" as const, lbl: "Top set" },
                { k: "volume" as const, lbl: "Volume" },
              ]).map((m) => (
                <button
                  key={m.k}
                  type="button"
                  className={`bdg ${metric === m.k ? "bdo" : ""}`}
                  onClick={() => setMetric(m.k)}
                >
                  {m.lbl}
                </button>
              ))}
              <span style={{ flex: 1 }} />
              {([
                { k: 30 as number | undefined, lbl: "30d" },
                { k: 90 as number | undefined, lbl: "90d" },
                { k: undefined as number | undefined, lbl: "All" },
              ]).map((r) => (
                <button
                  key={String(r.k)}
                  type="button"
                  className={`bdg ${rangeDays === r.k ? "bdo" : ""}`}
                  onClick={() => setRangeDays(r.k)}
                >
                  {r.lbl}
                </button>
              ))}
            </div>

            <ProgressionChart series={series} metric={metric} />

            {series.length === 0 ? (
              <div className="t11 c2" style={{ textAlign: "center", padding: 8 }}>
                No data in this range yet.
              </div>
            ) : (
              <div className="t10 c2 mt8" style={{ textAlign: "center" }}>
                {series.length} session{series.length === 1 ? "" : "s"} ·
                latest: <span className="co w7 mono">{series[series.length - 1].value}</span>
                {metric === "weight" || metric === "e1rm" ? " kg" : " kg·reps"}
              </div>
            )}
          </>
        )}
      </div>

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
            <div key={d} className="t10" style={{ color: i === dow ? "var(--orange)" : "var(--t3)", fontWeight: i === dow ? 700 : 500 }}>
              {d}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px", marginBottom: 16 }}>
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

      <div className="shdr">
        <span className="stitle">All Records</span>
        <span className="t11 c2">Tap a PR to graph it</span>
      </div>
      <div className="sm-card mx mb16">
        {prKeys.length ? (
          prKeys.map((k) => {
            const p = prs[k]
            const name = p.n || EX[k]?.n || k
            return (
              <div key={k} className="prRow" role="button" tabIndex={0} onClick={() => { setSelectedExId(k); setMetric("e1rm") }}>
                <div>
                  <div className="t15 w7">{name}</div>
                  <div className="t10 c2 mt4">{p.date || "—"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="t17 w9 co mono">
                    {p.w} <span className="t10 c2 w5">kg</span>
                  </div>
                  <div className="t10 c2 mt4">{p.r} reps · e1RM {p.e1rm || "—"}</div>
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

// ───────── Inline SVG line chart ─────────
function ProgressionChart({
  series,
  metric,
}: {
  series: { date: string; value: number }[]
  metric: ChartMetric
}) {
  const W = 320
  const H = 140
  const padX = 12
  const padY = 16

  if (series.length === 0) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="var(--border)" />
      </svg>
    )
  }

  const values = series.map((p) => p.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = Math.max(maxV - minV, 1)
  const innerW = W - padX * 2
  const innerH = H - padY * 2

  function xOf(i: number) {
    if (series.length === 1) return W / 2
    return padX + (i / (series.length - 1)) * innerW
  }
  function yOf(v: number) {
    return padY + innerH - ((v - minV) / range) * innerH
  }

  const path = series.map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(p.value)}`).join(" ")
  const last = series[series.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="var(--border)" />
      <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="var(--border)" />
      <text x={padX} y={padY - 2} fontSize={9} fill="var(--t3)">{maxV}</text>
      <text x={padX} y={H - padY + 10} fontSize={9} fill="var(--t3)">{minV}</text>
      <path d={path} fill="none" stroke="var(--orange)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {series.map((p, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(p.value)} r={i === series.length - 1 ? 4 : 2.5} fill={i === series.length - 1 ? "var(--orange)" : "var(--green)"} />
      ))}
      <text
        x={xOf(series.length - 1) - 6}
        y={yOf(last.value) - 6}
        fontSize={10}
        fontWeight="700"
        textAnchor="end"
        fill="var(--orange)"
      >
        {last.value}
        {metric === "weight" || metric === "e1rm" ? "kg" : ""}
      </text>
      <text x={padX} y={H - 2} fontSize={8} fill="var(--t3)">{fmtDate(series[0].date)}</text>
      <text x={W - padX} y={H - 2} fontSize={8} fill="var(--t3)" textAnchor="end">{fmtDate(last.date)}</text>
    </svg>
  )
}
