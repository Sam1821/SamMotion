"use client"

// Muscle map — clean front + back diagram with major-group highlights.
// Sub-heads (chest_upper, biceps_long, triceps_lateral, etc.) collapse to their
// parent group for rendering, so highlights are always large recognizable shapes
// instead of tiny floating slivers.

import { useState } from "react"
import { MUSCLE_GROUP, MUSCLE_LABELS } from "./data"
import type { MuscleGroup, MuscleId } from "./types"

interface Props {
  primary: MuscleId[]
  secondary: MuscleId[]
}

// Which group is shown on which view? (Some groups are visible on both, with separate paths.)
type View = "front" | "back"
interface Region {
  group: MuscleGroup
  view: View
  label: string  // user-facing label shown when hovered
  d: string
}

// All paths sized for a 400×420 viewBox. FRONT figure occupies x≈20..180, BACK x≈220..380.
const REGIONS: Region[] = [
  // ────────── FRONT ──────────
  // Pectorals — broad shape covering top of torso
  { group: "chest", view: "front", label: "Chest (Pectoralis Major)",
    d: "M58,82 C68,76 84,74 100,74 C116,74 132,76 142,82 C148,90 150,102 148,116 C146,128 138,134 124,136 L116,128 C108,124 92,124 84,128 L76,136 C62,134 54,128 52,116 C50,102 52,90 58,82 Z" },
  // Deltoids (front + side together — single shoulder cap per side)
  { group: "shoulders", view: "front", label: "Shoulders (Deltoids)",
    d: "M30,76 C36,68 50,68 56,76 C62,86 64,100 60,108 C50,108 38,106 30,98 C24,90 24,82 30,76 Z M170,76 C164,68 150,68 144,76 C138,86 136,100 140,108 C150,108 162,106 170,98 C176,90 176,82 170,76 Z" },
  // Biceps — bulge on upper arm, both sides
  { group: "biceps", view: "front", label: "Biceps",
    d: "M22,110 C28,106 38,106 44,112 C46,128 46,148 42,164 C36,166 28,164 22,160 C18,142 18,124 22,110 Z M178,110 C172,106 162,106 156,112 C154,128 154,148 158,164 C164,166 172,164 178,160 C182,142 182,124 178,110 Z" },
  // Forearms — lower arm
  { group: "forearms", view: "front", label: "Forearms",
    d: "M22,166 C28,164 36,164 42,168 C44,184 42,200 38,212 C32,212 26,210 22,206 C18,194 18,178 22,166 Z M178,166 C172,164 164,164 158,168 C156,184 158,200 162,212 C168,212 174,210 178,206 C182,194 182,178 178,166 Z" },
  // Abs / core — central column with sub-bands hinted via repeated rounded rects
  { group: "core", view: "front", label: "Abs & Core",
    d: "M80,138 C84,136 116,136 120,138 C122,148 122,158 120,166 C116,168 84,168 80,166 C78,158 78,148 80,138 Z M80,170 C84,168 116,168 120,170 C122,180 122,190 120,198 C116,200 84,200 80,198 C78,190 78,180 80,170 Z" },
  // Quadriceps — big front-thigh shape per leg
  { group: "quads", view: "front", label: "Quadriceps",
    d: "M58,210 C66,208 88,208 92,212 C94,236 92,266 86,290 C78,294 64,292 58,288 C54,260 54,236 58,210 Z M142,210 C134,208 112,208 108,212 C106,236 108,266 114,290 C122,294 136,292 142,288 C146,260 146,236 142,210 Z" },
  // Calves are partially visible from front but typically targeted on the back; skip front-view calves to keep figure clean.

  // ────────── BACK ──────────
  // Upper back — combined trapezius + lats + rhomboids in one big shape (the V)
  { group: "back", view: "back", label: "Back (Lats / Traps)",
    d: "M242,78 C254,72 282,70 300,70 C318,70 346,72 358,78 C366,86 370,100 368,116 C364,140 358,160 348,176 L348,184 C340,184 320,184 300,184 C280,184 260,184 252,184 L252,176 C242,160 236,140 232,116 C230,100 234,86 242,78 Z" },
  // Rear deltoids
  { group: "shoulders", view: "back", label: "Rear Deltoids",
    d: "M230,76 C236,68 250,68 256,76 C262,86 264,100 260,108 C250,108 238,106 230,98 C224,90 224,82 230,76 Z M370,76 C364,68 350,68 344,76 C338,86 336,100 340,108 C350,108 362,106 370,98 C376,90 376,82 370,76 Z" },
  // Triceps — back of upper arm
  { group: "triceps", view: "back", label: "Triceps",
    d: "M222,110 C228,106 238,106 244,112 C246,128 246,148 242,164 C236,166 228,164 222,160 C218,142 218,124 222,110 Z M378,110 C372,106 362,106 356,112 C354,128 354,148 358,164 C364,166 372,164 378,160 C382,142 382,124 378,110 Z" },
  // Forearms (back view)
  { group: "forearms", view: "back", label: "Forearms",
    d: "M222,166 C228,164 236,164 242,168 C244,184 242,200 238,212 C232,212 226,210 222,206 C218,194 218,178 222,166 Z M378,166 C372,164 364,164 358,168 C356,184 358,200 362,212 C368,212 374,210 378,206 C382,194 382,178 378,166 Z" },
  // Glutes — paired rounded mounds
  { group: "glutes", view: "back", label: "Glutes",
    d: "M252,200 C266,196 286,196 296,200 C300,212 300,228 296,238 C284,242 264,242 252,238 C246,228 246,212 252,200 Z M304,200 C314,196 334,196 348,200 C354,212 354,228 348,238 C336,242 316,242 304,238 C300,228 300,212 304,200 Z" },
  // Hamstrings — back of thigh
  { group: "hamstrings", view: "back", label: "Hamstrings",
    d: "M258,244 C266,242 288,242 292,246 C294,270 292,296 286,316 C278,318 264,316 258,312 C254,288 254,266 258,244 Z M308,244 C300,242 312,242 316,246 C314,270 316,296 322,316 C330,318 344,316 350,312 C354,288 354,266 350,244 C342,242 320,242 308,244 Z" },
  // Calves
  { group: "calves", view: "back", label: "Calves",
    d: "M256,322 C264,320 286,320 292,324 C294,348 290,372 282,392 C274,394 264,392 258,388 C254,366 254,344 256,322 Z M308,322 C300,320 312,320 318,324 C316,348 320,372 328,392 C336,394 346,392 352,388 C356,366 356,344 354,322 C346,320 316,320 308,322 Z" },
]

