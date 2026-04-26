"use client"

import { useEffect, useState } from "react"
import { EX, ROUTINES } from "@/lib/sammotion/data"
import { useStore } from "@/lib/sammotion/store"
import type { Routine } from "@/lib/sammotion/types"
import { ModalSheet } from "./modal-sheet"

type Mode = "list" | "edit" | "picker"

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

  // ─── List view ───
  if (mode === "list") {
    return (
      <ModalSheet open={open} onClose={onClose}>
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
              <button
                type="button"
                className="bdg"
                onClick={() => {
                  setEditing({ ...r, id: "r_" + Date.now(), isCustom: true, name: r.name + " (copy)" })
                  setMode("edit")
                }}
              >
                Duplicate
              </button>
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
                <button
                  type="button"
                  className="bdg bdo"
                  onClick={() => { setEditing(r); setMode("edit") }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="bdg"
                  style={{ marginLeft: 4, background: isConfirmingThisOne ? "#7a1d1d" : undefined, color: isConfirmingThisOne ? "#fff" : "#c44" }}
                  onClick={() => {
                    if (isConfirmingThisOne) {
                      deleteCustomRoutine(r.id)
                      setConfirmDelete(null)
                    } else {
                      setConfirmDelete(r.id)
                    }
                  }}
                >
                  {isConfirmingThisOne ? "Confirm?" : "Delete"}
                </button>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="btnP"
          onClick={() => {
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
        >
          + Create New Routine
        </button>
      </ModalSheet>
    )
  }

  // ─── Edit view ───
  if (mode === "edit" && editing) {
    function patchEditing(p: Partial<Routine>) {
      setEditing((prev) => (prev ? { ...prev, ...p } : prev))
    }
    function moveEx(from: number, to: number) {
      if (!editing) return
      const ids = [...editing.exerciseIds]
      if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) return
      const [m] = ids.splice(from, 1)
      ids.splice(to, 0, m)
      patchEditing({ exerciseIds: ids })
    }
    function removeEx(idx: number) {
      if (!editing) return
      patchEditing({ exerciseIds: editing.exerciseIds.filter((_, i) => i !== idx) })
    }

    return (
      <ModalSheet open={open} onClose={onClose}>
        <div className="row jb mb6">
          <button type="button" className="bdg" onClick={() => setMode("list")}>← Back</button>
          <button
            type="button"
            className="bdg bdo"
            onClick={() => {
              if (state.customRoutines.find((x) => x.id === editing.id)) {
                updateCustomRoutine(editing.id, editing)
              } else {
                addCustomRoutine(editing)
                setActiveRoutine(editing.id)
              }
              setMode("list")
            }}
          >
            Save
          </button>
        </div>

        <div className="t10 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>Routine Name</div>
        <input
          className="inp mb16"
          value={editing.name}
          onChange={(e) => patchEditing({ name: e.target.value })}
          maxLength={32}
        />

        <div className="row jb mb8">
          <span className="t10 w7 c2 upper" style={{ letterSpacing: ".6px" }}>Exercises ({editing.exerciseIds.length})</span>
          <button type="button" className="bdg bdo" onClick={() => setMode("picker")}>+ Add</button>
        </div>

        {editing.exerciseIds.length === 0 ? (
          <div className="t11 c2" style={{ textAlign: "center", padding: 12 }}>No exercises yet — tap Add.</div>
        ) : (
          <div className="col g4 mb16">
            {editing.exerciseIds.map((id, idx) => {
              const ex = EX[id]
              if (!ex) return null
              return (
                <div key={`${id}_${idx}`} className="reRow">
                  <span className="t11 w7 c3" style={{ width: 18 }}>{idx + 1}</span>
                  <span className="t13 w6 f1">{ex.n}</span>
                  <button type="button" className="bdg" onClick={() => moveEx(idx, idx - 1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="bdg" onClick={() => moveEx(idx, idx + 1)} disabled={idx === editing.exerciseIds.length - 1}>↓</button>
                  <button type="button" className="bdg" style={{ color: "#c44" }} onClick={() => removeEx(idx)}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </ModalSheet>
    )
  }

  // ─── Picker view ───
  if (mode === "picker" && editing) {
    const existing = new Set(editing.exerciseIds)
    return (
      <ModalSheet open={open} onClose={onClose}>
        <div className="row jb mb6">
          <button type="button" className="bdg" onClick={() => setMode("edit")}>← Back</button>
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
                onClick={() => {
                  if (added) return
                  setEditing((prev) => (prev ? { ...prev, exerciseIds: [...prev.exerciseIds, id] } : prev))
                  setMode("edit")
                }}
              >
                <div className="exPickDot" />
                <div className="col f1 g4">
                  <span className="t13 w6">{ex.n}{added ? <span className="t10 c3"> (added)</span> : null}</span>
                  <span className="t10 c2">
                    {(ex.p || []).slice(0, 3).map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
                  </span>
                </div>
                <span className="t11 c2">{ex.sets}×{ex.r}</span>
              </div>
            )
          })}
        </div>
      </ModalSheet>
    )
  }

  return <ModalSheet open={open} onClose={onClose} />
}
