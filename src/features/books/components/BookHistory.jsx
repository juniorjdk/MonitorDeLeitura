import { useState } from 'react'
import { fmtBR } from '../lib/books.js'

export default function BookHistory({ book, stats, onAddPositionEntry, onRemovePositionEntry }) {
  const [position, setPosition] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')

  const lastPosition = book.entries.length
    ? Math.max(...book.entries.map((e) => e.position))
    : 0

  const add = () => {
    setErr('')
    const pos = Number(position)
    if (!Number.isInteger(pos) || pos <= 0) {
      setErr('Informe uma posição válida (inteiro > 0).')
      return
    }
    if (pos <= lastPosition) {
      setErr(`A posição deve ser maior que a última registrada (${lastPosition}).`)
      return
    }
    if (pos > book.total) {
      setErr(`A posição não pode ultrapassar o total (${book.total}).`)
      return
    }
    onAddPositionEntry(pos, note.trim())
    setPosition('')
    setNote('')
  }

  const unitLabel = book.unit === 'paginas' ? 'página' : 'capítulo'
  const unitLabelPlural = book.unit === 'paginas' ? 'páginas' : 'capítulos'

  return (
    <div>
      {/* CARD DE PROGRESSO */}
      <div className="rounded-2xl border border-bk-todayborder bg-bk-todaybg p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-bk-clay">Leitura livre</div>
        <div className="mt-1 font-serif text-xl font-bold text-bk-oceandeep">
          {lastPosition} de {book.total.toLocaleString('pt-BR')} {unitLabelPlural}
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-bk-line bg-bk-paper2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bk-ocean to-bk-clay"
            style={{ width: `${Math.min(100, stats.pctUnits).toFixed(1)}%` }}
          />
        </div>
        <div className="mt-1 text-[13px] text-bk-inksoft">
          <strong className="text-bk-oceandeep">{stats.pctUnits.toFixed(1)}%</strong> concluído · faltam {stats.unitsLeft.toLocaleString('pt-BR')} {unitLabelPlural}
        </div>
      </div>

      {/* FORMULÁRIO DE REGISTRO */}
      <div className="mt-3 rounded-2xl border border-bk-line bg-bk-paper/70 p-3">
        <h3 className="text-sm font-bold text-bk-oceandeep">Registrar posição</h3>
        <label className="mt-2 block text-xs font-semibold text-bk-inksoft">
          Cheguei até a {unitLabel}: <span className="text-bk-ink">[___]</span>
        </label>
        <input
          type="number"
          min={lastPosition + 1}
          max={book.total}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder={`Ex: ${lastPosition + 1}`}
          className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-3 py-2 text-sm outline-none focus:border-bk-ocean"
        />
        <label className="mt-2 block text-xs font-semibold text-bk-inksoft">Nota (opcional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Observações sobre a leitura..."
          className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-3 py-2 text-sm outline-none focus:border-bk-ocean"
        />
        {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
        <button onClick={add} className="mt-2 w-full rounded-xl bg-bk-ocean py-2.5 font-semibold text-white">
          Registrar
        </button>
      </div>

      {/* HISTÓRICO */}
      <h3 className="mb-1 mt-4 text-sm font-bold text-bk-oceandeep">Histórico ({book.entries.length})</h3>
      {book.entries.length === 0 && <p className="text-sm text-bk-inksoft">Nenhuma leitura registrada ainda.</p>}
      <ul className="overflow-hidden rounded-xl border border-bk-line">
        {[...book.entries].reverse().map((e) => (
          <li key={e.id} className="flex items-center gap-2 border-b border-b-bk-paper2 bg-white/60 px-3 py-2 text-sm last:border-0">
            <div className="flex-1">
              <span className="font-medium">{unitLabel} {e.position}</span>
              {e.note && <span className="ml-2 text-xs text-bk-inksoft">— {e.note}</span>}
            </div>
            <span className="text-xs tabular-nums text-bk-inksoft">{fmtBR(e.date)}</span>
            <button onClick={() => onRemovePositionEntry(e.id)} className="text-xs text-red-600 underline">remover</button>
          </li>
        ))}
      </ul>
    </div>
  )
}