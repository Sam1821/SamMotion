"use client"

import { EX } from "@/lib/sammotion/data"
import { hasEq } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import { ModalSheet } from "./modal-sheet"

export function AddExerciseModal({
  open,
  onClose,
  replaceIndex,
}: {
  open: boolean
  onClose: () => void
  replaceIndex?: number | null  // if set, replace that slot instead of appending
}) {
  const { state, addExerciseToWorkout, replaceExercise } = useStore()
  const current = state.current

  if (!current) {
    return <ModalSheet open={open} onClose={onClose} />
  }

  const gym = state.gyms.find((g) => g.id === current.gymId) || state.gyms[0]
  // Show ALL exercises in the user's gym — not just the ones for the current routine.
  // This lets users add anything they want during a workout (e.g. extra accessories).
  const available = Object.keys(EX).filter((id) => hasEq(gym.eq, EX[id].req))
  const existingIds = new Set(
    current.exercises
      .map((e, i) => (i === replaceIndex ? null : e.id))
      .filter(Boolean) as string[]
  )

  const isReplace = typeof replaceIndex === "number" && replaceIndex >= 0

  function pick(id: string) {
    const ex = EX[id]
    if (!ex) return
    if (isReplace) {
      replaceExercise(replaceIndex as number, id)
    } else {
      addExerciseToWorkout(id)
    }
    onClose()
  }

  return (
    <ModalSheet open={open} onClose={onClose}>
      <div className="t17 w8 mb6">{isReplace ? "Replace Exercise" : "Add Exercise"}</div>
      <div className="t13 c2 mb16">
        {isReplace
          ? `Pick a replacement (${available.length} available in this gym)`
          : `Choose from ${available.length} exercises in this gym`}
      </div>
      <div>
        {available.map((id) => {
          const ex = EX[id]
          const isAdded = !isReplace && existingIds.has(id)
          return (
            <div
              key={id}
              className="exPickItem"
              role="button"
              tabIndex={0}
              onClick={() => !isAdded && pick(id)}
              style={isAdded ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
            >
              <div className="exPickDot" />
              <div className="col f1 g4">
                <span className="t13 w6">
                  {ex.n}
                  {isAdded ? <span className="t10 c3"> (added)</span> : null}
                </span>
                <span className="t10 c2">
                  {(ex.p || []).map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
                </span>
              </div>
              <span className="t11 c2">
                {ex.sets}×{ex.r}
                {ex.w ? ` · ${ex.w}kg` : ""}
              </span>
            </div>
          )
        })}
      </div>
    </ModalSheet>
  )
}
