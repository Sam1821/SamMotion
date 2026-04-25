"use client"

import { EX, ROUTINE_PRIORITY } from "@/lib/sammotion/data"
import { hasEq } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import { ModalSheet } from "./modal-sheet"

export function AddExerciseModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state, updateCurrent } = useStore()
  const current = state.current

  if (!current) {
    return <ModalSheet open={open} onClose={onClose} />
  }

  const gym = state.gyms.find((g) => g.id === current.gymId) || state.gyms[0]
  const available = (ROUTINE_PRIORITY[current.routineId] || []).filter(
    (id) => EX[id] && hasEq(gym.eq, EX[id].req),
  )
  const existingIds = new Set(current.exercises.map((e) => e.id))

  function addEx(id: string) {
    const ex = EX[id]
    if (!ex) return
    updateCurrent((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { id, ...ex }],
    }))
    onClose()
  }

  return (
    <ModalSheet open={open} onClose={onClose}>
      <div className="t17 w8 mb6">Add Exercise</div>
      <div className="t13 c2 mb16">Choose from your gym&apos;s available exercises</div>
      <div>
        {available.map((id) => {
          const ex = EX[id]
          const isAdded = existingIds.has(id)
          return (
            <div
              key={id}
              className="exPickItem"
              role="button"
              tabIndex={0}
              onClick={() => !isAdded && addEx(id)}
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
