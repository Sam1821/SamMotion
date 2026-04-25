"use client"

// SamMotion — anatomical muscle SVG with sub-head granularity.
// Anterior view (left) + posterior view (right). Each region is its own <path> with a
// `data-muscle` id that matches MuscleId in types.ts. Highlight orange for primary,
// green for secondary; tap a region to label it.

import { useState } from "react"
import { MUSCLE_LABELS } from "./data"
import type { MuscleId } from "./types"

interface Props {
  primary: MuscleId[]
  secondary: MuscleId[]
}

// All paths are hand-drawn approximations sized to a 320×400 viewBox.
// IDs intentionally match `MuscleId` so highlighting is a 1-line lookup.
// Two figures: anterior (front) at x=0..160, posterior (back) at x=160..320.
const REGIONS: { id: MuscleId; d: string }[] = [
  // ── ANTERIOR (front view) — head/torso/arms/legs ──
  // Chest (3 horizontal bands suggesting upper / mid / lower clavicular → sternocostal → costal)
  { id: "chest_upper", d: "M52,80 q28,-8 56,0 q4,4 0,12 q-28,-8 -56,0 z" },
  { id: "chest_mid",   d: "M52,93 q28,-6 56,0 q4,4 0,11 q-28,-6 -56,0 z" },
  { id: "chest_lower", d: "M52,105 q28,-5 56,0 q4,4 0,11 q-28,-5 -56,0 z" },
  // Front delts
  { id: "delts_front", d: "M40,75 q-4,10 0,22 q5,4 12,-2 q0,-12 -2,-22 z M120,75 q4,10 0,22 q-5,4 -12,-2 q0,-12 2,-22 z" },
  // Side delts (visible on outer edge of anterior)
  { id: "delts_side",  d: "M34,80 q-4,12 -1,24 q3,2 8,-1 q-2,-12 0,-24 z M126,80 q4,12 1,24 q-3,2 -8,-1 q2,-12 0,-24 z" },
  // Biceps (long head outer, short head inner) on upper arm
  { id: "biceps_long", d: "M28,100 q-4,18 0,36 q4,3 9,-1 q-2,-18 -2,-36 z M132,100 q4,18 0,36 q-4,3 -9,-1 q2,-18 2,-36 z" },
  { id: "biceps_short",d: "M37,100 q-2,18 0,36 q3,3 7,0 q-1,-18 -1,-36 z M123,100 q2,18 0,36 q-3,3 -7,0 q1,-18 1,-36 z" },
  // Brachialis (small inner-elbow band)
  { id: "brachialis",  d: "M30,138 q3,5 12,2 q-1,5 -8,7 q-5,-2 -4,-9 z M130,138 q-3,5 -12,2 q1,5 8,7 q5,-2 4,-9 z" },
  // Forearms
  { id: "forearms",    d: "M22,150 q-3,28 4,52 q6,3 11,-2 q-1,-28 -3,-52 z M138,150 q3,28 -4,52 q-6,3 -11,-2 q1,-28 3,-52 z" },
  // Abs upper / lower / obliques
  { id: "abs_upper",   d: "M64,118 h32 v22 h-32 z" },
  { id: "abs_lower",   d: "M64,142 h32 v24 h-32 z" },
  { id: "obliques",    d: "M50,118 q-2,24 4,46 q4,2 8,-2 v-46 z M110,118 q2,24 -4,46 q-4,2 -8,-2 v-46 z" },
  // Quads (RF center, VL outer, VM inner-low)
  { id: "quads_rf",    d: "M70,200 q4,40 4,68 q-4,4 -10,-2 q-2,-32 -2,-66 z M86,200 q-4,40 -4,68 q4,4 10,-2 q2,-32 2,-66 z" },
  { id: "quads_vl",    d: "M58,205 q-2,38 0,62 q4,4 8,0 q0,-30 0,-62 z M102,205 q2,38 0,62 q-4,4 -8,0 q0,-30 0,-62 z" },
  { id: "quads_vm",    d: "M74,250 q1,16 1,22 q-3,3 -8,1 q-1,-12 1,-23 z M86,250 q-1,16 -1,22 q3,3 8,1 q1,-12 -1,-23 z" },
  // Adductors (inner thigh)
  { id: "adductors",   d: "M76,205 v60 h8 v-60 z" },
  // Front view doesn't show calves / glutes / hamstrings; those are on the posterior.

  // ── POSTERIOR (back view) — mirrored figure shifted +180 ──
  // Traps upper / mid / lower
  { id: "traps_upper", d: "M236,72 q22,-2 40,0 q4,4 -2,12 q-18,-4 -36,0 z" },
  { id: "traps_mid",   d: "M232,86 q26,-2 48,0 q4,4 -4,18 q-20,-4 -40,0 z" },
  { id: "traps_lower", d: "M240,108 q18,-2 32,0 q4,4 -6,18 q-10,-2 -20,0 z" },
  // Rear delts
  { id: "rear_delts",  d: "M218,75 q-4,12 -1,24 q3,2 8,-1 q-2,-14 0,-24 z M298,75 q4,12 1,24 q-3,2 -8,-1 q2,-14 0,-24 z" },
  // Lats — wide V down the side of back
  { id: "lats",        d: "M222,98 q-6,40 0,68 q6,4 14,-1 q-2,-36 -2,-68 z M294,98 q6,40 0,68 q-6,4 -14,-1 q2,-36 2,-68 z" },
  // Rhomboids (between shoulder blades)
  { id: "rhomboids",   d: "M240,98 h36 v22 h-36 z" },
  // Lower back
  { id: "lower_back",  d: "M242,158 h32 v22 h-32 z" },
  // Triceps (long head inner, lateral outer, medial small)
  { id: "triceps_long",d: "M210,100 q-4,18 0,36 q4,3 9,-1 q-2,-18 -2,-36 z M306,100 q4,18 0,36 q-4,3 -9,-1 q2,-18 2,-36 z" },
  { id: "triceps_lateral", d: "M201,100 q-3,18 -1,36 q3,3 7,0 q-1,-18 -1,-36 z M315,100 q3,18 1,36 q-3,3 -7,0 q1,-18 1,-36 z" },
  { id: "triceps_medial",  d: "M218,134 q3,4 11,1 q-1,5 -8,6 q-4,-1 -3,-7 z M298,134 q-3,4 -11,1 q1,5 8,6 q4,-1 3,-7 z" },
  // Glutes
  { id: "glutes",      d: "M226,182 q14,-2 26,0 v32 q-14,2 -26,0 z M264,182 q14,-2 26,0 v32 q-14,2 -26,0 z" },
  // Hamstrings (biceps femoris outer, semimembranosus inner)
  { id: "hamstrings_bf", d: "M222,220 q-2,30 0,50 q4,3 9,-1 q-1,-26 -1,-50 z M294,220 q2,30 0,50 q-4,3 -9,-1 q1,-26 1,-50 z" },
  { id: "hamstrings_sm", d: "M236,220 q-1,30 1,50 q3,3 7,0 q-1,-26 0,-50 z M280,220 q1,30 -1,50 q-3,3 -7,0 q1,-26 0,-50 z" },
  // Calves (gastrocnemius outer, soleus deeper/inner)
  { id: "calves_gastroc",d: "M222,275 q-2,28 4,48 q5,3 9,-1 q-1,-24 -3,-48 z M294,275 q2,28 -4,48 q-5,3 -9,-1 q1,-24 3,-48 z" },
  { id: "calves_soleus", d: "M232,302 q3,16 8,22 q4,-1 5,-3 q-2,-12 -3,-20 z M286,302 q-3,16 -8,22 q-4,-1 -5,-3 q2,-12 3,-20 z" },
  // Abductors (outer hip — back view)
  { id: "abductors",   d: "M218,178 q-3,12 0,22 q4,2 8,-1 v-22 z M302,178 q3,12 0,22 q-4,2 -8,-1 v-22 z" },
]

