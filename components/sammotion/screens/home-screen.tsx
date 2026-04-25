"use client"

import { ROUTINES, EX } from "@/lib/sammotion/data"
import {
  calcWeekStreak,
  daysSince,
  fmtVol,
  getActiveGym,
  getExsForWorkout,
  getHistoryToShow,
  getNextRoutine,
  getPRsToShow,
} from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import { HistoryCard } from "../history-card"
import type { TabKey } from "../tab-bar"

export function HomeScreen({
  active,
  onNavigate,
  onStartWorkout,
}: {
  active: boolean
  onNavigate: (t: TabKey) => void
  onStartWorkout: () => void
}) {
  const { state } = useStore()
  const gym = getActiveGym(state)
  const nextRId = getNextRoutine(state)
  const nextR = ROUTINES.find((r) => r.id === nextRId) || ROUTINES[0]
  const exs = getExsForWorkout(state, gym.id, nextRId)
  const minutes = Math.round(exs.reduce((a, e) => a + e.sets, 0) * 2.5)

  const hist = getHistoryToShow(state)
  const sortedHist = [...hist].sort((a, b) => b.date.localeCompare(a.date))
  const lastSession = sortedHist[0]

  const { streak, thisWeek } = calcWeekStreak(state)
  const real = state.history.filter((w) => !w.sample)
  const weekVol = real
    .filter((w) => Date.now() - new Date(w.date).getTime() < 7 * 86400000)
    .reduce((a, w) => a + (w.vol || 0), 0)

  const prs = getPRsToShow(state)
  const prKeys = Object.keys(prs).slice(0, 3)
  const previewHistory = sortedHist.slice(0, 2)

  return (
    <section className={`sm-scr ${active ? "on" : ""}`} id="s-home" aria-label="Home">
      <header className="sm-brand-bar">
        <span className="sm-brand-mark" aria-label="SamMotion">
          SAMMOTION
        </span>
      </header>

      {/* Gym pill */}
      <div className="gymPill" role="button" tabIndex={0} onClick={() => onNavigate("gym")}>
        <div className="gymDot">
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orange)"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div className="col f1">
          <span className="t10 w6 c3 upper">Current Gym</span>
          <span className="t13 w7">{gym.name}</span>
        </div>
        <span className="bdg bdo">Active</span>
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2.5}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* Next workout card */}
      <div className="nextCard">
        <div className="row jb mb12">
          <div>
            <div className="t10 w7 c2 upper mb8" style={{ letterSpacing: ".9px" }}>
              Next Workout
            </div>
            <div className="t20 w9" style={{ letterSpacing: "-.4px" }}>
              {nextR.name}
            </div>
            <div className="t13 c2 mt4">
              {exs.length} exercises · ~{minutes} min
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="t10 c2">Last session</div>
            <div className="t13 w7 co mt4">{lastSession ? daysSince(lastSession.date) : "—"}</div>
          </div>
        </div>
        <div className="row g6 mb16">
          {nextR.tags.map((t) => (
            <span key={t} className="bdg bdo">
              {t}
            </span>
          ))}
        </div>
        <button type="button" className="btnP" onClick={onStartWorkout}>
          Start Workout →
        </button>
      </div>

      {/* Performance preview */}
      <div className="shdr mt8">
        <span className="stitle">Performance</span>
        <button type="button" className="slink" onClick={() => onNavigate("stats")}>
          Details →
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: "0 16px",
          marginBottom: 12,
        }}
      >
        <div className="cardsm" style={{ cursor: "pointer" }} onClick={() => onNavigate("stats")}>
          <div className="t10 w7 c2 upper mb6">Week Volume</div>
          <div className="t20 w9 co mono">{weekVol ? fmtVol(weekVol) : "—"}</div>
          <div className="t10 c2 mt4">kg this week</div>
        </div>
        <div className="cardsm" style={{ cursor: "pointer" }} onClick={() => onNavigate("stats")}>
          <div className="t10 w7 c2 upper mb6">Streak</div>
          <div className="t20 w9 cg mono">{streak || "—"}</div>
          <div className="t10 c2 mt4">
            {streak ? `wk streak · ${thisWeek}/3 this week` : `${thisWeek}/3 sessions this week`}
          </div>
        </div>
      </div>

      {/* Recent PRs preview */}
      <div className="shdr">
        <span className="stitle">Recent PRs</span>
        <button type="button" className="slink" onClick={() => onNavigate("stats")}>
          All Records →
        </button>
      </div>
      <div className="sm-card mx mb12">
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
                </div>
              </div>
            )
          })
        ) : (
          <div className="t13 c2" style={{ textAlign: "center", padding: "8px 0" }}>
            No PRs yet — start training!
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="shdr">
        <span className="stitle">Recent Sessions</span>
        <button type="button" className="slink" onClick={() => onNavigate("log")}>
          See All →
        </button>
      </div>
      <div>
        {previewHistory.length ? (
          previewHistory.map((w) => <HistoryCard key={w.id} w={w} />)
        ) : (
          <div className="t13 c2" style={{ textAlign: "center", padding: 16 }}>
            No sessions logged yet.
          </div>
        )}
      </div>
      <div className="bspace" />
    </section>
  )
}
