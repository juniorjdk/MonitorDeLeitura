import { useMemo, useState } from 'react'
import { todayISO, addDaysISO, diffDays, fmtBR, generateBook } from '../lib/books.js'

export default function BookCreator({ onCreate, onCancel }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [unit, setUnit] = useState('paginas') // 'paginas' | 'capitulos'
  const [total, setTotal] = useState('')
  const [mode, setMode] = useState('days') // 'days' | 'date' | 'free'
  const [startDate, setStartDate] = useState(todayISO())
  const [totalDays, setTotalDays] = useState(30)
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 29))
  const [error, setError] = useState('')

  const totalNum = Number(total) || 0
  const daysNum = Number(totalDays) || 0
  const computedDays = mode === 'date' ? diffDays(startDate, endDate) + 1 : daysNum
  const perDay = computedDays > 0 && totalNum > 0 ? (totalNum / computedDays).toFixed(1) : '—'
  const unitLabel = unit === 'paginas' ? 'páginas' : 'capítulos'
  const unitShort = unit === 'paginas' ? 'pág.' : 'cap.'

  const submit = (e) => {
    e.preventDefault()
    setError('')

    // Validações (seção 7 do Modulo_Livros_v2.md)
    if (!title.trim()) {
      setError('Título é obrigatório.')
      return
    }
    if (!Number.isInteger(totalNum) || totalNum <= 0) {
      setError('Total deve ser um inteiro maior que zero.')
      return
    }
    if (mode === 'days' && (!daysNum || daysNum < 1)) {
      setError('Informe uma quantidade de dias válida.')
      return
    }
    if (mode === 'date' && diffDays(startDate, endDate) < 0) {
      setError('A data final deve ser igual ou posterior ao início.')
      return
    }

    try {
      const book = generateBook({
        title: title.trim(),
        author: author.trim(),
        unit,
        total: totalNum,
        mode,
        startDate,
        totalDays: daysNum,
        endDate
      })
      onCreate(book)
    } catch (err) {
      setError(err.message)
    }
  }

  const endDatePreview = useMemo(() => {
    if (mode === 'free') return null
    if (mode === 'date') return endDate
    return addDaysISO(startDate, Math.max(1, daysNum) - 1)
  }, [mode, startDate, endDate, daysNum])

  return (
    <form onSubmit={submit} className="rounded-2xl border border-bk-line bg-bk-paper/70 p-4 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-bk-oceandeep">Novo livro</h2>

      {/* Título */}
      <label className="mt-3 block text-sm font-semibold text-bk-ink">Título *</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex: O Hobbit"
        className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-3 py-2 text-sm outline-none focus:border-bk-ocean"
      />

      {/* Autor */}
      <label className="mt-3 block text-sm font-semibold text-bk-ink">Autor (opcional)</label>
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Ex: J.R.R. Tolkien"
        className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-3 py-2 text-sm outline-none focus:border-bk-ocean"
      />

      {/* Unidade de progresso */}
      <label className="mt-4 block text-sm font-semibold text-bk-ink">Medir progresso por:</label>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {[
          ['paginas', 'Páginas'],
          ['capitulos', 'Capítulos']
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setUnit(k)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              unit === k
                ? 'border-bk-ocean bg-bk-ocean text-white'
                : 'border-bk-line bg-bk-paper2 text-bk-ink hover:border-bk-ocean'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Total */}
      <label className="mt-3 block text-sm font-semibold text-bk-ink">
        Total de {unit === 'paginas' ? 'páginas' : 'capítulos'} *
      </label>
      <input
        type="number"
        min="1"
        max="100000"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        placeholder={`Ex: 312 ${unitShort}`}
        className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-3 py-2 text-sm outline-none focus:border-bk-ocean"
      />

      {/* Modo de cronograma */}
      <label className="mt-4 block text-sm font-semibold text-bk-ink">Cronograma</label>
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
              mode === k
                ? 'border-bk-clay bg-bk-clay/15 text-bk-oceandeep'
                : 'border-bk-line bg-bk-paper2 text-bk-ink hover:border-bk-ocean'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Campos de data/quantidade */}
      {mode !== 'free' && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-bk-inksoft">Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-2 py-2 text-sm"
            />
          </div>
          {mode === 'days' ? (
            <div>
              <label className="block text-xs font-semibold text-bk-inksoft">Dias</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-2 py-2 text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-bk-inksoft">Data final</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bk-line bg-bk-paper2 px-2 py-2 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Explicação modo livre */}
      {mode === 'free' && (
        <p className="mt-3 rounded-lg bg-bk-paper2 p-3 text-sm text-bk-inksoft">
          Na leitura livre não há prazo: você registra a página/capítulo onde chegou a cada dia,
          com nota opcional. O progresso é calculado pela maior posição já registrada.
        </p>
      )}

      {/* Resumo ao vivo */}
      <div className="mt-3 rounded-lg bg-bk-paper2 p-3 text-sm">
        <span className="text-bk-inksoft">Resumo: </span>
        <strong className="text-bk-oceandeep">{totalNum.toLocaleString('pt-BR')} {unitLabel}</strong>
        {mode !== 'free' && (
          <>
            {' '}em <strong className="text-bk-oceandeep">{computedDays} dias</strong>
            {' '}(~<strong className="text-bk-oceandeep">{perDay} {unitShort}/dia</strong>)
            {' '}· termina em <strong className="text-bk-oceandeep">{fmtBR(endDatePreview)}</strong>
          </>
        )}
      </div>

      {/* Erro */}
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}

      {/* Botões */}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-bk-ocean py-2.5 font-semibold text-white active:scale-[.99]"
        >
          Adicionar livro
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-bk-line bg-bk-paper2 px-4 py-2.5 text-sm font-medium text-bk-inksoft hover:bg-bk-paper"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}