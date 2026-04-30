"use client"

import { useEffect, useState } from "react"
import { ROUTINES } from "@/lib/sammotion/data"
import { fmtVol } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import { ModalSheet } from "./modal-sheet"

export interface FinishSummary {
  dur: number
  vol: number
  prsCount: number
  newPRs: Record<string, { n?: string; w: number; r: number; date: string; e1rm: number }>
}

export function FinishWorkoutModal({
  open,
  onClose,
  summary,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  summary: FinishSummary | null
  onSaved: () => void
}) {
  const { state, finishWorkout, saveCurrentAsRoutine } = useStore()
  const current = state.current

  const defaultName = current
    ? current.customName || ROUTINES.find((r) => r.id === current.routineId)?.name || "Workout"
    : "Workout"

  const [saveAsRoutine, setSaveAsRoutine] = useState(false)
  const [routineName, setRoutineName] = useState(defaultName)

  // Reset the form whenever the modal opens for a new session.
  useEffect(() => {
    if (open) {
      setSaveAsRoutine(false)
      setRoutineName(defaultName)
    }
  }, [open, defaultName])

  function save() {
    if (!summary) return
    if (saveAsRoutine && routineName.trim()) {
      saveCurrentAsRoutine(routineName.trim())
    }
    finishWorkout(summary)
    onSaved()
  }

  const mm = summary ? String(Math.floor(summary.dur / 60)).padStart(2, "0") : "0:00"
  const ss = summary ? String(summary.dur % 60).padStart(2, "0") : ""
  const time = summary ? `${mm}:${ss}` : "0:00"

  return (
    <ModalSheet open={open} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44, lineHeight: 1 }}>🏆</div>
        <div className="t20 w9 mt8" style={{ letterSpacing: "-.4px" }}>
          Great Session!
        </div>
        <div className="t13 c2 mt4">{defaultName} complete</div>
      </div>
      <div className="finGrid">
        <div className="finStat">
          <div className="t17 w9 co mono">{time}</div>
          <div className="t10 c2 mt4">Duration</div>
        </div>
        <div className="finStat">
          <div className="t17 w9 co mono">{summary ? fmtVol(summary.vol) : "0"}</div>
          <div className="t10 c2 mt4">Volume kg</div>
        </div>
        <div className="finStat">
          <div className="t17 w9 cg mono">{summary ? summary.prsCount : 0}</div>
          <div className="t10 c2 mt4">New PRs</div>
        </div>
      </div>

      <label className="row g8" style={{ marginBottom: 12, cursor: "pointer", padding: "10px 12px", background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <input
          type="checkbox"
          checked={saveAsRoutine}
          onChange={(e) => setSaveAsRoutine(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <span className="t13 w6 f1">Save as new routine for next time</span>
      </label>

      {saveAsRoutine ? (
        <input
          className="inp mb12"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Routine name"
          maxLength={40}
        />
      ) : null}

      <button type="button" className="btnP" onClick={save}>
        Save &amp; Continue
      </button>
    </ModalSheet>
  )
}
