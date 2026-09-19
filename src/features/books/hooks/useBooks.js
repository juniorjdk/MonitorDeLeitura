import { useCallback, useEffect, useState } from 'react'
import {
  generateBook,
  recalcKeepEndDate,
  recalcExtendEndDate,
  withRecalculatedStatus,
  uid
} from '../lib/books.js'

const KEY = 'bpwa-books-v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { books: [], activeBookId: null }
    const data = JSON.parse(raw)
    if (!Array.isArray(data.books)) return { books: [], activeBookId: null }
    return { books: data.books, activeBookId: data.activeBookId ?? data.books[0]?.id ?? null }
  } catch {
    return { books: [], activeBookId: null }
  }
}

export function useBooks() {
  const [books, setBooks] = useState(() => load().books)
  const [activeBookId, setActiveBookId] = useState(() => load().activeBookId)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ books, activeBookId }))
    } catch {
      // armazenamento cheio/bloqueado: mantém em memória
    }
  }, [books, activeBookId])

  // Protege os dados contra limpezas automáticas do navegador
  useEffect(() => {
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {})
  }, [])

  const active = books.find((b) => b.id === activeBookId) || books[0] || null

  const addBook = useCallback((book) => {
    setBooks((prev) => [...prev, book])
    setActiveBookId(book.id)
  }, [])

  const updateBook = useCallback((id, updater) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const next = typeof updater === 'function' ? updater(b) : updater
        return { ...next, updatedAt: new Date().toISOString() }
      })
    )
  }, [])

  const removeBook = useCallback(
    (id) => {
      setBooks((prev) => {
        const next = prev.filter((b) => b.id !== id)
        if (activeBookId === id) setActiveBookId(next[0]?.id ?? null)
        return next
      })
    },
    [activeBookId]
  )

  // Marcar/desmarcar dia como concluído (modos 'days' | 'date')
  const toggleDay = useCallback(
    (dayN) => {
      if (!active || active.mode === 'free') return
      updateBook(active.id, (b) =>
        withRecalculatedStatus({
          ...b,
          days: b.days.map((d) =>
            d.n === dayN ? { ...d, done: !d.done, doneAt: !d.done ? new Date().toISOString() : null } : d
          )
        })
      )
    },
    [active, updateBook]
  )

  // Adicionar entrada de posição (modo 'free')
  const addPositionEntry = useCallback(
    (position, note) => {
      if (!active || active.mode !== 'free') return
      const entry = {
        id: uid(),
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD local
        position,
        note: note?.trim() || ''
      }
      updateBook(active.id, (b) => withRecalculatedStatus({ ...b, entries: [...b.entries, entry] }))
    },
    [active, updateBook]
  )

  // Remover entrada de posição e recalcular máximo
  const removePositionEntry = useCallback(
    (entryId) => {
      if (!active || active.mode !== 'free') return
      updateBook(active.id, (b) =>
        withRecalculatedStatus({ ...b, entries: b.entries.filter((e) => e.id !== entryId) })
      )
    },
    [active, updateBook]
  )

  // Recalcular mantendo data final
  const recalcKeepEnd = useCallback(() => {
    if (!active || active.mode === 'free') return
    const { book, changed } = recalcKeepEndDate(active)
    if (changed) updateBook(active.id, book)
  }, [active, updateBook])

  // Prorrogar data final mantendo média
  const recalcExtendEnd = useCallback(() => {
    if (!active || active.mode === 'free') return
    const { book, changed, newEnd } = recalcExtendEndDate(active)
    if (changed) updateBook(active.id, book)
  }, [active, updateBook])

  // Criar livro completo (usa generateBook de lib/books.js)
  const createBook = useCallback(
    (params) => {
      const book = generateBook(params)
      addBook(book)
      return book
    },
    [addBook]
  )

  const replaceAll = useCallback((nextBooks, nextActiveId) => {
    setBooks(nextBooks)
    setActiveBookId(nextActiveId ?? nextBooks[0]?.id ?? null)
  }, [])

  return {
    books,
    active,
    activeBookId,
    setActiveBookId,
    addBook,
    updateBook,
    removeBook,
    toggleDay,
    addPositionEntry,
    removePositionEntry,
    recalcKeepEnd,
    recalcExtendEnd,
    createBook,
    replaceAll
  }
}