// Body silhouette — drawn as a set of clean primitives behind the muscle layer.
function Silhouette({ x }: { x: number }) {
  return (
    <g
      fill="rgba(255,255,255,0.04)"
      stroke="rgba(255,255,255,0.22)"
      strokeWidth={0.8}
      strokeLinejoin="round"
    >
      {/* Head */}
      <ellipse cx={x + 100} cy={36} rx={20} ry={24} />
      {/* Neck */}
      <path d={`M${x + 88},58 L${x + 112},58 L${x + 114},68 L${x + 86},68 Z`} />
      {/* Torso */}
      <path d={`M${x + 50},70 Q${x + 64},66 ${x + 84},66 L${x + 116},66 Q${x + 136},66 ${x + 150},70 Q${x + 158},78 ${x + 158},90 L${x + 152},196 Q${x + 150},204 ${x + 142},206 L${x + 58},206 Q${x + 50},204 ${x + 48},196 L${x + 42},90 Q${x + 42},78 ${x + 50},70 Z`} />
      {/* Left arm */}
      <path d={`M${x + 30},78 Q${x + 20},82 ${x + 18},96 L${x + 18},200 Q${x + 20},212 ${x + 32},214 L${x + 42},214 Q${x + 50},212 ${x + 50},200 L${x + 50},96 Q${x + 48},80 ${x + 36},76 Z`} />
      {/* Right arm */}
      <path d={`M${x + 170},78 Q${x + 180},82 ${x + 182},96 L${x + 182},200 Q${x + 180},212 ${x + 168},214 L${x + 158},214 Q${x + 150},212 ${x + 150},200 L${x + 150},96 Q${x + 152},80 ${x + 164},76 Z`} />
      {/* Left leg */}
      <path d={`M${x + 56},204 Q${x + 50},212 ${x + 50},224 L${x + 56},394 Q${x + 58},406 ${x + 70},408 L${x + 82},408 Q${x + 94},406 ${x + 96},394 L${x + 98},224 Q${x + 96},206 ${x + 86},204 Z`} />
      {/* Right leg */}
      <path d={`M${x + 144},204 Q${x + 150},212 ${x + 150},224 L${x + 144},394 Q${x + 142},406 ${x + 130},408 L${x + 118},408 Q${x + 106},406 ${x + 104},394 L${x + 102},224 Q${x + 104},206 ${x + 114},204 Z`} />
    </g>
  )
}

