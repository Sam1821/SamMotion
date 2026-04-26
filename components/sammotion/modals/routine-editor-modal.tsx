"use client"

import { useEffect, useState } from "react"
import { EX, ROUTINES } from "@/lib/sammotion/data"
import { useStore } from "@/lib/sammotion/store"
import type { Routine } from "@/lib/sammotion/types"
import { ModalSheet } from "./modal-sheet"

type Mode = "list" | "edit" | "picker"

// Single ModalSheet at the top — content swaps based on `mode`. Previous version
// returned a different ModalSheet per mode, which made the sheet unmount + remount
// on every transition (visible flicker / "the modal jumps to the top" bug).
export function RoutineEditorModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state, addCustomRoutine, updateCustomRoutine, deleteCustomRoutine, setActiveRoutine } = useStore()
  const [mode, setMode] = useState<Mode>("list")
  const [editing, setEditing] = useState<Routine | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode("list")
      setEditing(null)
      setConfirmDelete(null)
    }
  }, [open])

  return (
    <ModalSheet open={open} onClose={onClose}>
      {mode === "list" ? (
        <ListView
          state={state}
          onDuplicate={(r) => {
            setEditing({ ...r, id: "r_" + Date.now(), isCustom: true, name: r.name + " (copy)" })
            setMode("edit")
          }}
          onEdit={(r) => { setEditing(r); setMode("edit") }}
          onDelete={(id) => {
            if (confirmDelete === id) {
              deleteCustomRoutine(id)
              setConfirmDelete(null)
            } else {
              setConfirmDelete(id)
            }
          }}
          confirmDelete={confirmDelete}
          onCreate={() => {
            setEditing({
              id: "r_" + Date.now(),
              name: "New Routine",
              tags: [],
              exerciseIds: [],
              daysPerWeek: 1,
              isCustom: true,
            })
            setMode("edit")
          }}
        />
      ) : null}

      {mode === "edit" && editing ? (
        <EditView
          routine={editing}
          onChange={setEditing}
          onBack={() => setMode("list")}
          onSave={() => {
            if (state.customRoutines.find((x) => x.id === editing.id)) {
              updateCustomRoutine(editing.id, editing)
            } else {
              addCustomRoutine(editing)
              setActiveRoutine(editing.id)
            }
            setMode("list")
          }}
          onPickExercise={() => setMode("picker")}
        />
      ) : null}

      {mode === "picker" && editing ? (
        <PickerView
          existingIds={editing.exerciseIds}
          onPick={(id) => {
            setEditing((prev) => (prev ? { ...prev, exerciseIds: [...prev.exerciseIds, id] } : prev))
            setMode("edit")
          }}
          onBack={() => setMode("edit")}
        />
      ) : null}
    </ModalSheet>
  )
}

