// ---------- datas (sempre no fuso local, sem UTC) ----------
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const todayISO = () => toISO(new Date())

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const fmtBR = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

export const addDaysISO = (iso, n) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const diffDays = (aISO, bISO) =>
  Math.round((parseISO(bISO) - parseISO(aISO)) / 86400000)

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

// ---------- distribuição proporcional (mesma lógica da Bíblia) ----------
function distribute(total, nDays) {
  const base = Math.floor(total / nDays)
  const rem = total % nDays
  return Array.from({ length: nDays }, (_, i) => base + (i < rem ? 1 : 0))
}

// ---------- geração de livro ----------
export function generateBook({
  title,
  author,
  unit, // 'paginas' | 'capitulos'
  total,
  mode, // 'days' | 'date' | 'free'
  startDate,
  totalDays,
  endDate
}) {
  if (!title?.trim()) throw new Error('Título é obrigatório.')
  if (!['paginas', 'capitulos'].includes(unit)) throw new Error('Unidade deve ser "paginas" ou "capitulos".')
  if (!Number.isInteger(total) || total <= 0) throw new Error('Total deve ser um inteiro maior que zero.')
  if (!['days', 'date', 'free'].includes(mode)) throw new Error('Modo deve ser "days", "date" ou "free".')

  let days = totalDays
  let end = endDate

  if (mode === 'date') {
    days = diffDays(startDate, endDate) + 1
    if (days < 1) throw new Error('A data final deve ser igual ou posterior ao início.')
  } else if (mode === 'days') {
    if (!days || days < 1) throw new Error('Informe uma quantidade de dias válida.')
    end = addDaysISO(startDate, days - 1)
  } else {
    // mode === 'free'
    days = null
    end = null
  }

  const now = new Date().toISOString()
  const avgPerDay = days ? Math.round((total / days) * 10) / 10 : null

  if (mode === 'free') {
    return {
      id: uid(),
      title: title.trim(),
      author: author?.trim() || '',
      unit,
      total,
      status: 'lendo',
      mode,
      startDate,
      endDate: null,
      totalDays: null,
      avgPerDay: null,
      days: [],
      entries: [],
      createdAt: now,
      updatedAt: now
    }
  }

  // mode === 'days' | 'date'
  const loads = distribute(total, days)
  const planDays = []
  let position = 1

  for (let i = 0; i < days; i++) {
    const qty = loads[i]
    const startLabel = position
    const endLabel = position + qty - 1
    planDays.push({
      n: i + 1,
      date: addDaysISO(startDate, i),
      startLabel,
      endLabel,
      qty,
      done: false,
      doneAt: null
    })
    position = endLabel + 1
  }

  return {
    id: uid(),
    title: title.trim(),
    author: author?.trim() || '',
    unit,
    total,
    status: 'lendo',
    mode,
    startDate,
    endDate: end,
    totalDays: days,
    avgPerDay,
    days: planDays,
    entries: [],
    createdAt: now,
    updatedAt: now
  }
}

// ---------- estatísticas ----------
export function bookStats(book, refISO = todayISO()) {
  if (book.mode === 'free') {
    const maxPosition = book.entries.length
      ? Math.max(...book.entries.map((e) => e.position))
      : 0
    const pct = book.total ? (maxPosition / book.total) * 100 : 0
    return {
      doneDays: book.entries.length,
      totalDays: null,
      pctDays: pct,
      unitsRead: maxPosition,
      unitsLeft: Math.max(0, book.total - maxPosition),
      pctUnits: pct,
      overdue: 0,
      todayDay: null,
      nextDay: null
    }
  }

  const done = book.days.filter((d) => d.done)
  const unitsRead = done.reduce((a, d) => a + d.qty, 0)
  const overdueDays = book.days.filter((d) => !d.done && d.date < refISO)
  const todayDay = book.days.find((d) => d.date === refISO) || null
  const nextDay =
    book.days.find((d) => !d.done && d.date >= refISO) ||
    book.days.find((d) => !d.done) ||
    null

  return {
    doneDays: done.length,
    totalDays: book.days.length,
    pctDays: book.days.length ? (done.length / book.days.length) * 100 : 0,
    unitsRead,
    unitsLeft: Math.max(0, book.total - unitsRead),
    pctUnits: book.total ? (unitsRead / book.total) * 100 : 0,
    overdue: overdueDays.length,
    todayDay,
    nextDay
  }
}

// ---------- status ----------
// Retorna true se o livro já foi totalmente lido, de acordo com o modo.
export function isBookComplete(book) {
  if (book.mode === 'free') {
    const maxPosition = book.entries.length
      ? Math.max(...book.entries.map((e) => e.position))
      : 0
    return book.total > 0 && maxPosition >= book.total
  }
  return book.days.length > 0 && book.days.every((d) => d.done)
}