// Body silhouette outlines (drawn behind the muscles, inert).
const SILHOUETTE_FRONT = "M80,40 q14,0 16,16 q-2,18 -2,22 q24,4 32,24 v68 q-2,8 -8,12 v40 q-12,32 -16,108 q0,8 -10,8 q-8,0 -8,-8 q-1,-44 -4,-72 q-3,28 -4,72 q0,8 -8,8 q-10,0 -10,-8 q-4,-76 -16,-108 v-40 q-6,-4 -8,-12 v-68 q8,-20 32,-24 q0,-4 -2,-22 q2,-16 16,-16 z"
const SILHOUETTE_BACK  = "M240,40 q14,0 16,16 q-2,18 -2,22 q24,4 32,24 v68 q-2,8 -8,12 v40 q-12,32 -16,108 q0,8 -10,8 q-8,0 -8,-8 q-1,-44 -4,-72 q-3,28 -4,72 q0,8 -8,8 q-10,0 -10,-8 q-4,-76 -16,-108 v-40 q-6,-4 -8,-12 v-68 q8,-20 32,-24 q0,-4 -2,-22 q2,-16 16,-16 z"

export function MuscleSVG({ primary, secondary }: Props) {
  const [hover, setHover] = useState<MuscleId | null>(null)
  const pSet = new Set(primary)
  const sSet = new Set(secondary)

  function fill(id: MuscleId): string {
    if (pSet.has(id)) return "var(--orange)"
    if (sSet.has(id)) return "var(--green)"
    return "rgba(255,255,255,0.05)"
  }
  function stroke(id: MuscleId): string {
    if (pSet.has(id)) return "var(--orange)"
    if (sSet.has(id)) return "var(--green)"
    return "rgba(255,255,255,0.18)"
  }

  return (
    <div className="mmSvgWrap" style={{ width: "100%", maxWidth: 280 }}>
      <svg viewBox="0 0 320 400" width="100%" height="auto" aria-label="Muscle map" role="img">
        <path d={SILHOUETTE_FRONT} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
        <path d={SILHOUETTE_BACK}  fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
        {REGIONS.map((r) => {
          const isHi = pSet.has(r.id) || sSet.has(r.id)
          return (
            <path
              key={r.id}
              d={r.d}
              fill={fill(r.id)}
              stroke={stroke(r.id)}
              strokeWidth={isHi ? 1.5 : 0.8}
              opacity={hover && hover !== r.id && !isHi ? 0.4 : 1}
              style={{ cursor: "pointer", transition: "opacity 120ms" }}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(r.id)}
              aria-label={MUSCLE_LABELS[r.id]}
            />
          )
        })}
        {hover ? (
          <g pointerEvents="none">
            <rect x={80} y={370} width={160} height={22} rx={6} fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.18)" />
            <text x={160} y={385} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
              {MUSCLE_LABELS[hover]}
            </text>
          </g>
        ) : null}
        <text x={80}  y={20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>FRONT</text>
        <text x={240} y={20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>BACK</text>
      </svg>
    </div>
  )
}
