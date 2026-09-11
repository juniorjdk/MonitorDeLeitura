import { useMemo, useState } from 'react'
import {
  BOOKS, bookById, countVersesInRange, fmtBR, planStats,
  recalcExtendEndDate, recalcKeepEndDate, todayISO, uid
} from '../lib/bible'

export default function Dashboard({ plan, onToggleDay, onUpdatePlan, onAddEntry, onRemoveEntry }) {
  const today = todayISO()
  const stats = useMemo(() => planStats(plan, today), [plan, today])
  const [openBlocks, setOpenBlocks] = useState(() => new Set([currentBlock(plan, today)]))
  const [showRecalc, setShowRecalc] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState('')

  if (!plan) return null

  if (plan.mode === 'free') {
    return <FreePanel plan={plan} stats={stats} onAddEntry={onAddEntry} onRemoveEntry={onRemoveEntry} />
  }

  const blocks = []
  for (let i = 0; i < plan.days.length; i += 10) blocks.push(plan.days.slice(i, i + 10))
  const toggleBlock = (i) =>
    setOpenBlocks((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const doRecalc = (kind) => {
    setRecalcMsg('')
    try {
      const r = kind === 'keep' ? recalcKeepEndDate(plan, today) : recalcExtendEndDate(plan, today)
      if (!r.changed) {
        setRecalcMsg('Nada a recalcular: todos os dias estão concluídos. 🎉')
        return
      }
      onUpdatePlan(plan.id, r.plan)
      setRecalcMsg(
        kind === 'keep'
          ? `Plano redistribuído até ${fmtBR(r.plan.endDate)} (~${r.plan.avgPerDay} vs./dia).`
          : `Nova data final: ${fmtBR(r.newEnd)} (média de ~${r.plan.avgPerDay} vs./dia).`
      )
    } catch (err) {
      setRecalcMsg(err.message)
    }
  }

  const focus = stats.todayDay && !stats.todayDay.done ? stats.todayDay : stats.nextDay

  return (
    <div>
      {/* META DE HOJE */}
      {focus ? (
        <div className="rounded-2xl border border-todayborder bg-todaybg p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gold">
            {stats.todayDay && !stats.todayDay.done ? 'Meta de hoje' : stats.overdue > 0 ? `Em atraso — próxima meta (${stats.overdue} dia(s) pendentes)` : 'Próxima meta'}
          </div>
          <div className="mt-1 font-serif text-xl font-bold text-forestdeep">
            Dia {focus.n} · até {focus.endLabel}
          </div>
          <div className="mt-0.5 text-sm text-inksoft">
            {fmtBR(focus.date)} · {focus.verses} versículos · de {focus.startLabel}
          </div>
          <button
            onClick={() => onToggleDay(focus.n)}
            className="mt-3 w-full rounded-xl bg-forest py-2.5 font-semibold text-white active:scale-[.99]"
          >
            ✓ Concluir meta de hoje
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-forest bg-forest p-4 text-center text-white">
          <div className="font-serif text-xl font-bold">Plano concluído! 🎉</div>
          <div className="text-sm opacity-90">Você leu todos os {plan.totalVerses.toLocaleString('pt-BR')} versículos.</div>
        </div>
      )}

      {/* BARRA DE PROGRESSO */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[13px] text-inksoft">
          <span>Progresso do cronograma</span>
          <strong className="text-forestdeep">
            {stats.pctVerses.toFixed(1)}% · dia {Math.min(stats.doneDays + 1, stats.totalDays)} de {stats.totalDays}
          </strong>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-line bg-paper2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-forest to-gold transition-all duration-500"
            style={{ width: `${Math.min(100, stats.pctVerses).toFixed(1)}%` }}
          />
        </div>
      </div>

      {/* INDICADORES */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Stat num={`${stats.pctDays.toFixed(0)}%`} lbl="dias concluídos" />
        <Stat num={`${(100 - stats.pctDays).toFixed(0)}%`} lbl="dias restantes" />
        <Stat num={`${stats.doneDays}/${stats.totalDays}`} lbl="dias feitos" />
        <Stat num={stats.versesRead.toLocaleString('pt-BR')} lbl="versículos lidos" />
        <Stat num={stats.versesLeft.toLocaleString('pt-BR')} lbl="versículos restantes" />
        <Stat num={`~${plan.avgPerDay}`} lbl="vs./dia" />
      </div>

      {/* RECALCULAR */}
      {stats.overdue > 0 && (
        <div className="mt-3 rounded-2xl border border-dashed border-gold bg-goldsoft/40 p-3 text-sm">
          <strong className="text-forestdeep">⚠ {stats.overdue} dia(s) em atraso.</strong>{' '}
          <button onClick={() => setShowRecalc((v) => !v)} className="font-semibold text-forest underline">
            Recalcular plano
          </button>
          {showRecalc && (
            <div className="mt-2 grid gap-2">
              <button onClick={() => doRecalc('keep')} className="rounded-xl bg-forest px-3 py-2 text-left text-white">
                <strong>Recalcular carga diária</strong>
                <span className="block text-xs opacity-90">Mantém {fmtBR(plan.endDate)} como data final e redistribui o restante nos dias que sobram.</span>
              </button>
              <button onClick={() => doRecalc('extend')} className="rounded-xl bg-gold px-3 py-2 text-left text-white">
                <strong>Prorrogar data final</strong>
                <span className="block text-xs opacity-90">Mantém a média de ~{plan.avgPerDay} vs./dia e empurra o término para frente.</span>
              </button>
              {recalcMsg && <p className="rounded-lg bg-white/70 p-2 text-[13px] text-forestdeep">{recalcMsg}</p>}
            </div>
          )}
        </div>
      )}
      {recalcMsg && stats.overdue === 0 && <p className="mt-2 text-sm text-forestdeep">{recalcMsg}</p>}

      {/* BLOCOS 10 EM 10 */}
      <div className="mt-5">
        {blocks.map((days, bi) => {
          const open = openBlocks.has(bi)
          const doneCount = days.filter((d) => d.done).length
          return (
            <div key={bi} className="border-b border-line">
              <button onClick={() => toggleBlock(bi)} className="flex w-full items-baseline gap-2 py-3 text-left">
                <span className="font-serif text-[17px] font-semibold text-ink">Bloco {bi + 1}</span>
                <span className="text-[15px] text-inksoft">
                  {fmtBR(days[0].date)} – {fmtBR(days[days.length - 1].date)}
                </span>
                <span className="ml-auto rounded-full bg-paper2 px-2 py-0.5 text-[11px] text-inksoft">
                  {doneCount}/{days.length} · Dias {days[0].n}–{days[days.length - 1].n}
                </span>
                <span className="text-inksoft">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <ul className="mb-4 overflow-hidden rounded-xl border border-line">
                  {days.map((d) => {
                    const isToday = d.date === today
                    return (
                      <li
                        key={d.n}
                        className={`flex items-center gap-2 px-3 py-2 text-sm ${isToday ? 'bg-todaybg' : d.done ? 'bg-paper' : 'bg-white/60'} border-b border-paper2 last:border-0`}
                      >
                        <button
                          onClick={() => onToggleDay(d.n)}
                          aria-label={d.done ? `Desmarcar dia ${d.n}` : `Concluir dia ${d.n}`}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                            d.done ? 'border-forest bg-forest text-white' : 'border-line bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </button>
                        <span className="w-10 shrink-0 tabular-nums text-inksoft">D{d.n}</span>
                        <span className="w-12 shrink-0 tabular-nums text-inksoft">{fmtBR(d.date)}</span>
                        <span className={`flex-1 ${d.done ? 'text-inksoft line-through' : isToday ? 'font-bold text-forestdeep' : 'font-medium text-ink'}`}>
                          até {d.endLabel}
                        </span>
                        <span className="shrink-0 tabular-nums text-xs text-inksoft">{d.verses} vs.</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ num, lbl }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 px-1 py-2 text-center">
      <span className="block font-serif text-[17px] font-bold text-forest">{num}</span>
      <span className="block text-[11px] leading-tight text-inksoft">{lbl}</span>
    </div>
  )
}

function currentBlock(plan, today) {
  if (plan.mode === 'free' || !plan.days.length) return 0
  const idx = plan.days.findIndex((d) => d.date >= today)
  return Math.floor(Math.max(0, idx === -1 ? plan.days.length - 1 : idx) / 10)
}

// ---------- LEITURA LIVRE ----------
function FreePanel({ plan, stats, onAddEntry, onRemoveEntry }) {
  const scopeBooks = BOOKS.filter((b) => plan.bookIds.includes(b.id))
  const [bookId, setBookId] = useState(plan.bookIds[0] ?? 1)
  const book = bookById(bookId) || scopeBooks[0] || BOOKS[0]
  const [sCh, setSCh] = useState(1)
  const [sV, setSV] = useState(1)
  const [eCh, setECh] = useState(1)
  const [eV, setEV] = useState(1)
  const [wholeChapter, setWholeChapter] = useState(true)
  const [err, setErr] = useState('')

  const verses = wholeChapter
    ? book.verses[sCh - 1] || 0
    : countVersesInRange(book.id, Number(sCh), Number(sV), Number(eCh), Number(eV))

  const add = () => {
    setErr('')
    if (verses <= 0) {
      setErr('Intervalo inválido.')
      return
    }
    const label = wholeChapter
      ? `${book.name} ${sCh}`
      : sCh === Number(eCh) && Number(sV) === Number(eV)
        ? `${book.name} ${sCh}:${sV}`
        : `${book.name} ${sCh}:${sV}–${eCh}:${eV}`;
    onAddEntry({ id: uid(), date: todayISO(), label, verses, bookId: book.id })
  }

  const chs = (v, set) => (
    <input type="number" min="1" max={book.chapters} value={v} onChange={(e) => set(Number(e.target.value))} className="w-14 rounded-md border border-line bg-paper px-1 py-1 text-sm" />
  )

  return (
    <div>
      <div className="rounded-2xl border border-todayborder bg-todaybg p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gold">Leitura livre</div>
        <div className="mt-1 font-serif text-xl font-bold text-forestdeep">
          {stats.versesRead.toLocaleString('pt-BR')} de {plan.totalVerses.toLocaleString('pt-BR')} versículos
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-line bg-white/70">
          <div className="h-full rounded-full bg-gradient-to-r from-forest to-gold" style={{ width: `${Math.min(100, stats.pctVerses).toFixed(1)}%` }} />
        </div>
        <div className="mt-1 text-[13px] text-inksoft">
          <strong className="text-forestdeep">{stats.pctVerses.toFixed(1)}%</strong> concluído · faltam {stats.versesLeft.toLocaleString('pt-BR')} vs.
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-line bg-white/70 p-3">
        <h3 className="text-sm font-bold text-forestdeep">Registrar leitura</h3>
        <label className="mt-2 block text-xs font-semibold text-inksoft">Livro</label>
        <select
          value={book.id}
          onChange={(e) => { const id = Number(e.target.value); setBookId(id); setSCh(1); setSV(1); setECh(1); setEV(1) }}
          className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-2 text-sm"
        >
          {scopeBooks.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.chapters} cap.)</option>)}
        </select>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={wholeChapter} onChange={(e) => setWholeChapter(e.target.checked)} className="h-4 w-4 accent-[#2E5D50]" />
          Capítulo inteiro
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-xs text-inksoft">De cap.</span> {chs(sCh, setSCh)}
          {!wholeChapter && (<><span className="text-xs text-inksoft">v.</span><input type="number" min="1" max={book.verses[sCh - 1] || 1} value={sV} onChange={(e) => setSV(Number(e.target.value))} className="w-14 rounded-md border border-line bg-paper px-1 py-1 text-sm" /><span className="text-xs text-inksoft">até cap.</span>{chs(eCh, setECh)}<span className="text-xs text-inksoft">v.</span><input type="number" min="1" max={book.verses[Number(eCh) - 1] || 1} value={eV} onChange={(e) => setEV(Number(e.target.value))} className="w-14 rounded-md border border-line bg-paper px-1 py-1 text-sm" /></>)}
          <span className="ml-auto rounded-full bg-paper2 px-2 py-1 text-xs font-semibold text-forestdeep">= {verses} vs.</span>
        </div>
        {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
        <button onClick={add} className="mt-2 w-full rounded-xl bg-forest py-2.5 font-semibold text-white">+ Registrar</button>
      </div>

      <h3 className="mb-1 mt-4 text-sm font-bold text-forestdeep">Histórico ({plan.entries.length})</h3>
      {plan.entries.length === 0 && <p className="text-sm text-inksoft">Nenhuma leitura registrada ainda.</p>}
      <ul className="overflow-hidden rounded-xl border border-line">
        {[...plan.entries].reverse().map((e) => (
          <li key={e.id} className="flex items-center gap-2 border-b border-paper2 bg-white/60 px-3 py-2 text-sm last:border-0">
            <span className="flex-1 font-medium">{e.label}</span>
            <span className="text-xs tabular-nums text-inksoft">{fmtBR(e.date)} · {e.verses} vs.</span>
            <button onClick={() => onRemoveEntry(e.id)} className="text-xs text-red-600 underline">remover</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