export function MuscleSVG({ primary, secondary }: Props) {
  const [hover, setHover] = useState<{ group: MuscleGroup; view: View; label: string } | null>(null)

  // Collapse sub-head IDs into their parent groups.
  const primaryGroups = new Set(primary.map((id) => MUSCLE_GROUP[id]))
  const secondaryGroups = new Set(secondary.map((id) => MUSCLE_GROUP[id]))

  function fill(g: MuscleGroup): string {
    if (primaryGroups.has(g)) return "var(--orange)"
    if (secondaryGroups.has(g)) return "var(--green)"
    return "rgba(255,255,255,0.05)"
  }
  function stroke(g: MuscleGroup): string {
    if (primaryGroups.has(g)) return "var(--orange)"
    if (secondaryGroups.has(g)) return "var(--green)"
    return "rgba(255,255,255,0.16)"
  }

  // Prefer the most specific sub-head label for the tooltip when only one is targeted.
  function specificLabel(g: MuscleGroup, fallback: string): string {
    const targets = [...primary, ...secondary].filter((id) => MUSCLE_GROUP[id] === g)
    if (targets.length === 1) return MUSCLE_LABELS[targets[0]]
    return fallback
  }

  return (
    <div className="mmSvgWrap" style={{ width: "100%", maxWidth: 380 }}>
      <svg viewBox="0 0 400 440" width="100%" height="auto" aria-label="Muscle map" role="img">
        <defs>
          <filter id="mmGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* View labels */}
        <text x={100} y={14} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={9} fontWeight={700} letterSpacing={1.5}>FRONT</text>
        <text x={300} y={14} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={9} fontWeight={700} letterSpacing={1.5}>BACK</text>

        {/* Body silhouettes */}
        <Silhouette x={0} />
        <Silhouette x={200} />

        {/* Muscle group regions (large clean shapes) */}
        {REGIONS.map((r, i) => {
          const isPrimary = primaryGroups.has(r.group)
          const isSecondary = secondaryGroups.has(r.group)
          const isHi = isPrimary || isSecondary
          const isHov = hover?.group === r.group && hover?.view === r.view
          return (
            <path
              key={`${r.group}-${r.view}-${i}`}
              d={r.d}
              fill={fill(r.group)}
              stroke={stroke(r.group)}
              strokeWidth={isHi ? 1.2 : 0.7}
              opacity={hover && !isHov && !isHi ? 0.25 : 1}
              filter={isHi ? "url(#mmGlow)" : undefined}
              style={{ cursor: "pointer", transition: "opacity 120ms" }}
              onMouseEnter={() => setHover({ group: r.group, view: r.view, label: specificLabel(r.group, r.label) })}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((cur) => (cur?.group === r.group && cur?.view === r.view ? null : { group: r.group, view: r.view, label: specificLabel(r.group, r.label) }))}
            >
              <title>{specificLabel(r.group, r.label)}</title>
            </path>
          )
        })}

        {/* Tooltip */}
        {hover ? (
          <g pointerEvents="none">
            <rect x={100} y={418} width={200} height={18} rx={5} fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.18)" />
            <text x={200} y={430} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>
              {hover.label}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  )
}
