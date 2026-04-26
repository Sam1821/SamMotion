"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { calcE1RM, fmtDate } from "@/lib/sammotion/helpers"
import { useStore } from "@/lib/sammotion/store"
import type { PR } from "@/lib/sammotion/types"
import { AddExerciseModal } from "./modals/add-exercise-modal"
import { AddGymModal } from "./modals/add-gym-modal"
import { FinishWorkoutModal, type FinishSummary } from "./modals/finish-workout-modal"
import { StartWizardModal } from "./modals/start-wizard-modal"
import { GymScreen } from "./screens/gym-screen"
import { HomeScreen } from "./screens/home-screen"
import { LogScreen } from "./screens/log-screen"
import { StatsScreen } from "./screens/stats-screen"
import { WorkoutScreen } from "./screens/workout-screen"
import { TabBar, type TabKey } from "./tab-bar"

export function SamMotionApp() {
  const { state } = useStore()
  const [tab, setTab] = useState<TabKey>("home")
  const [startOpen, setStartOpen] = useState(false)
  const [addGymOpen, setAddGymOpen] = useState(false)
  const [addExOpen, setAddExOpen] = useState(false)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)
  const [finishOpen, setFinishOpen] = useState(false)
  const [finishSummary, setFinishSummary] = useState<FinishSummary | null>(null)

  // Workout timer — lives here so it survives tab changes but not a page refresh.
  const [timerSec, setTimerSec] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.current) {
      if (!intervalRef.current) {
        const started = state.current.startTime || Date.now()
        setTimerSec(Math.floor((Date.now() - started) / 1000))
        intervalRef.current = setInterval(() => {
          setTimerSec(Math.floor((Date.now() - started) / 1000))
        }, 1000)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setTimerSec(0)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.current])

  const openStartWizard = useCallback(() => setStartOpen(true), [])

  const openFinish = useCallback(() => {
    if (!state.current) return
    let vol = 0
    let prsCount = 0
    const newPRs: Record<string, PR & { e1rm: number }> = {}
    state.current.exercises.forEach((ex, ei) => {
      for (let si = 0; si < (ex.sets || 3); si++) {
        const log = state.current!.sets[`${ei}_${si}`]
        if (log?.done) {
          vol += log.weight * log.reps
          const e1rm = calcE1RM(log.weight, log.reps)
          const prev = state.prs[ex.id]
          if (!prev || e1rm > (prev.e1rm || 0)) {
            newPRs[ex.id] = {
              n: ex.n,
              w: log.weight,
              r: log.reps,
              date: fmtDate(new Date().toISOString()),
              e1rm,
            }
            prsCount++
          }
        }
      }
    })
    setFinishSummary({ dur: timerSec, vol, prsCount, newPRs })
    setFinishOpen(true)
  }, [state.current, state.prs, timerSec])

  const onFinishSaved = useCallback(() => {
    setFinishOpen(false)
    setFinishSummary(null)
    setTab("home")
  }, [])

  return (
    <div className="sm-root">
      <div className="sm-stage">
        <main className="sm-app">
          <HomeScreen
            active={tab === "home"}
            onNavigate={setTab}
            onStartWorkout={openStartWizard}
          />
          <WorkoutScreen
            active={tab === "workout"}
            onStartWorkout={openStartWizard}
            onFinish={openFinish}
            onAddExercise={() => { setReplaceIndex(null); setAddExOpen(true) }}
            onReplaceExercise={(i) => { setReplaceIndex(i); setAddExOpen(true) }}
            timerSec={timerSec}
          />
          <GymScreen active={tab === "gym"} onAddGym={() => setAddGymOpen(true)} />
          <StatsScreen active={tab === "stats"} />
          <LogScreen active={tab === "log"} />

          <TabBar active={tab} onSelect={setTab} />

          <StartWizardModal
            open={startOpen}
            onClose={() => setStartOpen(false)}
            onStarted={() => setTab("workout")}
          />
          <AddGymModal open={addGymOpen} onClose={() => setAddGymOpen(false)} />
          <AddExerciseModal
            open={addExOpen}
            onClose={() => { setAddExOpen(false); setReplaceIndex(null) }}
            replaceIndex={replaceIndex}
          />
          <FinishWorkoutModal
            open={finishOpen}
            onClose={() => setFinishOpen(false)}
            summary={finishSummary}
            onSaved={onFinishSaved}
          />
        </main>
      </div>
    </div>
  )
}