// ─── List of all routines (built-in + custom) ───
function ListView({
  state,
  confirmDelete,
  onDuplicate,
  onEdit,
  onDelete,
  onCreate,
}: {
  state: ReturnType<typeof useStore>["state"]
  confirmDelete: string | null
  onDuplicate: (r: Routine) => void
  onEdit: (r: Routine) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div>
      <div className="t17 w8 mb6">Routines</div>
      <div className="t13 c2 mb16">Built-ins are read-only. Duplicate to customise.</div>

      <div className="col g8 mb16">
        {ROUTINES.map((r) => (
          <div key={r.id} className="routRow" style={{ cursor: "default" }}>
            <div className={`rPip ${r.id === state.activeRoutineId ? "act" : "idle"}`} />
            <div className="col f1 g4">
              <span className="t15 w7">{r.name}</span>
              <span className="t11 c2">Built-in · {r.exerciseIds.length} exercises</span>
            </div>
            <button type="button" className="bdg" onClick={() => onDuplicate(r)}>Duplicate</button>
          </div>
        ))}

        {state.customRoutines.map((r) => {
          const isConfirmingThisOne = confirmDelete === r.id
          return (
            <div key={r.id} className="routRow" style={{ cursor: "default" }}>
              <div className={`rPip ${r.id === state.activeRoutineId ? "act" : "idle"}`} />
              <div className="col f1 g4">
                <span className="t15 w7">{r.name}</span>
                <span className="t11 c2">Custom · {r.exerciseIds.length} exercises</span>
              </div>
              <button type="button" className="bdg bdo" onClick={() => onEdit(r)}>Edit</button>
              <button
                type="button"
                className="bdg"
                style={{ marginLeft: 4, background: isConfirmingThisOne ? "#7a1d1d" : undefined, color: isConfirmingThisOne ? "#fff" : "#c44" }}
                onClick={() => onDelete(r.id)}
              >
                {isConfirmingThisOne ? "Confirm?" : "Delete"}
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="btnP" onClick={onCreate}>+ Create New Routine</button>
    </div>
  )
}

// ─── Edit a single routine: name + ordered exercise list ───
function EditView({
  routine,
  onChange,
  onBack,
  onSave,
  onPickExercise,
}: {
  routine: Routine
  onChange: (r: Routine) => void
  onBack: () => void
  onSave: () => void
  onPickExercise: () => void
}) {
  function patch(p: Partial<Routine>) {
    onChange({ ...routine, ...p })
  }
  function moveEx(from: number, to: number) {
    const ids = [...routine.exerciseIds]
    if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) return
    const [m] = ids.splice(from, 1)
    ids.splice(to, 0, m)
    patch({ exerciseIds: ids })
  }
  function removeEx(idx: number) {
    patch({ exerciseIds: routine.exerciseIds.filter((_, i) => i !== idx) })
  }

  return (
    <div>
      <div className="row jb mb6">
        <button type="button" className="bdg" onClick={onBack}>← Back</button>
        <button type="button" className="bdg bdo" onClick={onSave}>Save</button>
      </div>

      <div className="t10 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>Routine Name</div>
      <input
        className="inp mb16"
        value={routine.name}
        onChange={(e) => patch({ name: e.target.value })}
        maxLength={32}
      />

      <div className="row jb mb8">
        <span className="t10 w7 c2 upper" style={{ letterSpacing: ".6px" }}>Exercises ({routine.exerciseIds.length})</span>
        <button type="button" className="bdg bdo" onClick={onPickExercise}>+ Add</button>
      </div>

      {routine.exerciseIds.length === 0 ? (
        <div className="t11 c2" style={{ textAlign: "center", padding: 12 }}>No exercises yet — tap Add.</div>
      ) : (
        <div className="col g4 mb16">
          {routine.exerciseIds.map((id, idx) => {
            const ex = EX[id]
            if (!ex) return null
            return (
              <div key={`${id}_${idx}`} className="reRow">
                <span className="t11 w7 c3" style={{ width: 18 }}>{idx + 1}</span>
                <span className="t13 w6 f1">{ex.n}</span>
                <button type="button" className="bdg" onClick={() => moveEx(idx, idx - 1)} disabled={idx === 0}>↑</button>
                <button type="button" className="bdg" onClick={() => moveEx(idx, idx + 1)} disabled={idx === routine.exerciseIds.length - 1}>↓</button>
                <button type="button" className="bdg" style={{ color: "#c44" }} onClick={() => removeEx(idx)}>✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Pick an exercise to add to the routine ───
function PickerView({
  existingIds,
  onPick,
  onBack,
}: {
  existingIds: string[]
  onPick: (id: string) => void
  onBack: () => void
}) {
  const existing = new Set(existingIds)
  return (
    <div>
      <div className="row jb mb6">
        <button type="button" className="bdg" onClick={onBack}>← Back</button>
        <span className="t13 w7 c2">Pick Exercise</span>
        <span style={{ width: 60 }} />
      </div>
      <div className="col g4">
        {Object.keys(EX).map((id) => {
          const ex = EX[id]
          const added = existing.has(id)
          return (
            <div
              key={id}
              className="exPickItem"
              style={added ? { opacity: 0.4 } : undefined}
              role="button"
              tabIndex={0}
              onClick={() => { if (!added) onPick(id) }}
            >
              <div className="exPickDot" />
              <div className="col f1 g4">
                <span className="t13 w6">
                  {ex.n}{added ? <span className="t10 c3"> (added)</span> : null}
                </span>
                <span className="t10 c2">
                  {(ex.p || []).slice(0, 3).map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
                </span>
              </div>
              <span className="t11 c2">{ex.sets}×{ex.r}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