// Recalcula e retorna o status correto ('concluido' ou 'lendo') com base no progresso atual.
// Nunca sobrescreve 'pausado' (esse é um estado manual do usuário).
export function withRecalculatedStatus(book) {
  if (book.status === 'pausado') return book
  const complete = isBookComplete(book)
  const status = complete ? 'concluido' : 'lendo'
  return status === book.status ? book : { ...book, status }
}

// ---------- recálculo ----------
function renumber(days) {
  days.forEach((d, i) => { d.n = i + 1 })
  return days
}

// Mantém a data final e redistribui o restante nos dias que sobram (a partir de hoje).
export function recalcKeepEndDate(book, refISO = todayISO()) {
  if (book.mode === 'free') return { book, changed: false }

  const firstOpen = book.days.find((d) => !d.done)
  if (!firstOpen) return { book, changed: false }

  const unitsRead = book.days.filter((d) => d.done).reduce((a, d) => a + d.qty, 0)
  const remaining = book.total - unitsRead
  const cutoff = firstOpen.date > refISO ? firstOpen.date : refISO
  const nDays = diffDays(cutoff, book.endDate) + 1

  if (nDays < 1) throw new Error('O livro já passou da data final. Use "Prorrogar data final".')

  const kept = book.days.filter((d) => d.done)
  const loads = distribute(remaining, nDays)
  const fresh = loads.map((qty, i) => ({
    n: 0,
    date: addDaysISO(cutoff, i),
    startLabel: 0, // será preenchido abaixo
    endLabel: 0,
    qty,
    done: false,
    doneAt: null
  }))

  // Preencher startLabel/endLabel sequencialmente a partir da posição onde parou
  let pos = firstOpen.startLabel
  for (const d of fresh) {
    d.startLabel = pos
    d.endLabel = pos + d.qty - 1
    pos = d.endLabel + 1
  }

  const days = renumber([...kept, ...fresh])
  return {
    changed: true,
    book: {
      ...book,
      days,
      totalDays: days.length,
      avgPerDay: Math.round((remaining / nDays) * 10) / 10,
      startDate: days[0].date,
      updatedAt: new Date().toISOString()
    }
  }
}

// Mantém a média de unidades/dia e empurra a data final para frente.
export function recalcExtendEndDate(book, refISO = todayISO()) {
  if (book.mode === 'free') return { book, changed: false, newEnd: book.endDate }

  const firstOpen = book.days.find((d) => !d.done)
  if (!firstOpen) return { book, changed: false, newEnd: book.endDate }

  const unitsRead = book.days.filter((d) => d.done).reduce((a, d) => a + d.qty, 0)
  const remaining = book.total - unitsRead
  const avg = Math.max(1, Math.round(book.avgPerDay || remaining / book.days.length))
  const nDays = Math.max(1, Math.ceil(remaining / avg))
  const cutoff = firstOpen.date > refISO ? firstOpen.date : refISO

  const kept = book.days.filter((d) => d.done)
  const loads = distribute(remaining, nDays)
  const fresh = loads.map((qty, i) => ({
    n: 0,
    date: addDaysISO(cutoff, i),
    startLabel: 0,
    endLabel: 0,
    qty,
    done: false,
    doneAt: null
  }))

  let pos = firstOpen.startLabel
  for (const d of fresh) {
    d.startLabel = pos
    d.endLabel = pos + d.qty - 1
    pos = d.endLabel + 1
  }

  const days = renumber([...kept, ...fresh])
  const newEnd = days[days.length - 1].date

  return {
    changed: true,
    newEnd,
    book: {
      ...book,
      days,
      totalDays: days.length,
      endDate: newEnd,
      startDate: days[0].date,
      avgPerDay: Math.round((remaining / nDays) * 10) / 10,
      updatedAt: new Date().toISOString()
    }
  }
}

/*
// Exemplos de teste manual (descomente para testar no console):
//
// import * as B from './features/books/lib/books.js'
//
// // 1) generateBook - modo 'days'
// const book1 = B.generateBook({
//   title: 'O Hobbit',
//   author: 'J.R.R. Tolkien',
//   unit: 'paginas',
//   total: 312,
//   mode: 'days',
//   startDate: '2025-01-15',
//   totalDays: 20
// })
// console.log('book1:', book1)
//
// // 2) bookStats
// const stats = B.bookStats(book1, '2025-01-20')
// console.log('stats:', stats)
//
// // 3) recalcKeepEndDate
// const { book: book2, changed } = B.recalcKeepEndDate(book1, '2025-01-20')
// console.log('recalcKeepEndDate:', { changed, book: book2 })
//
// // 4) generateBook - modo 'free'
// const bookFree = B.generateBook({
//   title: '1984',
//   author: 'George Orwell',
//   unit: 'paginas',
//   total: 328,
//   mode: 'free',
//   startDate: '2025-01-15'
// })
// console.log('bookFree:', bookFree)
*/