"use client"

// Muscle map — anatomically-shaped front + back diagram.
// Each region is a curved Bezier path roughly matching the muscle's outline,
// nested inside an organic body silhouette. Highlights orange (primary) /
// green (secondary). Hover/tap any region for a label tooltip.

import { useState } from "react"
import { MUSCLE_LABELS } from "./data"
import type { MuscleId } from "./types"

interface Props {
  primary: MuscleId[]
  secondary: MuscleId[]
}

// ─── Body silhouette outlines (drawn behind muscles) ───
// FRONT view body — single complex path
const FRONT_BODY = "M100,18 C112,18 120,28 120,42 C120,52 116,58 110,62 L114,68 C124,70 132,76 138,86 C146,98 150,112 152,126 L154,180 C154,184 150,188 146,188 L140,188 C140,210 138,234 134,260 C132,278 130,296 124,338 C123,348 121,360 118,372 C116,384 110,388 104,388 C99,388 96,384 96,378 C96,360 98,338 96,316 C96,310 95,308 94,308 C93,308 92,310 92,316 C90,338 92,360 92,378 C92,384 89,388 84,388 C78,388 72,384 70,372 C67,360 65,348 64,338 C58,296 56,278 54,260 C50,234 48,210 48,188 L42,188 C38,188 34,184 34,180 L36,126 C38,112 42,98 50,86 C56,76 64,70 74,68 L78,62 C72,58 68,52 68,42 C68,28 76,18 88,18 Z"

