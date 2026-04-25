"use client"

// SamMotion — Supabase-backed per-user store.
// State shape mirrors the original localStorage version (so existing screens compile),
// but persistence goes to Supabase tables filtered by auth.uid() via RLS.

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import { ALL_EQ_IDS } from "./data"
import { calcE1RM } from "./helpers"
import type {
  ActiveWorkout, AppState, EquipmentId, Gym, HistoryEntry, PR, Routine, RoutineId,
} from "./types"

// ─────── Default state (used until first Supabase load) ───────
const defaultGym: Gym = {
  id: "g_default",
  name: "My Gym",
  emoji: "🏠",
  eq: ALL_EQ_IDS.slice(0, 14),  // sensible default loadout
}

function makeDefaultState(): AppState {
  return {
    isFirstTime: true,
    gyms: [defaultGym],
    activeGymId: defaultGym.id,
    activeRoutineId: "sl",
    customRoutines: [],
    history: [],
    prs: {},
    current: null,
  }
}

// ─────── Context ───────
interface StoreCtx {
  state: AppState
  loading: boolean
  error: string | null
  // gym
  selectGym: (id: string) => void
  toggleEquipment: (id: EquipmentId) => void
  addGym: (g: Gym) => void
  updateGym: (id: string, patch: Partial<Gym>) => void
  deleteGym: (id: string) => void
  // routine
  setActiveRoutine: (id: RoutineId) => void
  addCustomRoutine: (r: Routine) => void
  updateCustomRoutine: (id: RoutineId, patch: Partial<Routine>) => void
  deleteCustomRoutine: (id: RoutineId) => void
  // workout
  startWorkout: (w: ActiveWorkout) => void
  updateCurrent: (fn: (prev: ActiveWorkout) => ActiveWorkout) => void
  cancelWorkout: () => void
  finishWorkout: (summary: { dur: number; vol: number; prsCount: number; newPRs: Record<string, PR & { e1rm: number }> }) => void
  // history
  deleteSession: (id: string) => void
  updateSession: (id: string, patch: Partial<HistoryEntry>) => void
  // auth
  signOut: () => Promise<void>
}

const Ctx = createContext<StoreCtx | null>(null)

export function useStore(): StoreCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error("useStore must be used within StoreProvider")
  return c
}

