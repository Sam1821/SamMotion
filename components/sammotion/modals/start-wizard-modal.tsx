"use client"

import { useEffect, useState } from "react"
import { ROUTINES } from "@/lib/sammotion/data"
import { getExsForWorkout, getNextRoutine } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import type { RoutineId } from "@/lib/sammotion/types"
import { ModalSheet } from "./modal-sheet"

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
  const [step, setStep] = useState<1 | 2>(1)
  const [gymId, setGymId] = useState<string>(state.activeGymId)
  const [routineId, setRoutineId] = useState<RoutineId>("sl")

  useEffect(() => {
    if (open) {
      setStep(1)
      setGymId(state.activeGymId)
      setRoutineId(getNextRoutine(state))
    }
  }, [open, state])

  const routineEmoji: Record<RoutineId, string> = { sl: "🦵", ct: "💪", bb: "🏋️" }
  const suggested = getNextRoutine(state)

  function confirm() {
    if (!gymId || !routineId) return
    const exs = getExsForWorkout(state, gymId, routineId)
    startWorkout({
      gymId,
      routineId,
      startTime: Date.now(),
      exercises: exs,
      sets: {},
    })
    onClose()
    onStarted()
  }

  return (
    <ModalSheet open={open} onClose={onClose}>
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
          <button type="button" className="btnP" onClick={() => setStep(2)}>
            Continue →
          </button>
        </div>
      ) : (
        <div>
          <div className="t17 w8 mb6">Choose Muscle Day</div>
          <div className="t13 c2 mb16">What are you training today?</div>
          <div>
            {ROUTINES.map((r) => {
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
                  <div className="wBox" style={{ fontSize: 16 }}>
                    {routineEmoji[r.id]}
                  </div>
                  <div className="col f1 g4">
                    <div className="row g8">
                      <span className="t15 w7">{r.name}</span>
                      {r.id === suggested ? <span className="bdg bdg2">Suggested</span> : null}
                    </div>
                    <span className="t11 c2">{exs.length} exercises available</span>
                  </div>
                </div>
              )
            })}
          </div>
          <button type="button" className="btnP" onClick={confirm}>
            Start →
          </button>
        </div>
      )}
    </ModalSheet>
  )
}
