import { useState } from 'react'
import { useBooks } from './hooks/useBooks'
import { fmtBR } from './lib/books.js'
import BookCreator from './components/BookCreator.jsx'
import BookDashboard from './components/BookDashboard.jsx'
import BooksBackup from './components/BooksBackup.jsx'

export default function BooksApp() {
  const {
    books, active, activeBookId, setActiveBookId,
    addBook, updateBook, removeBook,
    toggleDay, addPositionEntry, removePositionEntry,
    recalcKeepEnd, recalcExtendEnd,
    createBook, replaceAll
  } = useBooks()

  const [tab, setTab] = useState('hoje') // hoje | livros | backup
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="min-h-screen bg-bk-paper text-bk-ink font-sans">
      <div className="mx-auto max-w-2xl px-5 pb-24">
        <header className="border-b border-b-bk-line pb-5 pt-10">
          <div className="text-[13px] font-semibold text-bk-ocean">Cronograma por página/capítulo</div>
          <h1 className="mt-1 font-serif text-[32px] font-bold leading-tight text-bk-oceandeep">Minha Biblioteca</h1>
          <p className="font-serif text-[17px] italic text-bk-inksoft">Metas diárias equilibradas pela contagem de páginas ou capítulos.</p>

          <nav className="mt-4 grid grid-cols-3 gap-1.5">
            {[
              ['hoje', '📚 Hoje'],
              ['livros', '📚 Livros'],
              ['backup', '💾 Backup']
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-xl border py-2 text-sm font-semibold ${
                  tab === k
                    ? 'border-bk-ocean bg-bk-ocean text-white'
                    : 'border-bk-line bg-bk-paper/70 text-bk-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <main className="mt-4">
          {tab === 'hoje' && (
            <>
              {books.length > 0 && (
                <div className="mb-3 flex items-center gap-2">
                  <select
                    value={activeBookId || ''}
                    onChange={(e) => setActiveBookId(e.target.value)}
                    className="flex-1 rounded-xl border border-bk-line bg-bk-paper/70 px-3 py-2 text-sm font-medium"
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} · {b.mode === 'free' ? 'livre' : `${fmtBR(b.startDate)} → ${fmtBR(b.endDate)}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setCreating(true); setTab('livros') }}
                    className="shrink-0 rounded-xl bg-bk-clay/15 px-3 py-2 text-sm font-bold text-bk-oceandeep border border-bk-clay"
                  >
                    + Novo
                  </button>
                </div>
              )}
              {active ? (
                <>
                  <BookHeader book={active} />
                  <div className="mt-3">
                    <BookDashboard
                      book={active}
                      onToggleDay={toggleDay}
                      onUpdateBook={updateBook}
                      onAddPositionEntry={addPositionEntry}
                      onRemovePositionEntry={removePositionEntry}
                    />
                  </div>
                </>
              ) : (
                <EmptyState onNew={() => { setCreating(true); setTab('livros') }} />
              )}
            </>
          )}

          {tab === 'livros' && (
            <div className="grid gap-3">
              {creating ? (
                <BookCreator
                  onCreate={(b) => { createBook(b); setCreating(false); setTab('hoje') }}
                  onCancel={() => setCreating(false)}
                />
              ) : (
                <button onClick={() => setCreating(true)} className="rounded-2xl border-2 border-dashed border-bk-line bg-bk-paper/50 py-4 font-semibold text-bk-ocean">
                  + Adicionar livro
                </button>
              )}
              {books.map((b) => (
                <div key={b.id} className={`rounded-2xl border p-4 ${b.id === activeBookId ? 'border border-bk-ocean bg-bk-paper/80' : 'border border-bk-line bg-bk-paper/50'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-serif text-lg font-bold text-bk-oceandeep">{b.title}</div>
                      <div className="text-xs text-bk-inksoft">
                        {b.author && `${b.author} · `}
                        {b.unit === 'paginas' ? 'páginas' : 'capítulos'} · {b.total.toLocaleString('pt-BR')} ·{' '}
                        {b.mode === 'free' ? 'leitura livre' : `${b.totalDays} dias · ${fmtBR(b.startDate)} → ${fmtBR(b.endDate)}`}
                      </div>
                    </div>
                    {b.id !== activeBookId && (
                      <button onClick={() => { setActiveBookId(b.id); setTab('hoje') }} className="rounded-lg bg-bk-paper2 px-2.5 py-1.5 text-xs font-bold text-bk-oceandeep border border-bk-clay">
                        Abrir
                      </button>
                    )}
                  </div>
                  {confirmDelete === b.id ? (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span>Excluir este livro?</span>
                      <button onClick={() => { removeBook(b.id); setConfirmDelete(false) }} className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white">Sim, excluir</button>
                      <button onClick={() => setConfirmDelete(false)} className="rounded-lg bg-bk-paper2 px-2.5 py-1">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(b.id)} className="mt-2 text-xs text-red-600 underline">
                      excluir livro
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'backup' && <BooksBackup books={books} onImport={(arr) => replaceAll(arr)} />}
        </main>

        <footer className="mt-10 border-t border-t-bk-line pt-4 text-[12.5px] text-bk-inksoft">
          <p>Cargas diárias calculadas pela divisão proporcional de páginas ou capítulos — do início ao fim, sem picos.</p>
          <p className="mt-1">Funciona 100% offline após o primeiro acesso. Instale na tela inicial pelo menu do navegador.</p>
        </footer>
      </div>
    </div>
  )
}

function BookHeader({ book }) {
  const unitShort = book.unit === 'paginas' ? 'pág.' : 'cap.'
  return (
    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-bk-line bg-bk-line">
      {[
        [book.mode === 'free' ? 'livre' : fmtBR(book.startDate), 'início'],
        [book.mode === 'free' ? '—' : fmtBR(book.endDate), 'fim'],
        [book.mode === 'free' ? book.entries.length : book.totalDays, book.mode === 'free' ? 'registros' : 'dias'],
        [`~${book.mode === 'free' ? '—' : book.avgPerDay}`, `${unitShort}/dia`]
      ].map(([num, lbl], i) => (
        <div key={i} className="bg-bk-paper px-1 py-2.5 text-center">
          <span className="block font-serif text-[19px] font-bold text-bk-ocean">{num}</span>
          <span className="block text-[11px] text-bk-inksoft">{lbl}</span>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="rounded-2xl border border-bk-line bg-bk-paper/70 p-8 text-center">
      <div className="font-serif text-2xl font-bold text-bk-oceandeep">📚</div>
      <h2 className="mt-2 font-serif text-xl font-bold text-bk-oceandeep">Comece sua biblioteca</h2>
      <p className="mt-1 text-sm text-bk-inksoft">Páginas ou capítulos, com prazo ou leitura livre — seu ritmo, suas regras.</p>
      <button onClick={onNew} className="mt-4 rounded-xl bg-bk-ocean px-6 py-2.5 font-semibold text-white">
        Cadastrar meu primeiro livro
      </button>
    </div>
  )
}