// BACK view body — same shape mirrored at +200 offset
function buildBackBody(offset: number): string {
  return FRONT_BODY.replace(/(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g, (_m, x, y) => `${parseFloat(x) + offset},${y}`)
}

// ─── Muscle region paths ───
// Coordinates designed to sit inside the FRONT_BODY silhouette (centred on x=100).
const REGIONS: { id: MuscleId; d: string }[] = [
  // ──── FRONT: chest (pectoralis major split into 3 horizontal heads) ────
  // Upper chest — clavicular head
  { id: "chest_upper", d: "M62,82 C72,76 90,76 100,82 C110,76 128,76 138,82 C140,86 138,90 134,92 C124,90 110,90 100,94 C90,90 76,90 66,92 C62,90 60,86 62,82 Z" },
  // Mid chest — sternocostal upper
  { id: "chest_mid",   d: "M62,94 C74,92 90,94 100,100 C110,94 126,92 138,94 C140,100 136,106 130,110 C120,108 110,108 100,112 C90,108 80,108 70,110 C64,106 60,100 62,94 Z" },
  // Lower chest — sternocostal lower / costal
  { id: "chest_lower", d: "M64,112 C76,110 92,112 100,118 C108,112 124,110 136,112 C138,118 134,124 126,128 C118,126 110,126 100,130 C90,126 82,126 74,128 C66,124 62,118 64,112 Z" },

  // ──── FRONT: deltoids ────
  // Anterior (front) delt — shoulder cap, front side
  { id: "delts_front", d: "M44,76 C50,68 58,66 64,72 C66,80 64,90 60,98 C54,96 48,90 44,84 Z M156,76 C150,68 142,66 136,72 C134,80 136,90 140,98 C146,96 152,90 156,84 Z" },
  // Lateral (side) delt — outer cap
  { id: "delts_side",  d: "M36,80 C40,72 46,72 50,78 C52,86 50,94 46,100 C40,98 36,92 34,86 Z M164,80 C160,72 154,72 150,78 C148,86 150,94 154,100 C160,98 164,92 166,86 Z" },

  // ──── FRONT: biceps ────
  // Long head (outer)
  { id: "biceps_long",  d: "M34,100 C40,100 44,108 44,120 C44,132 40,142 34,142 C30,142 28,132 28,120 C28,108 30,100 34,100 Z M166,100 C160,100 156,108 156,120 C156,132 160,142 166,142 C170,142 172,132 172,120 C172,108 170,100 166,100 Z" },
  // Short head (inner)
  { id: "biceps_short", d: "M48,102 C52,102 56,110 56,122 C56,134 52,142 48,142 C44,142 42,132 42,120 C42,108 44,102 48,102 Z M152,102 C148,102 144,110 144,122 C144,134 148,142 152,142 C156,142 158,132 158,120 C158,108 156,102 152,102 Z" },
  // Brachialis (small wedge at the elbow)
  { id: "brachialis",   d: "M30,144 C36,146 50,146 56,144 C56,148 52,152 44,152 C36,152 30,148 30,144 Z M170,144 C164,146 150,146 144,144 C144,148 148,152 156,152 C164,152 170,148 170,144 Z" },

  // ──── FRONT: forearms ────
  { id: "forearms",     d: "M28,154 C36,152 50,152 58,156 C58,184 56,200 50,212 C44,210 40,210 36,212 C30,200 28,184 28,154 Z M172,154 C164,152 150,152 142,156 C142,184 144,200 150,212 C156,210 160,210 164,212 C170,200 172,184 172,154 Z" },

  // ──── FRONT: abs ────
  // Upper rectus abdominis
  { id: "abs_upper",    d: "M86,118 L86,152 L96,152 L96,118 Z M104,118 L104,152 L114,152 L114,118 Z" },
  // Lower rectus abdominis
  { id: "abs_lower",    d: "M86,154 L86,184 L96,184 L96,154 Z M104,154 L104,184 L114,184 L114,154 Z" },
  // Obliques (side abs)
  { id: "obliques",     d: "M68,118 C72,116 80,116 84,118 L84,182 C80,184 72,184 68,182 Z M132,118 C128,116 120,116 116,118 L116,182 C120,184 128,184 132,182 Z" },

  // ──── FRONT: quads (rectus femoris centre, vastus lateralis outer, vastus medialis lower-inner) ────
  { id: "quads_rf",     d: "M88,194 C92,192 108,192 112,194 C114,210 114,238 112,260 C108,262 92,262 88,260 C86,238 86,210 88,194 Z" },
  { id: "quads_vl",     d: "M64,196 C70,194 84,194 86,200 C86,222 84,250 80,266 C74,266 68,264 64,260 C62,238 62,216 64,196 Z M136,196 C130,194 116,194 114,200 C114,222 116,250 120,266 C126,266 132,264 136,260 C138,238 138,216 136,196 Z" },
  { id: "quads_vm",     d: "M86,260 C92,258 108,258 114,260 L114,278 C108,280 92,280 86,278 Z" },
  // Adductors (inner thigh sliver)
  { id: "adductors",    d: "M96,196 L96,256 L104,256 L104,196 Z" },

  // ──── BACK: traps (3 bands) ────
  { id: "traps_upper",  d: "M250,68 C262,62 282,60 300,62 C318,60 338,62 350,68 C346,72 340,76 332,78 C320,76 308,76 300,80 C292,76 280,76 268,78 C260,76 254,72 250,68 Z" },
  { id: "traps_mid",    d: "M254,82 C268,80 290,80 300,84 C310,80 332,80 346,82 C342,90 336,98 326,104 C314,102 300,104 300,108 C300,104 286,102 274,104 C264,98 258,90 254,82 Z" },
  { id: "traps_lower",  d: "M268,108 C282,106 296,106 300,110 C304,106 318,106 332,108 C328,118 322,128 314,134 C308,132 300,132 300,136 C300,132 292,132 286,134 C278,128 272,118 268,108 Z" },

  // ──── BACK: rear delts ────
  { id: "rear_delts",   d: "M244,76 C250,68 258,66 264,72 C266,80 264,90 260,98 C254,96 248,90 244,84 Z M356,76 C350,68 342,66 336,72 C334,80 336,90 340,98 C346,96 352,90 356,84 Z" },

  // ──── BACK: lats (the V) ────
  { id: "lats",         d: "M242,98 C250,96 264,98 268,108 C272,134 268,160 260,180 C252,180 246,176 242,168 C238,148 238,124 242,98 Z M358,98 C350,96 336,98 332,108 C328,134 332,160 340,180 C348,180 354,176 358,168 C362,148 362,124 358,98 Z" },

  // ──── BACK: rhomboids (between shoulder blades) ────
  { id: "rhomboids",    d: "M270,98 C284,96 316,96 330,98 C328,108 322,118 314,124 C308,122 292,122 286,124 C278,118 272,108 270,98 Z" },

  // ──── BACK: lower back / erector spinae ────
  { id: "lower_back",   d: "M276,150 C284,148 316,148 324,150 C326,164 324,178 320,188 C314,186 286,186 280,188 C276,178 274,164 276,150 Z" },

  // ──── BACK: triceps (long, lateral, medial) ────
  { id: "triceps_long",     d: "M232,100 C240,100 244,110 244,122 C244,138 240,150 232,152 C226,150 224,136 224,120 C224,108 228,100 232,100 Z M368,100 C360,100 356,110 356,122 C356,138 360,150 368,152 C374,150 376,136 376,120 C376,108 372,100 368,100 Z" },
  { id: "triceps_lateral",  d: "M218,102 C222,102 228,112 228,124 C228,140 224,150 220,152 C214,150 212,136 212,122 C212,110 214,102 218,102 Z M382,102 C378,102 372,112 372,124 C372,140 376,150 380,152 C386,150 388,136 388,122 C388,110 386,102 382,102 Z" },
  { id: "triceps_medial",   d: "M222,154 C232,156 244,156 248,154 C246,160 240,166 232,166 C224,166 218,160 222,154 Z M378,154 C368,156 356,156 352,154 C354,160 360,166 368,166 C376,166 382,160 378,154 Z" },

  // ──── BACK: glutes ────
  { id: "glutes",       d: "M246,194 C260,190 282,190 296,196 C298,208 298,222 296,232 C282,236 260,236 246,232 C242,222 242,208 246,194 Z M304,196 C318,190 340,190 354,194 C358,208 358,222 354,232 C340,236 318,236 304,232 C302,222 302,208 304,196 Z" },

  // ──── BACK: hamstrings ────
  { id: "hamstrings_bf", d: "M252,238 C260,236 274,236 282,238 C284,260 282,288 278,310 C272,312 264,312 258,310 C252,288 248,260 252,238 Z M348,238 C340,236 326,236 318,238 C316,260 318,288 322,310 C328,312 336,312 342,310 C348,288 352,260 348,238 Z" },
  { id: "hamstrings_sm", d: "M282,238 C290,236 296,236 298,240 L298,308 C296,312 290,312 282,310 Z M318,238 C310,236 304,236 302,240 L302,308 C304,312 310,312 318,310 Z" },

  // ──── BACK: calves ────
  { id: "calves_gastroc", d: "M252,316 C262,314 280,314 286,318 C288,340 282,360 274,376 C266,376 260,374 254,370 C250,354 250,334 252,316 Z M348,316 C338,314 320,314 314,318 C312,340 318,360 326,376 C334,376 340,374 346,370 C350,354 350,334 348,316 Z" },
  { id: "calves_soleus",  d: "M256,378 C264,376 278,376 282,380 C282,392 278,402 274,408 C268,406 262,406 258,408 C254,402 252,392 256,378 Z M344,378 C336,376 322,376 318,380 C318,392 322,402 326,408 C332,406 338,406 342,408 C346,402 348,392 344,378 Z" },

  // ──── BACK: abductors (outer hip) ────
  { id: "abductors",    d: "M236,196 C242,194 246,196 248,200 L248,228 C246,232 240,232 236,228 Z M364,196 C358,194 354,196 352,200 L352,228 C354,232 360,232 364,228 Z" },
]

export function MuscleSVG({ primary, secondary }: Props) {
  const [hover, setHover] = useState<MuscleId | null>(null)
  const pSet = new Set(primary)
  const sSet = new Set(secondary)

  function fill(id: MuscleId): string {
    if (pSet.has(id)) return "var(--orange)"
    if (sSet.has(id)) return "var(--green)"
    return "rgba(255,255,255,0.04)"
  }
  function stroke(id: MuscleId): string {
    if (pSet.has(id)) return "var(--orange)"
    if (sSet.has(id)) return "var(--green)"
    return "rgba(255,255,255,0.14)"
  }

  return (
    <div className="mmSvgWrap" style={{ width: "100%", maxWidth: 380 }}>
      <svg viewBox="0 0 400 420" width="100%" height="auto" aria-label="Muscle map" role="img">
        <defs>
          {/* Soft glow filter for highlighted muscles */}
          <filter id="mmGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* View labels */}
        <text x={100} y={12} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={9} fontWeight={700} letterSpacing={1.5}>FRONT</text>
        <text x={300} y={12} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={9} fontWeight={700} letterSpacing={1.5}>BACK</text>

        {/* Body silhouettes */}
        <path d={FRONT_BODY} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.22)" strokeWidth={0.8} strokeLinejoin="round" />
        <path d={buildBackBody(200)} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.22)" strokeWidth={0.8} strokeLinejoin="round" />

        {/* Muscle regions on top */}
        {REGIONS.map((r) => {
          const isHi = pSet.has(r.id) || sSet.has(r.id)
          return (
            <path
              key={r.id}
              d={r.d}
              fill={fill(r.id)}
              stroke={stroke(r.id)}
              strokeWidth={isHi ? 1 : 0.5}
              opacity={hover && hover !== r.id && !isHi ? 0.3 : 1}
              filter={isHi ? "url(#mmGlow)" : undefined}
              style={{ cursor: "pointer", transition: "opacity 120ms" }}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((cur) => (cur === r.id ? null : r.id))}
            >
              <title>{MUSCLE_LABELS[r.id]}</title>
            </path>
          )
        })}

        {/* Tooltip on hover */}
        {hover ? (
          <g pointerEvents="none">
            <rect x={110} y={398} width={180} height={20} rx={5} fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.18)" />
            <text x={200} y={412} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>
              {MUSCLE_LABELS[hover]}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  )
}
