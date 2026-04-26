"use client"

import { useEffect, useState } from "react"
import { ALL_EQ_IDS, EQUIPMENT_META, GYM_EMOJIS } from "@/lib/sammotion/data"
import { useStore } from "@/lib/sammotion/store"
import type { EquipmentId } from "@/lib/sammotion/types"
import { ModalSheet } from "./modal-sheet"

export function GymDetailModal({
  open,
  onClose,
  gymId,
}: {
  open: boolean
  onClose: () => void
  gymId: string | null
}) {
  const { state, updateGym, deleteGym, selectGym } = useStore()
  const gym = gymId ? state.gyms.find((g) => g.id === gymId) : null

  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🏠")
  const [equipment, setEquipment] = useState<EquipmentId[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (open && gym) {
      setName(gym.name)
      setEmoji(gym.emoji)
      setEquipment(gym.eq)
      setConfirmDelete(false)
    }
  }, [open, gym])

  if (!gym) return <ModalSheet open={open} onClose={onClose} />

  const sessionsHere = state.history.filter((h) => !h.sample && h.gymId === gym.id).length
  const isActive = gym.id === state.activeGymId
  const isOnlyGym = state.gyms.length <= 1

  function toggleEq(id: EquipmentId) {
    setEquipment((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  function save() {
    if (!gym) return
    const trimmed = name.trim() || gym.name
    updateGym(gym.id, { name: trimmed, emoji, eq: equipment })
    onClose()
  }

  function handleDelete() {
    if (!gym || isOnlyGym) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteGym(gym.id)
    onClose()
  }

  function handleSetActive() {
    if (!gym) return
    selectGym(gym.id)
    onClose()
  }

  return (
    <ModalSheet open={open} onClose={onClose}>
      <div className="t10 w7 c2 upper mb6" style={{ letterSpacing: ".6px" }}>Gym Detail</div>

      <div className="row g8 mb16">
        <div className="gymBox" style={{ width: 56, height: 56, fontSize: 28 }}>{emoji}</div>
        <div className="col f1 g4">
          <input
            className="inp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Gym name"
            maxLength={30}
            style={{ marginBottom: 4 }}
          />
          <div className="t11 c2">
            {sessionsHere} session{sessionsHere === 1 ? "" : "s"} logged · {gym.eq.length} equipment
            {isActive ? <span className="bdg bdo" style={{ marginLeft: 6 }}>Active</span> : null}
          </div>
        </div>
      </div>

      <div className="t11 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>Icon</div>
      <div className="emojiGrid mb16">
        {GYM_EMOJIS.map((e) => (
          <div
            key={e}
            className={`emojiOpt ${e === emoji ? "sel" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setEmoji(e)}
          >
            {e}
          </div>
        ))}
      </div>

      <div className="t11 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>Equipment ({equipment.length})</div>
      <div className="eqGrid mb16" style={{ padding: 0 }}>
        {ALL_EQ_IDS.map((id) => {
          const m = EQUIPMENT_META[id]
          const on = equipment.includes(id)
          return (
            <div
              key={id}
              className={`eqTog ${on ? "on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => toggleEq(id)}
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

      <div className="col g8">
        <button type="button" className="btnP" onClick={save}>Save Changes</button>

        {!isActive ? (
          <button
            type="button"
            className="btnP"
            style={{ background: "var(--card2)", color: "var(--t2)", border: "1px solid var(--border)", boxShadow: "none" }}
            onClick={handleSetActive}
          >
            Set as Active Gym
          </button>
        ) : null}

        {!isOnlyGym ? (
          <button
            type="button"
            className="btnP"
            style={{
              background: confirmDelete ? "#7a1d1d" : "transparent",
              color: confirmDelete ? "#fff" : "#c44",
              border: "1px solid #5a1818",
              boxShadow: "none",
            }}
            onClick={handleDelete}
          >
            {confirmDelete ? "Tap again to confirm delete" : "Delete Gym"}
          </button>
        ) : (
          <div className="t10 c3" style={{ textAlign: "center" }}>
            Can&apos;t delete your only gym.
          </div>
        )}
      </div>
    </ModalSheet>
  )
}
