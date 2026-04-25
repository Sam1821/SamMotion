"use client"

import type { HistoryEntry } from "@/lib/sammotion/types"
import { fmtDate, fmtDay, fmtDur, fmtVol } from "@/lib/sammotion/helpers"

export function HistoryCard({ w, variant = "home" }: { w: HistoryEntry; variant?: "home" | "log" }) {
  const chips = (w.exs || []).slice(0, 3)
  const extraCount = (w.exs || []).length - 3
  const className = variant === "home" ? "histItem" : `logEntry ${w.sample ? "sample" : ""}`

  return (
    <div className={className} role="button" tabIndex={0}>
      <div className="row jb">
        <div>
          <div className="t15 w7">
            {w.routine || "Workout"}
            {w.sample ? <span className="t10 c3"> (sample)</span> : null}
          </div>
          <div className="t11 c2 mt4">
            {fmtDate(w.date)} · {fmtDay(w.date)} · {fmtDur(w.dur || 0)} · {fmtVol(w.vol || 0)}kg
          </div>
        </div>
        <div className="row g8">
          {w.prsCount ? <span className="bdg bdg2">+{w.prsCount} PR</span> : null}
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2.5}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
      <div className="chips">
        {chips.map((e, i) => (
          <div key={i} className="chip">
            {e}
          </div>
        ))}
        {extraCount > 0 ? <div className="chip">+{extraCount} more</div> : null}
      </div>
    </div>
  )
}
