"use client"

import { useEffect, useState } from "react"
import { ALL_EQ_IDS, EQUIPMENT_META, GYM_EMOJIS } from "@/lib/sammotion/data"
import { useStore } from "@/lib/sammotion/store"
import type { EquipmentId } from "@/lib/sammotion/types"
import { ModalSheet } from "./modal-sheet"

export function AddGymModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addGym } = useStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🏠")
  const [equipment, setEquipment] = useState<EquipmentId[]>([])

  useEffect(() => {
    if (open) {
      setStep(1)
      setName("")
      setEmoji("🏠")
      setEquipment([])
    }
  }, [open])

  function toggleEq(id: EquipmentId) {
    setEquipment((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return
    addGym({
      id: "g" + Date.now(),
      name: trimmed,
      emoji,
      eq: equipment,
    })
    onClose()
  }

  return (
    <ModalSheet open={open} onClose={onClose}>
      {step === 1 ? (
        <div>
          <div className="t17 w8 mb16">New Gym</div>
          <div className="t11 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>
            Gym Name
          </div>
          <input
            className="inp mb16"
            placeholder="e.g. My Home Gym"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="t11 w7 c2 upper mb8" style={{ letterSpacing: ".6px" }}>
            Pick an Icon
          </div>
          <div className="emojiGrid">
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
          <button
            type="button"
            className="btnP mt16"
            onClick={() => {
              if (!name.trim()) return
              setStep(2)
            }}
          >
            Continue →
          </button>
        </div>
      ) : (
        <div>
          <div className="t17 w8 mb6">Equipment Available</div>
          <div className="t13 c2 mb16">Toggle what&apos;s in this gym</div>
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
          <button type="button" className="btnP" onClick={save}>
            Save Gym
          </button>
        </div>
      )}
    </ModalSheet>
  )
}
