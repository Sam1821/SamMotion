"use client"

import { useState } from "react"
import { getHistoryToShow } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import { HistoryCard } from "../history-card"
import { SessionDetailModal } from "../modals/session-detail-modal"

export function LogScreen({ active }: { active: boolean }) {
  const { state } = useStore()
  const hist = getHistoryToShow(state)
  const sorted = [...hist].sort((a, b) => b.date.localeCompare(a.date))
  const realCount = state.history.filter((w) => !w.sample).length

  const [openSessionId, setOpenSessionId] = useState<string | null>(null)

  return (
    <section className={`sm-scr ${active ? "on" : ""}`} aria-label="Log">
      <div className="logHdrSec">
        <div className="t10 w7 c2 upper mb8">All Sessions</div>
        <div className="t26 w9" style={{ letterSpacing: "-.5px" }}>
          Workout Log
        </div>
        <div className="t13 c2 mt4">{realCount} sessions recorded</div>
      </div>

      {state.isFirstTime ? (
        <div className="sampleBanner">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="t11 c2">
            Showing <span className="co w6">sample data</span> — log your first workout to see real sessions here.
          </span>
        </div>
      ) : null}

      <div>
        {sorted.length ? (
          sorted.map((w) => (
            <div key={w.id} onClick={() => setOpenSessionId(w.id)} style={{ cursor: "pointer" }}>
              <HistoryCard w={w} variant="log" />
            </div>
          ))
        ) : (
          <div className="t13 c2" style={{ textAlign: "center", padding: 32 }}>
            No workouts logged yet.
          </div>
        )}
      </div>
      <div className="bspace" />

      <SessionDetailModal
        open={openSessionId !== null}
        onClose={() => setOpenSessionId(null)}
        sessionId={openSessionId}
      />
    </section>
  )
}
