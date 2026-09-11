import { useMemo, useState } from 'react'
import { BOOKS, SCOPES, addDaysISO, diffDays, fmtBR, generatePlan, scopeVerses, todayISO } from '../lib/bible'

function BookSelector({ selected, onChange }) {
  const [q, setQ] = useState('')
  const [rangeFrom, setRangeFrom] = useState('1')
  const [rangeTo, setRangeTo] = useState('66')
  const set = useMemo(() => new Set(selected), [selected])

  const toggle = (id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next].sort((a, b) => a - b))
  }

  const applyPreset = (ids) => onChange(ids)
  const applyRange = () => {
    let a = Math.min(Number(rangeFrom), Number(rangeTo))
    let b = Math.max(Number(rangeFrom), Number(rangeTo))
    const ids = []
    for (let i = a; i <= b; i++) ids.push(i)
    onChange(ids)
  }

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const query = norm(q.trim())
  const groups = [
    { t: 'AT', label: 'Antigo Testamento' },
    { t: 'NT', label: 'Novo Testamento' }
  ]

  return (
    <div className="rounded-xl border border-line bg-white/60 p-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar livro… (ex: salmos)"
        className="mb-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-forest"
      />
      <div className="mb-2 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => applyPreset(BOOKS.map((b) => b.id))} className="rounded-full bg-paper2 px-2.5 py-1 text-xs font-medium text-forestdeep hover:bg-goldsoft">Todos</button>
        <button type="button" onClick={() => applyPreset(BOOKS.filter((b) => b.testament === 'AT').map((b) => b.id))} className="rounded-full bg-paper2 px-2.5 py-1 text-xs font-medium text-forestdeep hover:bg-goldsoft">Só AT</button>
        <button type="button" onClick={() => applyPreset(BOOKS.filter((b) => b.testament === 'NT').map((b) => b.id))} className="rounded-full bg-paper2 px-2.5 py-1 text-xs font-medium text-forestdeep hover:bg-goldsoft">Só NT</button>
        <button type="button" onClick={() => applyPreset([])} className="rounded-full bg-paper2 px-2.5 py-1 text-xs font-medium text-inksoft hover:bg-goldsoft">Limpar</button>
      </div>
      <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-paper2/70 p-2 text-xs">
        <span className="font-semibold text-forestdeep">Range:</span>
        <select value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} className="max-w-[7rem] rounded-md border border-line bg-white px-1 py-1">
          {BOOKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <span className="text-inksoft">até</span>
        <select value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} className="max-w-[7rem] rounded-md border border-line bg-white px-1 py-1">
          {BOOKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="button" onClick={applyRange} className="rounded-md bg-forest px-2 py-1 font-semibold text-white">Aplicar</button>
      </div>
      <div className="max-h-56 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div key={g.t} className="mb-2">
            <div className="sticky top-0 bg-[#fbf9f4] py-1 text-[11px] font-bold uppercase tracking-wide text-inksoft">{g.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {BOOKS.filter((b) => b.testament === g.t && (!query || norm(b.name).includes(query))).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggle(b.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    set.has(b.id)
                      ? 'border-forest bg-forest text-white'
                      : 'border-line bg-paper text-ink hover:border-forest'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-inksoft">
        <strong className="text-forestdeep">{selected.length}</strong> livro(s) ·{' '}
        <strong className="text-forestdeep">{scopeVerses('custom', selected).toLocaleString('pt-BR')}</strong> versículos
      </div>
    </div>
  )
}

export default function PlanCreator({ onCreate, onCancel }) {
  const [name, setName] = useState('')
  const [scope, setScope] = useState('full')
  const [bookIds, setBookIds] = useState([])
  const [mode, setMode] = useState('days') // days | date | free
  const [startDate, setStartDate] = useState(todayISO())
  const [totalDays, setTotalDays] = useState(127)
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 126))
  const [error, setError] = useState('')

  const verses = scope === 'custom' ? scopeVerses('custom', bookIds) : scopeVerses(scope)
  const computedDays = mode === 'date' ? diffDays(startDate, endDate) + 1 : Number(totalDays) || 0
  const perDay = computedDays > 0 ? (verses / computedDays).toFixed(1) : '—'

  const submit = (e) => {
    e.preventDefault()
    setError('')
    try {
      const plan = generatePlan({
        name: name || defaultName(scope),
        scope,
        bookIds,
        startDate,
        totalDays: Number(totalDays),
        endDate,
        mode
      })
      onCreate(plan)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white/70 p-4 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-forestdeep">Novo plano</h2>

      <label className="mt-3 block text-sm font-semibold text-ink">Nome do plano</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={defaultName(scope)}
        className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-forest"
      />

      <span className="mt-4 block text-sm font-semibold text-ink">Escopo</span>
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {Object.entries(SCOPES).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setScope(k)}
            className={`rounded-lg border px-2 py-2 text-sm font-medium ${
              scope === k ? 'border-forest bg-forest text-white' : 'border-line bg-paper text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {scope === 'custom' && (
        <div className="mt-2">
          <BookSelector selected={bookIds} onChange={setBookIds} />
        </div>
      )}

      <span className="mt-4 block text-sm font-semibold text-ink">Meta</span>
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        {[
          ['days', 'Qtd. de dias'],
          ['date', 'Data final'],
          ['free', 'Leitura livre']
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={`rounded-lg border px-2 py-2 text-sm font-medium ${
              mode === k ? 'border-gold bg-goldsoft text-forestdeep' : 'border-line bg-paper text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode !== 'free' && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-inksoft">Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-2 text-sm"
            />
          </div>
          {mode === 'days' ? (
            <div>
              <label className="block text-xs font-semibold text-inksoft">Dias</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-2 text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-inksoft">Data final</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-2 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {mode === 'free' && (
        <p className="mt-3 rounded-lg bg-paper2 p-3 text-sm text-inksoft">
          Na leitura livre não há prazo: você registra capítulos/versículos lidos espontaneamente e o progresso é calculado sobre o escopo escolhido.
        </p>
      )}

      <div className="mt-3 rounded-lg bg-paper2 p-3 text-sm">
        <span className="text-inksoft">Resumo: </span>
        <strong className="text-forestdeep">{verses.toLocaleString('pt-BR')} vs.</strong>
        {mode !== 'free' && (
          <>
            {' '}em <strong className="text-forestdeep">{computedDays} dias</strong>
            {' '}(~<strong className="text-forestdeep">{perDay} vs./dia</strong>)
            {' '}· termina em <strong className="text-forestdeep">{fmtBR(mode === 'date' ? endDate : addDaysISO(startDate, Math.max(1, computedDays) - 1))}</strong>
          </>
        )}
      </div>

      {error && <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button type="submit" className="flex-1 rounded-xl bg-forest py-2.5 font-semibold text-white active:scale-[.99]">
          Criar plano
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-xl border border-line bg-paper px-4 py-2.5 text-sm font-medium text-inksoft">
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function defaultName(scope) {
  return scope === 'ot' ? 'Antigo Testamento' : scope === 'nt' ? 'Novo Testamento' : scope === 'custom' ? 'Seleção personalizada' : 'Bíblia toda'
}
