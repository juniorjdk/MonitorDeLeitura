import { useMemo, useState } from 'react'
import { fmtBR, bookStats, recalcExtendEndDate, recalcKeepEndDate, todayISO } from '../lib/books.js'
import BookHistory from './BookHistory.jsx'

export default function BookDashboard({ book, onToggleDay, onUpdateBook, onAddPositionEntry, onRemovePositionEntry }) {
  const today = todayISO()
  const stats = useMemo(() => bookStats(book, today), [book, today])
  const [openBlocks, setOpenBlocks] = useState(() => new Set([currentBlock(book, today)]))
  const [showRecalc, setShowRecalc] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState('')

  if (!book) return null

  if (book.mode === 'free') {
    return (
      <BookHistory
        book={book}
        stats={stats}
        onAddPositionEntry={onAddPositionEntry}
        onRemovePositionEntry={onRemovePositionEntry}
      />
    )
  }

  const blocks = []
  for (let i = 0; i < book.days.length; i += 10) blocks.push(book.days.slice(i, i + 10))
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
      const r = kind === 'keep' ? recalcKeepEndDate(book, today) : recalcExtendEndDate(book, today)
      if (!r.changed) {
        setRecalcMsg('Nada a recalcular: todos os dias estão concluídos. 🎉')
        return
      }
      onUpdateBook(book.id, r.book)
      setRecalcMsg(
        kind === 'keep'
          ? `Livro redistribuído até ${fmtBR(r.book.endDate)} (~${r.book.avgPerDay} ${book.unit === 'paginas' ? 'pág./dia' : 'cap./dia'}).`
          : `Nova data final: ${fmtBR(r.newEnd)} (média de ~${r.book.avgPerDay} ${book.unit === 'paginas' ? 'pág./dia' : 'cap./dia'}).`
      )
    } catch (err) {
      setRecalcMsg(err.message)
    }
  }

  const focus = stats.todayDay && !stats.todayDay.done ? stats.todayDay : stats.nextDay
  const unitLabel = book.unit === 'paginas' ? 'páginas' : 'capítulos'
  const unitShort = book.unit === 'paginas' ? 'pág.' : 'cap.'

  return (
    <div>
      {/* META DE HOJE */}
      {focus ? (
        <div className="rounded-2xl border border-bk-todayborder bg-bk-todaybg p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-bk-clay">
            {stats.todayDay && !stats.todayDay.done ? 'Meta de hoje' : stats.overdue > 0 ? `Em atraso — próxima meta (${stats.overdue} dia(s) pendentes)` : 'Próxima meta'}
          </div>
          <div className="mt-1 font-serif text-xl font-bold text-bk-oceandeep">
            Dia {focus.n} · até {focus.endLabel} {unitShort}
          </div>
          <div className="mt-0.5 text-sm text-bk-inksoft">
            {fmtBR(focus.date)} · {focus.qty} {unitLabel} · de {focus.startLabel} {unitShort}
          </div>
          <button
            onClick={() => onToggleDay(focus.n)}
            className="mt-3 w-full rounded-xl bg-bk-ocean py-2.5 font-semibold text-white active:scale-[.99]"
          >
            ✓ Concluir meta de hoje
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-bk-ocean bg-bk-ocean p-4 text-center text-white">
          <div className="font-serif text-xl font-bold">Livro concluído! 🎉</div>
          <div className="text-sm opacity-90">Você leu todos os {book.total.toLocaleString('pt-BR')} {unitLabel}.</div>
        </div>
      )}

      {/* BARRA DE PROGRESSO */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[13px] text-bk-inksoft">
          <span>Progresso do cronograma</span>
          <strong className="text-bk-oceandeep">
            {stats.pctUnits.toFixed(1)}% · dia {Math.min(stats.doneDays + 1, stats.totalDays)} de {stats.totalDays}
          </strong>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-bk-line bg-bk-paper2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bk-ocean to-bk-clay transition-all duration-500"
            style={{ width: `${Math.min(100, stats.pctUnits).toFixed(1)}%` }}
          />
        </div>
      </div>

      {/* INDICADORES (6) */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Stat num={`${stats.pctDays.toFixed(0)}%`} lbl="dias concluídos" />
        <Stat num={`${(100 - stats.pctDays).toFixed(0)}%`} lbl="dias restantes" />
        <Stat num={`${stats.doneDays}/${stats.totalDays}`} lbl="dias feitos" />
        <Stat num={stats.unitsRead.toLocaleString('pt-BR')} lbl={`${unitLabel} ${book.unit === 'paginas' ? 'lidas' : 'lidos'}`} />
        <Stat num={stats.unitsLeft.toLocaleString('pt-BR')} lbl={`${unitLabel} restantes`} />
        <Stat num={`~${book.avgPerDay}`} lbl={`${unitShort}/dia`} />
      </div>

      {/* RECALCULAR */}
      {stats.overdue > 0 && (
        <div className="mt-3 rounded-2xl border border-bk-clay/50 border-dashed bg-bk-clay/10 p-3 text-sm">
          <strong className="text-bk-oceandeep">⚠ {stats.overdue} dia(s) em atraso.</strong>{' '}
          <button onClick={() => setShowRecalc((v) => !v)} className="font-semibold text-bk-ocean underline">
            Recalcular plano
          </button>
          {showRecalc && (
            <div className="mt-2 grid gap-2">
              <button onClick={() => doRecalc('keep')} className="rounded-xl bg-bk-ocean px-3 py-2 text-left text-white">
                <strong>Recalcular carga diária</strong>
                <span className="block text-xs opacity-90">Mantém {fmtBR(book.endDate)} como data final e redistribui o restante nos dias que sobram.</span>
              </button>
              <button onClick={() => doRecalc('extend')} className="rounded-xl bg-bk-clay px-3 py-2 text-left text-white">
                <strong>Prorrogar data final</strong>
                <span className="block text-xs opacity-90">Mantém a média de ~{book.avgPerDay} {unitShort}/dia e empurra o término para frente.</span>
              </button>
              {recalcMsg && <p className="rounded-lg bg-bk-paper/70 p-2 text-[13px] text-bk-oceandeep">{recalcMsg}</p>}
            </div>
          )}
        </div>
      )}
      {recalcMsg && stats.overdue === 0 && <p className="mt-2 text-sm text-bk-oceandeep">{recalcMsg}</p>}

      {/* BLOCOS 10 EM 10 */}
      <div className="mt-5">
        {blocks.map((days, bi) => {
          const open = openBlocks.has(bi)
          const doneCount = days.filter((d) => d.done).length
          return (
            <div key={bi} className="border-b border-b-bk-line">
              <button onClick={() => toggleBlock(bi)} className="flex w-full items-baseline gap-2 py-3 text-left">
                <span className="font-serif text-[17px] font-semibold text-bk-ink">Bloco {bi + 1}</span>
                <span className="text-[15px] text-bk-inksoft">
                  {fmtBR(days[0].date)} – {fmtBR(days[days.length - 1].date)}
                </span>
                <span className="ml-auto rounded-full bg-bk-paper2 px-2 py-0.5 text-[11px] text-bk-inksoft">
                  {doneCount}/{days.length} · Dias {days[0].n}–{days[days.length - 1].n}
                </span>
                <span className="text-bk-inksoft">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <ul className="mb-4 overflow-hidden rounded-xl border border-bk-line">
                  {days.map((d) => {
                    const isToday = d.date === today
                    return (
                      <li
                        key={d.n}
                        className={`flex items-center gap-2 px-3 py-2 text-sm border-b ${isToday ? 'bg-bk-todaybg' : d.done ? 'bg-bk-paper' : 'bg-white/60'} border-b-bk-paper2 last:border-0`}
                      >
                        <button
                          onClick={() => onToggleDay(d.n)}
                          aria-label={d.done ? `Desmarcar dia ${d.n}` : `Concluir dia ${d.n}`}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                            d.done ? 'border-bk-ocean bg-bk-ocean text-white' : 'border-bk-line bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </button>
                        <span className="w-10 shrink-0 tabular-nums text-bk-inksoft">D{d.n}</span>
                        <span className="w-12 shrink-0 tabular-nums text-bk-inksoft">{fmtBR(d.date)}</span>
                        <span className={`flex-1 ${d.done ? 'text-bk-inksoft line-through' : isToday ? 'font-bold text-bk-oceandeep' : 'font-medium text-bk-ink'}`}>
                          até {d.endLabel} {unitShort}
                        </span>
                        <span className="shrink-0 tabular-nums text-xs text-bk-inksoft">{d.qty} {unitShort}</span>
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
    <div className="rounded-xl border border-bk-line bg-bk-paper/70 px-1 py-2 text-center">
      <span className="block font-serif text-[17px] font-bold text-bk-ocean">{num}</span>
      <span className="block text-[11px] leading-tight text-bk-inksoft">{lbl}</span>
    </div>
  )
}

function currentBlock(book, today) {
  if (book.mode === 'free' || !book.days.length) return 0
  const idx = book.days.findIndex((d) => d.date >= today)
  return Math.floor(Math.max(0, idx === -1 ? book.days.length - 1 : idx) / 10)
}