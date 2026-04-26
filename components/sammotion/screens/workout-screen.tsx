"use client"

import { useEffect, useMemo, useState } from "react"
import { ROUTINES } from "@/lib/sammotion/data"
import { getActiveGym } from "@/lib/sammotion/helpers"
import { MuscleSVG } from "@/lib/sammotion/muscle-svg"
import { useStore } from "@/lib/sammotion/store"
import type { ExerciseWithId, SetLog } from "@/lib/sammotion/types"

function capitalize(m: string) {
  return m.charAt(0).toUpperCase() + m.slice(1)
}

export function WorkoutScreen({
  active,
  onStartWorkout,
  onFinish,
  onAddExercise,
  onReplaceExercise,
  timerSec,
}: {
  active: boolean
  onStartWorkout: () => void
  onFinish: () => void
  onAddExercise: () => void
  onReplaceExercise: (index: number) => void
  timerSec: number
}) {
  const { state, updateCurrent, reorderExercise, removeExercise } = useStore()
  const current = state.current
  const [openIdx, setOpenIdx] = useState<number>(0)
  const [menuIdx, setMenuIdx] = useState<number>(-1)

  // Reset expanded card when workout changes or new ex added
  useEffect(() => {
    if (!current) {
      setOpenIdx(0)
      return
    }
    if (openIdx >= current.exercises.length) setOpenIdx(0)
  }, [current, openIdx])

  const routine = current ? ROUTINES.find((r) => r.id === current.routineId) : null
  const gym = current ? getActiveGym(state) : null

  const totalSets = useMemo(() => {
    if (!current) return 0
    return current.exercises.reduce((a, e) => a + (e.sets || 3), 0)
  }, [current])

  const doneSets = useMemo(() => {
    if (!current) return 0
    return Object.values(current.sets).filter((s) => s.done).length
  }, [current])

  const progressPct = totalSets ? Math.min(100, Math.round((doneSets / totalSets) * 100)) : 0
  const exDone =
    current && totalSets
      ? Math.min(current.exercises.length, Math.floor(doneSets / (totalSets / current.exercises.length || 1)))
      : 0

  const mm = String(Math.floor(timerSec / 60)).padStart(2, "0")
  const ss = String(timerSec % 60).padStart(2, "0")

  function setKey(ei: number, si: number) {
    return `${ei}_${si}`
  }

  function getSet(ei: number, si: number, ex: ExerciseWithId): SetLog {
    if (!current) return { weight: ex.w || 0, reps: ex.r || 5, done: false }
    return current.sets[setKey(ei, si)] || { weight: ex.w || 0, reps: ex.r || 5, done: false }
  }

  function adjust(ei: number, si: number, ex: ExerciseWithId, field: "weight" | "reps", delta: number) {
    updateCurrent((prev) => {
      const k = setKey(ei, si)
      const existing = prev.sets[k] || { weight: ex.w || 0, reps: ex.r || 5, done: false }
      let next = existing[field] + delta
      if (field === "weight") next = Math.max(0, Math.round(next * 2) / 2)
      else next = Math.max(0, Math.round(next))
      return {
        ...prev,
        sets: { ...prev.sets, [k]: { ...existing, [field]: next } },
      }
    })
  }

  function toggleDone(ei: number, si: number, ex: ExerciseWithId) {
    updateCurrent((prev) => {
      const k = setKey(ei, si)
      const existing = prev.sets[k] || { weight: ex.w || 0, reps: ex.r || 5, done: false }
      return {
        ...prev,
        sets: { ...prev.sets, [k]: { ...existing, done: !existing.done } },
      }
    })
  }

  return (
    <section className={`sm-scr ${active ? "on" : ""}`} aria-label="Workout">
      <div className="woHdr">
        <div className="row jb">
          <div>
            <div className="t10 w7 c2 upper">In Progress</div>
            <div className="t17 w9 mt4" style={{ letterSpacing: "-.4px" }}>
              {current ? routine?.name || "Workout" : "—"}
            </div>
            <div className="t11 c2 mt4">{current && gym ? gym.name : "—"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="row g6" style={{ justifyContent: "flex-end" }}>
              <div className="liveDot" />
              <span className="t13 w7 cg mono">
                {mm}:{ss}
              </span>
            </div>
            <div className="t10 c2 mt4">
              {current ? `${exDone} / ${current.exercises.length} exercises` : "0 / 0 exercises"}
            </div>
          </div>
        </div>
        <div className="pbarTrack">
          <div className="pbarFill" style={{ width: progressPct + "%" }} />
        </div>
      </div>

      <div className="tipBar">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2.2}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        <span className="t13 cg w7">Ready — </span>
        <span className="t13 c2">
          {current
            ? `${routine?.name || ""} · ${current.exercises.length} exercises planned`
            : "select a workout to begin"}
        </span>
      </div>

      {!current ? (
        <div className="sm-empty">
          <div className="t17 w7 c2">No active workout</div>
          <div className="t13 c2 mt8">Go to Home and tap &ldquo;Start Workout&rdquo;</div>
          <button type="button" className="btnP mt16" onClick={onStartWorkout} style={{ maxWidth: 260 }}>
            Start Workout →
          </button>
        </div>
      ) : (
        <>
          <div>
            {current.exercises.map((ex, i) => {
              const isOpen = i === openIdx
              const primaryLabels = (ex.p || []).map(capitalize).join(" · ")
              return (
                <div key={`${ex.id}_${i}`} className={`exCard ${isOpen ? "act" : ""}`}>
                  <div className="exHdr" style={{ position: "relative" }}>
                    <div
                      className="row g8 f1"
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    >
                      <div className="exNum">{i + 1}</div>
                      <div className="col f1 g4">
                        <div className="row g8">
                          <span className="t15 w7">{ex.n}</span>
                          <span className="muscleTag">{primaryLabels}</span>
                        </div>
                        <span className="t11 c2">
                          {ex.sets} sets × {ex.r} reps{ex.w ? ` · ${ex.w} kg` : ""}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="exMenuBtn"
                      onClick={(e) => { e.stopPropagation(); setMenuIdx(menuIdx === i ? -1 : i) }}
                      aria-label="Exercise options"
                    >
                      ⋮
                    </button>
                    <svg
                      className={`chevron ${isOpen ? "open" : ""}`}
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--t3)"
                      strokeWidth={2.5}
                      style={{ marginLeft: 4 }}
                      onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {menuIdx === i ? (
                      <div className="exMenu" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="exMenuItem" disabled={i === 0} onClick={() => { reorderExercise(i, i - 1); setMenuIdx(-1) }}>↑ Move up</button>
                        <button type="button" className="exMenuItem" disabled={i === current.exercises.length - 1} onClick={() => { reorderExercise(i, i + 1); setMenuIdx(-1) }}>↓ Move down</button>
                        <button type="button" className="exMenuItem" onClick={() => { onReplaceExercise(i); setMenuIdx(-1) }}>↻ Replace</button>
                        <button type="button" className="exMenuItem" style={{ color: "#c44" }} onClick={() => { removeExercise(i); setMenuIdx(-1) }}>✕ Remove</button>
                      </div>
                    ) : null}
                  </div>
                  <div className="exBody">
                    <div className="mmSec">
                      <MuscleSVG primary={ex.p || []} secondary={ex.s || []} />
                      <div className="col f1">
                        <div className="t10 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>
                          Target Muscles
                        </div>
                        <div className="mmLegend">
                          {(ex.p || []).map((m) => (
                            <div key={`p-${m}`} className="row g8">
                              <div
                                className="mmDot"
                                style={{ background: "var(--orange)", boxShadow: "0 0 5px var(--orange)" }}
                              />
                              <div className="col g4">
                                <span className="t11 w6">{capitalize(m)}</span>
                                <span className="t10 c2">Primary</span>
                              </div>
                            </div>
                          ))}
                          {(ex.s || []).slice(0, 2).map((m) => (
                            <div key={`s-${m}`} className="row g8">
                              <div
                                className="mmDot"
                                style={{ background: "var(--green)", boxShadow: "0 0 5px var(--green)" }}
                              />
                              <div className="col g4">
                                <span className="t11 w6">{capitalize(m)}</span>
                                <span className="t10 c2">Secondary</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="setLogger">
                      <div className="logHdr">
                        <span className="t10 c3 w7" style={{ width: 20 }}>
                          Set
                        </span>
                        <span className="t10 c3 w7 f1" style={{ textAlign: "center" }}>
                          Weight (kg)
                        </span>
                        <span className="t10 c3 w7 f1" style={{ textAlign: "center" }}>
                          Reps
                        </span>
                        <div style={{ width: 40 }} />
                      </div>
                      {Array.from({ length: ex.sets || 3 }).map((_, si) => {
                        const s = getSet(i, si, ex)
                        return (
                          <div key={si} className="logRow">
                            <span className="t11 w7 c3" style={{ width: 20 }}>
                              {si + 1}
                            </span>
                            <div className="spinner">
                              <button
                                type="button"
                                className="spBtn"
                                onClick={() => adjust(i, si, ex, "weight", -2.5)}
                                aria-label="Decrease weight"
                              >
                                −
                              </button>
                              <div className="spVal mono">
                                {s.weight % 1 === 0 ? s.weight : s.weight.toFixed(1)}
                              </div>
                              <div className="spUnit">kg</div>
                              <button
                                type="button"
                                className="spBtn"
                                onClick={() => adjust(i, si, ex, "weight", 2.5)}
                                aria-label="Increase weight"
                              >
                                +
                              </button>
                            </div>
                            <div className="spinner">
                              <button
                                type="button"
                                className="spBtn"
                                onClick={() => adjust(i, si, ex, "reps", -1)}
                                aria-label="Decrease reps"
                              >
                                −
                              </button>
                              <div className="spVal mono">{s.reps}</div>
                              <div className="spUnit">reps</div>
                              <button
                                type="button"
                                className="spBtn"
                                onClick={() => adjust(i, si, ex, "reps", 1)}
                                aria-label="Increase reps"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              className={`chkBtn ${s.done ? "done" : ""}`}
                              onClick={() => toggleDone(i, si, ex)}
                              aria-label={s.done ? "Mark incomplete" : "Mark complete"}
                            >
                              <svg
                                width={14}
                                height={14}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={s.done ? "var(--green)" : "var(--t3)"}
                                strokeWidth={2.8}
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button type="button" className="addExBtn" onClick={onAddExercise}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="t13 w6">Add Exercise</span>
          </button>

          <div style={{ padding: "0 16px 8px" }}>
            <button
              type="button"
              className="btnP"
              style={{
                background: "var(--card2)",
                color: "var(--t2)",
                boxShadow: "none",
                border: "1px solid var(--border)",
              }}
              onClick={onFinish}
            >
              Finish Workout
            </button>
          </div>
        </>
      )}

      <div className="bspace" />
    </section>
  )
}