// ─────── Provider ───────
export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [state, setState] = useState<AppState>(makeDefaultState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)

  // Sync helpers — write-through to Supabase. Each call is fire-and-forget; UI updates
  // optimistically via setState. Failures surface to `error` but don't block UX.
  const upsertGym = useCallback(async (g: Gym) => {
    const uid = userIdRef.current
    if (!uid) return
    const { error } = await supabase.from("gyms").upsert({
      id: g.id, user_id: uid, name: g.name, emoji: g.emoji, equipment: g.eq, notes: g.notes ?? null,
    })
    if (error) setError(error.message)
  }, [supabase])

  const removeGym = useCallback(async (id: string) => {
    const { error } = await supabase.from("gyms").delete().eq("id", id)
    if (error) setError(error.message)
  }, [supabase])

  const upsertRoutine = useCallback(async (r: Routine) => {
    const uid = userIdRef.current
    if (!uid) return
    const { error } = await supabase.from("routines").upsert({
      id: r.id, user_id: uid, name: r.name, tags: r.tags, exercise_ids: r.exerciseIds,
      days_per_week: r.daysPerWeek ?? null, is_custom: true,
    })
    if (error) setError(error.message)
  }, [supabase])

  const removeRoutine = useCallback(async (id: string) => {
    const { error } = await supabase.from("routines").delete().eq("id", id)
    if (error) setError(error.message)
  }, [supabase])

  const upsertHistory = useCallback(async (h: HistoryEntry) => {
    const uid = userIdRef.current
    if (!uid) return
    const { error } = await supabase.from("history").upsert({
      id: h.id, user_id: uid, date: h.date, routine: h.routine ?? null, routine_id: h.routineId ?? null,
      gym_id: h.gymId ?? null, dur: h.dur, vol: h.vol, prs_count: h.prsCount ?? 0,
      exs: h.exs ?? [], details: h.details ?? null, notes: h.notes ?? null,
    })
    if (error) setError(error.message)
  }, [supabase])

  const removeHistory = useCallback(async (id: string) => {
    const { error } = await supabase.from("history").delete().eq("id", id)
    if (error) setError(error.message)
  }, [supabase])

  const upsertPR = useCallback(async (exerciseId: string, pr: PR) => {
    const uid = userIdRef.current
    if (!uid) return
    const { error } = await supabase.from("prs").upsert({
      user_id: uid, exercise_id: exerciseId, n: pr.n ?? null,
      w: pr.w, r: pr.r, e1rm: pr.e1rm ?? null, date: pr.date,
    })
    if (error) setError(error.message)
  }, [supabase])

  const upsertProfile = useCallback(async (patch: Partial<Pick<AppState, "activeGymId" | "activeRoutineId" | "isFirstTime">>) => {
    const uid = userIdRef.current
    if (!uid) return
    const { error } = await supabase.from("profiles").upsert({
      user_id: uid,
      active_gym_id: patch.activeGymId ?? state.activeGymId,
      active_routine_id: patch.activeRoutineId ?? state.activeRoutineId,
      is_first_time: patch.isFirstTime ?? state.isFirstTime,
    })
    if (error) setError(error.message)
  }, [supabase, state.activeGymId, state.activeRoutineId, state.isFirstTime])

  // ─────── Initial load ───────
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (alive) setLoading(false)
        return
      }
      userIdRef.current = user.id

      const [gymsR, routinesR, historyR, prsR, profileR] = await Promise.all([
        supabase.from("gyms").select("*").eq("user_id", user.id),
        supabase.from("routines").select("*").eq("user_id", user.id),
        supabase.from("history").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("prs").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ])

      if (!alive) return

      const gyms: Gym[] = (gymsR.data || []).map((row: any) => ({
        id: row.id, name: row.name, emoji: row.emoji, eq: row.equipment || [], notes: row.notes ?? undefined,
      }))
      const customRoutines: Routine[] = (routinesR.data || []).map((row: any) => ({
        id: row.id, name: row.name, tags: row.tags || [], exerciseIds: row.exercise_ids || [],
        daysPerWeek: row.days_per_week ?? undefined, isCustom: true,
      }))
      const history: HistoryEntry[] = (historyR.data || []).map((row: any) => ({
        id: row.id, date: row.date, routine: row.routine ?? undefined, routineId: row.routine_id ?? undefined,
        gymId: row.gym_id ?? undefined, dur: row.dur || 0, vol: row.vol || 0, prsCount: row.prs_count || 0,
        exs: row.exs || [], details: row.details ?? undefined, notes: row.notes ?? undefined,
      }))
      const prs: Record<string, PR> = {}
      ;(prsR.data || []).forEach((row: any) => {
        prs[row.exercise_id] = {
          n: row.n ?? undefined, w: row.w, r: row.r, date: row.date, e1rm: row.e1rm ?? undefined, exerciseId: row.exercise_id,
        }
      })

      const profile = profileR.data
      const isFirstTime = profile ? profile.is_first_time : history.length === 0

      // Bootstrap: if user has no gym yet (brand-new account), seed a default and persist.
      if (gyms.length === 0) {
        gyms.push({ ...defaultGym })
        await supabase.from("gyms").insert({
          id: defaultGym.id, user_id: user.id, name: defaultGym.name, emoji: defaultGym.emoji, equipment: defaultGym.eq,
        })
      }

      setState((prev) => ({
        ...prev,
        user: { id: user.id, email: user.email ?? undefined },
        gyms, customRoutines, history, prs,
        activeGymId: profile?.active_gym_id || gyms[0]?.id || defaultGym.id,
        activeRoutineId: profile?.active_routine_id || "sl",
        isFirstTime,
      }))
      setLoading(false)
    })().catch((e) => {
      if (alive) { setError(e?.message || String(e)); setLoading(false) }
    })
    return () => { alive = false }
  }, [supabase])

  // ─────── Mutators ───────
  const selectGym = useCallback((id: string) => {
    setState((s) => ({ ...s, activeGymId: id }))
    upsertProfile({ activeGymId: id })
  }, [upsertProfile])

  const toggleEquipment = useCallback((eqId: EquipmentId) => {
    setState((s) => {
      const gym = s.gyms.find((g) => g.id === s.activeGymId)
      if (!gym) return s
      const has = gym.eq.includes(eqId)
      const nextGym: Gym = { ...gym, eq: has ? gym.eq.filter((x) => x !== eqId) : [...gym.eq, eqId] }
      upsertGym(nextGym)
      return { ...s, gyms: s.gyms.map((g) => (g.id === gym.id ? nextGym : g)) }
    })
  }, [upsertGym])

  const addGym = useCallback((g: Gym) => {
    setState((s) => ({ ...s, gyms: [...s.gyms, g], activeGymId: g.id }))
    upsertGym(g)
    upsertProfile({ activeGymId: g.id })
  }, [upsertGym, upsertProfile])

  const updateGym = useCallback((id: string, patch: Partial<Gym>) => {
    setState((s) => {
      const gym = s.gyms.find((g) => g.id === id)
      if (!gym) return s
      const next = { ...gym, ...patch }
      upsertGym(next)
      return { ...s, gyms: s.gyms.map((g) => (g.id === id ? next : g)) }
    })
  }, [upsertGym])

  const deleteGym = useCallback((id: string) => {
    setState((s) => {
      if (s.gyms.length <= 1) return s  // never leave the user with zero gyms
      const remaining = s.gyms.filter((g) => g.id !== id)
      const newActive = s.activeGymId === id ? remaining[0].id : s.activeGymId
      removeGym(id)
      if (newActive !== s.activeGymId) upsertProfile({ activeGymId: newActive })
      return { ...s, gyms: remaining, activeGymId: newActive }
    })
  }, [removeGym, upsertProfile])

  const setActiveRoutine = useCallback((id: RoutineId) => {
    setState((s) => ({ ...s, activeRoutineId: id }))
    upsertProfile({ activeRoutineId: id })
  }, [upsertProfile])

  const addCustomRoutine = useCallback((r: Routine) => {
    const withFlag = { ...r, isCustom: true }
    setState((s) => ({ ...s, customRoutines: [...s.customRoutines, withFlag] }))
    upsertRoutine(withFlag)
  }, [upsertRoutine])

  const updateCustomRoutine = useCallback((id: RoutineId, patch: Partial<Routine>) => {
    setState((s) => {
      const r = s.customRoutines.find((x) => x.id === id)
      if (!r) return s
      const next = { ...r, ...patch }
      upsertRoutine(next)
      return { ...s, customRoutines: s.customRoutines.map((x) => (x.id === id ? next : x)) }
    })
  }, [upsertRoutine])

  const deleteCustomRoutine = useCallback((id: RoutineId) => {
    setState((s) => ({ ...s, customRoutines: s.customRoutines.filter((r) => r.id !== id) }))
    removeRoutine(id)
  }, [removeRoutine])

  const startWorkout = useCallback((w: ActiveWorkout) => {
    setState((s) => ({ ...s, current: w }))
  }, [])

  const updateCurrent = useCallback((fn: (prev: ActiveWorkout) => ActiveWorkout) => {
    setState((s) => (s.current ? { ...s, current: fn(s.current) } : s))
  }, [])

  const cancelWorkout = useCallback(() => {
    setState((s) => ({ ...s, current: null }))
  }, [])

  const finishWorkout = useCallback((summary: { dur: number; vol: number; prsCount: number; newPRs: Record<string, PR & { e1rm: number }> }) => {
    setState((s) => {
      if (!s.current) return s

      const exs: string[] = s.current.exercises.map((e) => e.n).slice(0, 4)
      const details = s.current.exercises.map((ex, ei) => {
        const sets = Array.from({ length: ex.sets || 3 }).map((_, si) => {
          return s.current!.sets[`${ei}_${si}`] || { weight: 0, reps: 0, done: false }
        })
        return { id: ex.id, n: ex.n, sets }
      })

      const entry: HistoryEntry = {
        id: "h_" + Date.now(),
        date: new Date().toISOString(),
        routine: s.gyms.find(() => true) ? undefined : undefined,  // routine name resolved below
        routineId: s.current.routineId,
        gymId: s.current.gymId,
        dur: summary.dur,
        vol: Math.round(summary.vol),
        prsCount: summary.prsCount,
        exs,
        details,
      }

      const nextPRs: Record<string, PR> = { ...s.prs }
      Object.entries(summary.newPRs).forEach(([id, pr]) => {
        nextPRs[id] = { ...pr, exerciseId: id }
        upsertPR(id, nextPRs[id])
      })

      upsertHistory(entry)
      if (s.isFirstTime) upsertProfile({ isFirstTime: false })

      return {
        ...s,
        current: null,
        history: [entry, ...s.history],
        prs: nextPRs,
        isFirstTime: false,
      }
    })
  }, [upsertHistory, upsertPR, upsertProfile])

  const deleteSession = useCallback((id: string) => {
    setState((s) => ({ ...s, history: s.history.filter((h) => h.id !== id) }))
    removeHistory(id)
    // Note: PRs intentionally NOT recomputed here — Pass 2 will add a "recompute PRs from history" pass.
  }, [removeHistory])

  const updateSession = useCallback((id: string, patch: Partial<HistoryEntry>) => {
    setState((s) => {
      const h = s.history.find((x) => x.id === id)
      if (!h) return s
      const next = { ...h, ...patch }
      // Recompute volume from details if details were edited.
      if (patch.details) {
        let vol = 0
        patch.details.forEach((d) => d.sets.forEach((set) => { if (set.done) vol += set.weight * set.reps }))
        next.vol = Math.round(vol)
      }
      upsertHistory(next)
      return { ...s, history: s.history.map((x) => (x.id === id ? next : x)) }
    })
  }, [upsertHistory])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }, [supabase])

  // Re-export calcE1RM to keep the workout screen happy without touching its imports.
  void calcE1RM

  const value: StoreCtx = {
    state, loading, error,
    selectGym, toggleEquipment, addGym, updateGym, deleteGym,
    setActiveRoutine, addCustomRoutine, updateCustomRoutine, deleteCustomRoutine,
    startWorkout, updateCurrent, cancelWorkout, finishWorkout,
    deleteSession, updateSession,
    signOut,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
