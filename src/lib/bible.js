import raw from '../data/bible_structure.json'

export const BOOKS = raw.books
export const bookById = (id) => BOOKS.find((b) => b.id === id)

export const SCOPES = {
  full: 'Bíblia Toda',
  ot: 'Antigo Testamento',
  nt: 'Novo Testamento',
  custom: 'Seleção Customizada'
}

export function booksForScope(scope, customIds = []) {
  if (scope === 'ot') return BOOKS.filter((b) => b.testament === 'AT')
  if (scope === 'nt') return BOOKS.filter((b) => b.testament === 'NT')
  if (scope === 'custom') {
    const set = new Set(customIds)
    return BOOKS.filter((b) => set.has(b.id))
  }
  return BOOKS
}

export const scopeVerses = (scope, customIds = []) =>
  booksForScope(scope, customIds).reduce((a, b) => a + b.totalVerses, 0)

// ---------- datas (sempre no fuso local, sem UTC) ----------
export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

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

// ---------- mapa ordinal -> referência ----------
// Ordinal = posição do versículo dentro do escopo do plano (1-based).
// Pré-calcula faixas cumulativas por (livro, capítulo) para conversão O(log n).
export function buildVerseIndex(books) {
  const ranges = [] // {bookId, name, chapter, start, end}
  let acc = 0
  for (const b of books) {
    b.verses.forEach((v, i) => {
      ranges.push({ bookId: b.id, name: b.name, chapter: i + 1, start: acc + 1, end: acc + v })
      acc += v
    })
  }
  return { ranges, total: acc }
}

export function ordinalToRef(index, ordinal) {
  let lo = 0
  let hi = index.ranges.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const r = index.ranges[mid]
    if (ordinal < r.start) hi = mid - 1
    else if (ordinal > r.end) lo = mid + 1
    else return { book: r.name, chapter: r.chapter, verse: ordinal - r.start + 1 }
  }
  const last = index.ranges[index.ranges.length - 1]
  return { book: last.name, chapter: last.chapter, verse: last.end - last.start + 1 }
}

export const refLabel = (r) => `${r.book} ${r.chapter}:${r.verse}`

// Versículos entre dois pontos (inclusive) dentro de um livro — p/ leitura livre
export function countVersesInRange(bookId, sCh, sV, eCh, eV) {
  const b = bookById(bookId)
  if (!b) return 0
  if (sCh === eCh) return Math.max(0, eV - sV + 1)
  let n = b.verses[sCh - 1] - sV + 1
  for (let c = sCh + 1; c < eCh; c++) n += b.verses[c - 1]
  n += eV
  return n
}

// ---------- geração proporcional ----------
function distribute(totalVerses, nDays) {
  const base = Math.floor(totalVerses / nDays)
  const rem = totalVerses % nDays
  return Array.from({ length: nDays }, (_, i) => base + (i < rem ? 1 : 0))
}

export function generatePlan({ name, scope, bookIds = [], startDate, totalDays, endDate, mode = 'days' }) {
  const books = booksForScope(scope, bookIds)
  if (books.length === 0) throw new Error('Selecione ao menos um livro.')
  const index = buildVerseIndex(books)
  const totalVerses = index.total

  let days = totalDays
  let end = endDate
  if (mode === 'date') {
    days = diffDays(startDate, endDate) + 1
    if (days < 1) throw new Error('A data final deve ser igual ou posterior ao início.')
  } else {
    if (!days || days < 1) throw new Error('Informe uma quantidade de dias válida.')
    end = addDaysISO(startDate, days - 1)
  }

  const loads = distribute(totalVerses, days)
  const planDays = []
  let ord = 1
  for (let i = 0; i < days; i++) {
    const verses = loads[i]
    const startOrd = ord
    const endOrd = ord + verses - 1
    const startRef = ordinalToRef(index, startOrd)
    const endRef = ordinalToRef(index, endOrd)
    planDays.push({
      n: i + 1,
      date: addDaysISO(startDate, i),
      startOrd,
      endOrd,
      verses,
      startLabel: refLabel(startRef),
      endLabel: refLabel(endRef),
      done: false,
      doneAt: null
    })
    ord = endOrd + 1
  }

  const now = new Date().toISOString()
  return {
    id: uid(),
    name: name?.trim() || 'Meu plano',
    scope,
    bookIds: books.map((b) => b.id),
    mode,
    startDate,
    endDate: end,
    totalDays: days,
    totalVerses,
    avgPerDay: Math.round((totalVerses / days) * 10) / 10,
    days: planDays,
    entries: [],
    createdAt: now,
    updatedAt: now
  }
}

