// SamMotion — pure helpers (no React, no Supabase).

import { EX, ROUTINES, ROUTINE_PRIORITY, SAMPLE_HISTORY, SAMPLE_PRS } from "./data"
import type { AppState, ExerciseWithId, Gym, RoutineId } from "./types"

// ───────── Math ─────────
// Brzycki estimated 1-rep max — well-behaved for reps ≤ 10.
export function calcE1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0
  if (reps === 1) return Math.round(weight)
  return Math.round((weight * 36) / (37 - reps))
}

// ───────── Formatting ─────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso || "—"
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function fmtDay(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return DAYS[d.getDay()]
}

export function fmtVol(kg: number): string {
  if (kg >= 1000) return (kg / 1000).toFixed(1) + "k"
  return Math.round(kg).toString()
}

export function fmtDur(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}

export function daysSince(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const ms = Date.now() - d.getTime()
  const days = Math.floor(ms / 86400000)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

// ───────── State queries ─────────
export function getActiveGym(state: AppState): Gym {
  return state.gyms.find((g) => g.id === state.activeGymId) || state.gyms[0]
}

export function hasEq(gymEq: string[], req: string[]): boolean {
  if (!req || req.length === 0) return true
  // bw is implicit — every gym has bodyweight.
  if (req.includes("bw")) return true
  return req.some((r) => gymEq.includes(r))
}

// Round-robin next routine: rotate through built-in routines based on real history count.
export function getNextRoutine(state: AppState): RoutineId {
  const real = state.history.filter((w) => !w.sample)
  const recents = real.slice(-3).map((w) => w.routineId).filter(Boolean) as RoutineId[]
  const builtins: RoutineId[] = ROUTINES.map((r) => r.id)
  // Prefer the one not used most recently.
  for (const id of builtins) {
    if (!recents.includes(id)) return id
  }
  return builtins[real.length % builtins.length] || "sl"
}

// Pick exercises for a routine that the active gym supports.
export function getExsForWorkout(state: AppState, gymId: string, routineId: RoutineId): ExerciseWithId[] {
  const gym = state.gyms.find((g) => g.id === gymId) || state.gyms[0]
  if (!gym) return []

  // 1) Custom routine? Use its declared ids in order, filtered by equipment.
  const custom = state.customRoutines.find((r) => r.id === routineId)
  if (custom) {
    return custom.exerciseIds
      .filter((id) => EX[id] && hasEq(gym.eq, EX[id].req))
      .map((id) => ({ id, ...EX[id] }))
  }

  // 2) Built-in routine — start from the routine list, then top up from priority list.
  const r = ROUTINES.find((x) => x.id === routineId)
  const initial = r ? r.exerciseIds : []
  const priorityList = ROUTINE_PRIORITY[routineId] || []
  const seen = new Set<string>()
  const out: ExerciseWithId[] = []

  for (const id of [...initial, ...priorityList]) {
    if (seen.has(id)) continue
    if (!EX[id]) continue
    if (!hasEq(gym.eq, EX[id].req)) continue
    seen.add(id)
    out.push({ id, ...EX[id] })
    if (out.length >= 8) break
  }
  return out
}

// ───────── First-time / sample handling ─────────
export function getHistoryToShow(state: AppState) {
  const real = state.history.filter((w) => !w.sample)
  if (real.length > 0) return real
  if (state.isFirstTime) return SAMPLE_HISTORY
  return real
}

export function getPRsToShow(state: AppState) {
  const realKeys = Object.keys(state.prs).filter((k) => !state.prs[k]?.sample)
  if (realKeys.length > 0) return state.prs
  if (state.isFirstTime) return SAMPLE_PRS as typeof state.prs
  return state.prs
}

// ───────── Streak (ISO weeks, Mon = start) ─────────
function mondayOf(d: Date): Date {
  const x = new Date(d)
  const dow = (x.getDay() + 6) % 7  // Mon = 0
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - dow)
  return x
}

export function calcWeekStreak(state: AppState): { streak: number; thisWeek: number } {
  const real = state.history.filter((w) => !w.sample)
  if (real.length === 0) return { streak: 0, thisWeek: 0 }

  const weekMap = new Map<string, number>()
  for (const w of real) {
    const d = new Date(w.date)
    if (Number.isNaN(d.getTime())) continue
    const key = mondayOf(d).toISOString().slice(0, 10)
    weekMap.set(key, (weekMap.get(key) || 0) + 1)
  }

  const thisWeekKey = mondayOf(new Date()).toISOString().slice(0, 10)
  const thisWeek = weekMap.get(thisWeekKey) || 0

  // Walk backwards from this week — count consecutive weeks with ≥3 sessions.
  let streak = 0
  const cursor = mondayOf(new Date())
  // If this week already qualifies, count it. Otherwise streak is 0 unless prior week qualifies.
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    const count = weekMap.get(key) || 0
    if (count >= 3) {
      streak++
      cursor.setDate(cursor.getDate() - 7)
    } else {
      break
    }
  }
  return { streak, thisWeek }
}
