"use client"

// Muscle map — wraps react-body-highlighter (a professional anatomical SVG).
// Sub-head MuscleIds collapse to the library's muscle-group names. Frequency
// drives intensity: primary = 2 (orange), secondary = 1 (green).

import { useMemo } from "react"
import Model, { type IExerciseData, type Muscle } from "react-body-highlighter"
import type { MuscleId } from "./types"

interface Props {
  primary: MuscleId[]
  secondary: MuscleId[]
}

// Map our granular MuscleIds → the library's muscle-group set.
const MUSCLE_MAP: Record<MuscleId, Muscle> = {
  chest_upper: "chest",
  chest_mid: "chest",
  chest_lower: "chest",
  lats: "upper-back",
  traps_upper: "trapezius",
  traps_mid: "trapezius",
  traps_lower: "trapezius",
  rhomboids: "upper-back",
  lower_back: "lower-back",
  rear_delts: "back-deltoids",
  delts_front: "front-deltoids",
  delts_side: "front-deltoids",
  biceps_long: "biceps",
  biceps_short: "biceps",
  brachialis: "biceps",
  triceps_long: "triceps",
  triceps_lateral: "triceps",
  triceps_medial: "triceps",
  forearms: "forearm",
  abs_upper: "abs",
  abs_lower: "abs",
  obliques: "obliques",
  glutes: "gluteal",
  quads_rf: "quadriceps",
  quads_vl: "quadriceps",
  quads_vm: "quadriceps",
  hamstrings_bf: "hamstring",
  hamstrings_sm: "hamstring",
  adductors: "adductor",   // library uses singular for this group
  abductors: "abductors",
  calves_gastroc: "calves",
  calves_soleus: "calves",
}

export function MuscleSVG({ primary, secondary }: Props) {
  const data = useMemo<IExerciseData[]>(() => {
    const primaryMuscles = Array.from(
      new Set(primary.map((id) => MUSCLE_MAP[id]).filter(Boolean) as Muscle[])
    )
    const secondaryMuscles = Array.from(
      new Set(secondary.map((id) => MUSCLE_MAP[id]).filter(Boolean) as Muscle[])
    )
    // The library colours by occurrence count: 2 occurrences → highlightedColors[1] (orange),
    // 1 occurrence → highlightedColors[0] (green). So we list primary muscles in two
    // separate "exercises" to bump their frequency to 2.
    return [
      { name: "primary-a", muscles: primaryMuscles },
      { name: "primary-b", muscles: primaryMuscles },
      { name: "secondary", muscles: secondaryMuscles },
    ]
  }, [primary, secondary])

  const sharedProps = {
    data,
    // Body fill for un-targeted muscles: subtle dark grey on dark theme.
    bodyColor: "#2a2a32",
    // [secondary green, primary orange] — matches SamMotion accent palette.
    highlightedColors: ["#3DD03A", "#FF6B2B"],
    hoverColor: "#FFB266",
  }

  return (
    <div className="mmSvgWrap">
      <div className="mmRow">
        <div className="mmFigure">
          <span className="mmLabel">FRONT</span>
          <Model {...sharedProps} type="anterior" style={{ width: "100%", maxWidth: 160 }} />
        </div>
        <div className="mmFigure">
          <span className="mmLabel">BACK</span>
          <Model {...sharedProps} type="posterior" style={{ width: "100%", maxWidth: 160 }} />
        </div>
      </div>
    </div>
  )
}
