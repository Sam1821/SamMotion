"use client"

// Muscle map — stylised front + back body diagram with named regions.
// Layout: 320×400 viewBox, two figures side-by-side. Each region is a labelled
// rectangle whose colour reflects whether it's a primary, secondary, or unused
// target for the current exercise.

import { useState } from "react"
import { MUSCLE_LABELS } from "./data"
import type { MuscleId } from "./types"

interface Props {
  primary: MuscleId[]
  secondary: MuscleId[]
}

const REGIONS: { id: MuscleId; d: string }[] = [
  // ───────── FRONT view ─────────
  { id: "chest_upper", d: "M52,82 h56 v8 h-56 z" },
  { id: "chest_mid",   d: "M52,92 h56 v10 h-56 z" },
  { id: "chest_lower", d: "M52,104 h56 v8 h-56 z" },
  { id: "delts_front", d: "M36,72 h14 v16 h-14 z M110,72 h14 v16 h-14 z" },
  { id: "delts_side",  d: "M22,72 h12 v22 h-12 z M126,72 h12 v22 h-12 z" },
  { id: "biceps_long",  d: "M22,96 h10 v36 h-10 z M128,96 h10 v36 h-10 z" },
  { id: "biceps_short", d: "M34,96 h10 v36 h-10 z M116,96 h10 v36 h-10 z" },
  { id: "brachialis",   d: "M22,134 h22 v6 h-22 z M116,134 h22 v6 h-22 z" },
  { id: "forearms",     d: "M22,142 h22 v44 h-22 z M116,142 h22 v44 h-22 z" },
  { id: "abs_upper",    d: "M64,114 h32 v22 h-32 z" },
  { id: "abs_lower",    d: "M64,138 h32 v24 h-32 z" },
  { id: "obliques",     d: "M50,114 h14 v48 h-14 z M96,114 h14 v48 h-14 z" },
  { id: "quads_rf",     d: "M70,180 h20 v52 h-20 z" },
  { id: "quads_vl",     d: "M52,184 h18 v52 h-18 z M90,184 h18 v52 h-18 z" },
  { id: "quads_vm",     d: "M68,234 h24 v18 h-24 z" },
  { id: "adductors",    d: "M76,180 h8 v52 h-8 z" },

  // ───────── BACK view ─────────
  { id: "traps_upper", d: "M212,68 h56 v10 h-56 z" },
  { id: "traps_mid",   d: "M218,80 h44 v18 h-44 z" },
  { id: "traps_lower", d: "M226,100 h28 v14 h-28 z" },
  { id: "rear_delts",  d: "M196,72 h14 v16 h-14 z M270,72 h14 v16 h-14 z" },
  { id: "lats",        d: "M196,96 h22 v50 h-22 z M262,96 h22 v50 h-22 z" },
  { id: "rhomboids",   d: "M222,82 h36 v16 h-36 z" },
  { id: "lower_back",  d: "M220,148 h40 v22 h-40 z" },
  { id: "triceps_long",     d: "M186,96 h10 v36 h-10 z M284,96 h10 v36 h-10 z" },
  { id: "triceps_lateral",  d: "M174,96 h10 v36 h-10 z M296,96 h10 v36 h-10 z" },
  { id: "triceps_medial",   d: "M174,134 h22 v6 h-22 z M284,134 h22 v6 h-22 z" },
  { id: "glutes",       d: "M198,176 h38 v28 h-38 z M244,176 h38 v28 h-38 z" },
  { id: "hamstrings_bf", d: "M198,206 h18 v50 h-18 z M264,206 h18 v50 h-18 z" },
  { id: "hamstrings_sm", d: "M218,206 h18 v50 h-18 z M244,206 h18 v50 h-18 z" },
  { id: "calves_gastroc", d: "M198,260 h38 v40 h-38 z M244,260 h38 v40 h-38 z" },
  { id: "calves_soleus",  d: "M204,302 h26 v18 h-26 z M250,302 h26 v18 h-26 z" },
  { id: "abductors",    d: "M186,176 h12 v28 h-12 z M282,176 h12 v28 h-12 z" },
]

// Body silhouette outline drawn behind the muscle layer.
// `x` is the horizontal offset: 0 for front view, 160 for back view.
function Silhouette({ x }: { x: number }) {
  return (
    <g opacity="0.18" fill="#fff" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6">
      <ellipse cx={x + 80} cy={32} rx={18} ry={22} />
      <rect x={x + 70} y={50} width={20} height={14} />
      <rect x={x + 44} y={64} width={72} height={108} rx={6} />
      <ellipse cx={x + 44} cy={76} rx={14} ry={14} />
      <ellipse cx={x + 116} cy={76} rx={14} ry={14} />
      <rect x={x + 18} y={70} width={26} height={120} rx={8} />
      <rect x={x + 116} y={70} width={26} height={120} rx={8} />
      <rect x={x + 48} y={172} width={28} height={170} rx={8} />
      <rect x={x + 84} y={172} width={28} height={170} rx={8} />
    </g>
  )
}

export function MuscleSVG({ primary, secondary }: Props) {
  const [hover, setHover] = useState<MuscleId | null>(null)
  const pSet = new Set(primary)
  const sSet = new Set(secondary)

  function fill(id: MuscleId): string {
    if (pSet.has(id)) return "var(--orange)"
    if (sSet.has(id)) return "var(--green)"
    return "rgba(255,255,255,0.06)"
  }
  function stroke(id: MuscleId): string {
    if (pSet.has(id)) return "var(--orange)"
    if (sSet.has(id)) return "var(--green)"
    return "rgba(255,255,255,0.18)"
  }

  return (
    <div className="mmSvgWrap" style={{ width: "100%", maxWidth: 320 }}>
      <svg viewBox="0 0 320 400" width="100%" height="auto" aria-label="Muscle map" role="img">
        <Silhouette x={0} />
        <Silhouette x={160} />

        {REGIONS.map((r) => {
          const isHi = pSet.has(r.id) || sSet.has(r.id)
          return (
            <path
              key={r.id}
              d={r.d}
              fill={fill(r.id)}
              stroke={stroke(r.id)}
              strokeWidth={isHi ? 1.2 : 0.6}
              opacity={hover && hover !== r.id && !isHi ? 0.35 : 1}
              style={{ cursor: "pointer", transition: "opacity 120ms" }}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((cur) => (cur === r.id ? null : r.id))}
            >
              <title>{MUSCLE_LABELS[r.id]}</title>
            </path>
          )
        })}

        {hover ? (
          <g pointerEvents="none">
            <rect x={70} y={368} width={180} height={22} rx={6} fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.18)" />
            <text x={160} y={384} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
              {MUSCLE_LABELS[hover]}
            </text>
          </g>
        ) : null}

        <text x={80} y={14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9} fontWeight={700} letterSpacing={1}>FRONT</text>
        <text x={240} y={14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9} fontWeight={700} letterSpacing={1}>BACK</text>
      </svg>
    </div>
  )
}