// ---------- estatísticas ----------
export function planStats(plan, refISO = todayISO()) {
  if (plan.mode === 'free') {
    const read = plan.entries.reduce((a, e) => a + e.verses, 0)
    const pct = plan.totalVerses ? (read / plan.totalVerses) * 100 : 0
    return {
      doneDays: plan.entries.length,
      totalDays: plan.totalVerses,
      pctDays: pct,
      versesRead: read,
      versesLeft: Math.max(0, plan.totalVerses - read),
      pctVerses: pct,
      overdue: 0,
      todayDay: null,
      nextDay: null
    }
  }
  const done = plan.days.filter((d) => d.done)
  const versesRead = done.reduce((a, d) => a + d.verses, 0)
  const overdueDays = plan.days.filter((d) => !d.done && d.date < refISO)
  const todayDay = plan.days.find((d) => d.date === refISO) || null
  const nextDay = plan.days.find((d) => !d.done && d.date >= refISO) || plan.days.find((d) => !d.done) || null
  return {
    doneDays: done.length,
    totalDays: plan.days.length,
    pctDays: plan.days.length ? (done.length / plan.days.length) * 100 : 0,
    versesRead,
    versesLeft: Math.max(0, plan.totalVerses - versesRead),
    pctVerses: plan.totalVerses ? (versesRead / plan.totalVerses) * 100 : 0,
    overdue: overdueDays.length,
    todayDay,
    nextDay
  }
}

// ---------- recálculo ----------
function rebuildFrom(plan, books, startOrd, startDateISO, loads) {
  const index = buildVerseIndex(books)
  let ord = startOrd
  return loads.map((verses, i) => {
    const endOrd = ord + verses - 1
    const startRef = ordinalToRef(index, ord)
    const endRef = ordinalToRef(index, endOrd)
    const day = {
      n: 0, // renumerado abaixo
      date: addDaysISO(startDateISO, i),
      startOrd: ord,
      endOrd,
      verses,
      startLabel: refLabel(startRef),
      endLabel: refLabel(endRef),
      done: false,
      doneAt: null
    }
    ord = endOrd + 1
    return day
  })
}

function renumber(days) {
  days.forEach((d, i) => { d.n = i + 1 })
  return days
}

// Mantém a data final e redistribui o restante nos dias que sobram (a partir de hoje).
export function recalcKeepEndDate(plan, refISO = todayISO()) {
  const books = booksForScope(plan.scope, plan.bookIds)
  const firstOpen = plan.days.find((d) => !d.done)
  if (!firstOpen) return { plan, changed: false }
  const versesRead = plan.days.filter((d) => d.done).reduce((a, d) => a + d.verses, 0)
  const remaining = plan.totalVerses - versesRead
  const cutoff = firstOpen.date > refISO ? firstOpen.date : refISO
  const nDays = diffDays(cutoff, plan.endDate) + 1
  if (nDays < 1) throw new Error('O plano já passou da data final. Use "Prorrogar data final".')
  const kept = plan.days.filter((d) => d.done)
  const fresh = rebuildFrom(plan, books, firstOpen.startOrd, cutoff, distribute(remaining, nDays))
  const days = renumber([...kept, ...fresh])
  return {
    changed: true,
    plan: {
      ...plan,
      days,
      totalDays: days.length,
      avgPerDay: Math.round((remaining / nDays) * 10) / 10,
      startDate: days[0].date,
      updatedAt: new Date().toISOString()
    }
  }
}

// Mantém a média de versículos/dia e empurra a data final para frente.
export function recalcExtendEndDate(plan, refISO = todayISO()) {
  const books = booksForScope(plan.scope, plan.bookIds)
  const firstOpen = plan.days.find((d) => !d.done)
  if (!firstOpen) return { plan, changed: false, newEnd: plan.endDate }
  const versesRead = plan.days.filter((d) => d.done).reduce((a, d) => a + d.verses, 0)
  const remaining = plan.totalVerses - versesRead
  const avg = Math.max(1, Math.round(plan.avgPerDay || remaining / plan.days.length))
  const nDays = Math.max(1, Math.ceil(remaining / avg))
  const cutoff = firstOpen.date > refISO ? firstOpen.date : refISO
  const kept = plan.days.filter((d) => d.done)
  const fresh = rebuildFrom(plan, books, firstOpen.startOrd, cutoff, distribute(remaining, nDays))
  const days = renumber([...kept, ...fresh])
  const newEnd = days[days.length - 1].date
  return {
    changed: true,
    newEnd,
    plan: {
      ...plan,
      days,
      totalDays: days.length,
      endDate: newEnd,
      startDate: days[0].date,
      avgPerDay: Math.round((remaining / nDays) * 10) / 10,
      updatedAt: new Date().toISOString()
    }
  }
}
