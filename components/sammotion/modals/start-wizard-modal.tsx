"use client"

import { useEffect, useState } from "react"
import { ROUTINES, SPLITS } from "@/lib/sammotion/data"
import { getExsForWorkout, getNextRoutine } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import type { RoutineId } from "@/lib/sammotion/types"
import { ModalSheet } from "./modal-sheet"

type Step = 1 | 2 | 3

export function StartWizardModal({
  open,
  onClose,
  onStarted,
}: {
  open: boolean
  onClose: () => void
  onStarted: () => void
}) {
  const { state, startWorkout } = useStore()
  const [step, setStep] = useState<Step>(1)
  const [gymId, setGymId] = useState<string>(state.activeGymId)
  const [splitId, setSplitId] = useState<string>(SPLITS[0].id)
  const [routineId, setRoutineId] = useState<RoutineId>("sl")

  useEffect(() => {
    if (open) {
      setStep(1)
      setGymId(state.activeGymId)
      const suggested = getNextRoutine(state)
      const defaultSplit = SPLITS.find((s) => s.routineIds.includes(suggested)) || SPLITS[0]
      setSplitId(defaultSplit.id)
      setRoutineId(suggested)
    }
  }, [open, state])

  const split = SPLITS.find((s) => s.id === splitId) || SPLITS[0]
  const customAvailable = state.customRoutines.length > 0

  const visibleRoutines = (() => {
    if (splitId === "custom") return state.customRoutines
    return split.routineIds.map((id) => ROUTINES.find((r) => r.id === id)).filter(Boolean) as typeof ROUTINES
  })()

  function confirm() {
    if (!gymId || !routineId) return
    const exs = getExsForWorkout(state, gymId, routineId)
    if (exs.length === 0) return
    startWorkout({
      gymId,
      routineId,
      splitId,
      startTime: Date.now(),
      exercises: exs,
      sets: {},
    })
    onClose()
    onStarted()
  }

  return (
    <ModalSheet open={open} onClose={onClose}>
      <StepIndicator step={step} />

      {step === 1 ? (
        <div>
          <div className="t17 w8 mb6">Choose Gym</div>
          <div className="t13 c2 mb16">Where are you training today?</div>
          <div>
            {state.gyms.map((g) => (
              <div
                key={g.id}
                className={`wPick ${g.id === gymId ? "sel" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => setGymId(g.id)}
              >
                <div className="wBox">{g.emoji}</div>
                <div className="col f1 g4">
                  <span className="t15 w7">{g.name}</span>
                  <span className="t11 c2">{g.eq.length} equipment items</span>
                </div>
                {g.id === state.activeGymId ? <span className="bdg bdo">Last used</span> : null}
              </div>
            ))}
          </div>
          <button type="button" className="btnP" onClick={() => setStep(2)}>Continue →</button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <div className="t17 w8 mb6">Choose Program</div>
          <div className="t13 c2 mb16">Pick a training split for today.</div>
          <div className="col g8 mb16">
            {SPLITS.map((s) => (
              <div
                key={s.id}
                className={`wPick ${s.id === splitId ? "sel" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSplitId(s.id)
                  setRoutineId(s.routineIds[0])
                }}
              >
                <div className="col f1 g4">
                  <div className="row g8">
                    <span className="t15 w7">{s.name}</span>
                    <span className="bdg bdg2">{s.daysPerWeek}×/wk</span>
                  </div>
                  <span className="t11 c2">{s.desc}</span>
                </div>
              </div>
            ))}
            {customAvailable ? (
              <div
                className={`wPick ${splitId === "custom" ? "sel" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSplitId("custom")
                  setRoutineId(state.customRoutines[0].id)
                }}
              >
                <div className="col f1 g4">
                  <div className="row g8">
                    <span className="t15 w7">My Custom Routines</span>
                    <span className="bdg bdo">{state.customRoutines.length}</span>
                  </div>
                  <span className="t11 c2">Routines you&apos;ve created.</span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="row g8">
            <button type="button" className="bdg" onClick={() => setStep(1)}>← Back</button>
            <button type="button" className="btnP f1" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <div className="t17 w8 mb6">Choose Day</div>
          <div className="t13 c2 mb16">Which session inside <span className="co w6">{splitId === "custom" ? "Custom" : split.name}</span>?</div>
          <div className="col g8 mb16">
            {visibleRoutines.length === 0 ? (
              <div className="t11 c2" style={{ textAlign: "center", padding: 12 }}>No routines available.</div>
            ) : (
              visibleRoutines.map((r) => {
                const exs = getExsForWorkout(state, gymId, r.id)
                const sel = r.id === routineId
                return (
                  <div
                    key={r.id}
                    className={`wPick ${sel ? "sel" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setRoutineId(r.id)}
                  >
                    <div className="col f1 g4">
                      <span className="t15 w7">{r.name}</span>
                      <span className="t11 c2">
                        {exs.length} exercise{exs.length === 1 ? "" : "s"} · {(r.tags || []).slice(0, 3).join(" · ")}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="row g8">
            <button type="button" className="bdg" onClick={() => setStep(2)}>← Back</button>
            <button type="button" className="btnP f1" onClick={confirm}>Start →</button>
          </div>
        </div>
      ) : null}
    </ModalSheet>
  )
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="row g4 jc mb16">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            width: 24, height: 4, borderRadius: 2,
            background: n <= step ? "var(--orange)" : "var(--border2)",
            transition: "background 200ms",
          }}
        />
      ))}
    </div>
  )
}
