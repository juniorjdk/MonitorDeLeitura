import { useCallback, useEffect, useState } from 'react'

const KEY = 'bpwa-plans-v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { plans: [], activeId: null }
    const data = JSON.parse(raw)
    if (!Array.isArray(data.plans)) return { plans: [], activeId: null }
    return { plans: data.plans, activeId: data.activeId ?? data.plans[0]?.id ?? null }
  } catch {
    return { plans: [], activeId: null }
  }
}

export function usePlans() {
  const [plans, setPlans] = useState(() => load().plans)
  const [activeId, setActiveId] = useState(() => load().activeId)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ plans, activeId }))
    } catch {
      // armazenamento cheio/bloqueado: mantém em memória
    }
  }, [plans, activeId])

  // Protege os dados contra limpezas automáticas do navegador
  useEffect(() => {
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {})
  }, [])

  const active = plans.find((p) => p.id === activeId) || plans[0] || null

  const addPlan = useCallback((plan) => {
    setPlans((prev) => [...prev, plan])
    setActiveId(plan.id)
  }, [])

  const updatePlan = useCallback((id, updater) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const next = typeof updater === 'function' ? updater(p) : updater
        return { ...next, updatedAt: new Date().toISOString() }
      })
    )
  }, [])

  const removePlan = useCallback(
    (id) => {
      setPlans((prev) => {
        const next = prev.filter((p) => p.id !== id)
        if (activeId === id) setActiveId(next[0]?.id ?? null)
        return next
      })
    },
    [activeId]
  )

  const toggleDay = useCallback(
    (dayN) => {
      if (!active) return
      updatePlan(active.id, (p) => ({
        ...p,
        days: p.days.map((d) =>
          d.n === dayN ? { ...d, done: !d.done, doneAt: !d.done ? new Date().toISOString() : null } : d
        )
      }))
    },
    [active, updatePlan]
  )

  const addFreeEntry = useCallback(
    (entry) => {
      if (!active) return
      updatePlan(active.id, (p) => ({ ...p, entries: [...p.entries, entry] }))
    },
    [active, updatePlan]
  )

  const removeFreeEntry = useCallback(
    (entryId) => {
      if (!active) return
      updatePlan(active.id, (p) => ({ ...p, entries: p.entries.filter((e) => e.id !== entryId) }))
    },
    [active, updatePlan]
  )

  const replaceAll = useCallback((nextPlans, nextActiveId) => {
    setPlans(nextPlans)
    setActiveId(nextActiveId ?? nextPlans[0]?.id ?? null)
  }, [])

  return {
    plans,
    active,
    activeId,
    setActiveId,
    addPlan,
    updatePlan,
    removePlan,
    toggleDay,
    addFreeEntry,
    removeFreeEntry,
    replaceAll
  }
}
