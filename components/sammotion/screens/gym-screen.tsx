"use client"

import { useState } from "react"
import { ALL_EQ_IDS, EQUIPMENT_META, ROUTINES } from "@/lib/sammotion/data"
import { getActiveGym, getExsForWorkout } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import { GymDetailModal } from "../modals/gym-detail-modal"
import { RoutineEditorModal } from "../modals/routine-editor-modal"

export function GymScreen({
  active,
  onAddGym,
}: {
  active: boolean
  onAddGym: () => void
}) {
  const { state, selectGym, toggleEquipment, setActiveRoutine } = useStore()
  const gym = getActiveGym(state)
  const [detailGymId, setDetailGymId] = useState<string | null>(null)
  const [routineEditorOpen, setRoutineEditorOpen] = useState(false)

  const allRoutines = [...ROUTINES, ...state.customRoutines]

  return (
    <section className={`sm-scr ${active ? "on" : ""}`} aria-label="Gym">
      <div className="gymHdr">
        <div className="t10 w7 c2 upper mb8">My Gyms</div>
        <div className="t26 w9" style={{ letterSpacing: "-.5px" }}>
          Gym Profiles
        </div>
        <div className="t13 c2 mt4">Tap a gym to edit · tap Use to switch active</div>
      </div>

      <div>
        {state.gyms.map((g) => (
          <div
            key={g.id}
            className={`gymCard ${g.id === state.activeGymId ? "sel" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setDetailGymId(g.id)}
          >
            <div className="gymBox">{g.emoji}</div>
            <div className="col f1 g4">
              <div className="row g8">
                <span className="t15 w7">{g.name}</span>
                {g.id === state.activeGymId ? <span className="bdg bdo">Active</span> : null}
              </div>
              <span className="t11 c2">{g.eq.length} equipment items</span>
            </div>
            {g.id !== state.activeGymId ? (
              <button
                type="button"
                className="bdg"
                onClick={(e) => { e.stopPropagation(); selectGym(g.id) }}
              >
                Use
              </button>
            ) : null}
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2.5}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>

      <button type="button" className="addGym" onClick={onAddGym}>
        <div className="addGymIcon">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span className="t15 w6">Add New Gym</span>
      </button>

      <div className="shdr mt8">
        <span className="stitle">Equipment</span>
        <span className="t11 c2 w5">{gym.name}</span>
      </div>
      <div className="eqGrid mb12">
        {ALL_EQ_IDS.map((id) => {
          const m = EQUIPMENT_META[id]
          const on = gym.eq.includes(id)
          return (
            <div
              key={id}
              className={`eqTog ${on ? "on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => toggleEquipment(id)}
            >
              <span className="eqIco">{m.emoji}</span>
              <div className="col f1">
                <span className="t13 w6">{m.label}</span>
                <span className="t10 c2 mt4">{m.cat}</span>
              </div>
              <div className="togPip" />
            </div>
          )
        })}
      </div>

      <div className="shdr">
        <span className="stitle">Routines</span>
        <button type="button" className="slink" onClick={() => setRoutineEditorOpen(true)}>
          Manage →
        </button>
      </div>
      <div>
        {allRoutines.map((r) => {
          const exCount = getExsForWorkout(state, state.activeGymId, r.id).length
          const on = r.id === state.activeRoutineId
          return (
            <div
              key={r.id}
              className="routRow"
              role="button"
              tabIndex={0}
              onClick={() => setActiveRoutine(r.id)}
            >
              <div className={`rPip ${on ? "act" : "idle"}`} />
              <div className="col f1 g4">
                <span className="t15 w7">{r.name}</span>
                <span className="t11 c2">
                  {r.isCustom ? "Custom" : "Built-in"} · {exCount} exercises available
                </span>
              </div>
              {on ? (
                <span className="bdg bdo" style={{ marginRight: 8 }}>
                  Active
                </span>
              ) : null}
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2.5}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          )
        })}
      </div>

      <div className="bspace" />

      <GymDetailModal
        open={detailGymId !== null}
        onClose={() => setDetailGymId(null)}
        gymId={detailGymId}
      />
      <RoutineEditorModal
        open={routineEditorOpen}
        onClose={() => setRoutineEditorOpen(false)}
      />
    </section>
  )
}
