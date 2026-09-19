import { useMemo } from 'react'
import { Link } from 'react-router-dom'

const PLANS_KEY = 'bpwa-plans-v1'
const BOOKS_KEY = 'bpwa-books-v1'

function loadPlans() {
  try {
    const raw = localStorage.getItem(PLANS_KEY)
    if (!raw) return { plans: [], activeId: null }
    const data = JSON.parse(raw)
    return { plans: Array.isArray(data.plans) ? data.plans : [], activeId: data.activeId ?? null }
  } catch {
    return { plans: [], activeId: null }
  }
}

function loadBooks() {
  try {
    const raw = localStorage.getItem(BOOKS_KEY)
    if (!raw) return { books: [], activeBookId: null }
    const data = JSON.parse(raw)
    return { books: Array.isArray(data.books) ? data.books : [], activeBookId: data.activeBookId ?? null }
  } catch {
    return { books: [], activeBookId: null }
  }
}

function fmtBR(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

function pct(num, den) {
  return den ? ((num / den) * 100).toFixed(1) : '0.0'
}

export default function HomePage() {
  const { plans, activeId } = useMemo(loadPlans, [])
  const { books, activeBookId } = useMemo(loadBooks, [])

  const activePlan = plans.find((p) => p.id === activeId) || plans[0] || null
  const activeBook = books.find((b) => b.id === activeBookId) || books[0] || null

  // --- Estatísticas Bíblia ---
  let bibliaStats = null
  if (activePlan) {
    if (activePlan.mode === 'free') {
      const read = activePlan.entries.reduce((a, e) => a + e.verses, 0)
      bibliaStats = {
        name: activePlan.name,
        progress: pct(read, activePlan.totalVerses),
        read: read.toLocaleString('pt-BR'),
        left: (activePlan.totalVerses - read).toLocaleString('pt-BR'),
        totalPlans: plans.length
      }
    } else {
      const done = activePlan.days.filter((d) => d.done)
      const read = done.reduce((a, d) => a + d.verses, 0)
      bibliaStats = {
        name: activePlan.name,
        progress: pct(read, activePlan.totalVerses),
        read: read.toLocaleString('pt-BR'),
        left: (activePlan.totalVerses - read).toLocaleString('pt-BR'),
        totalPlans: plans.length
      }
    }
  }

  // --- Estatísticas Livros ---
  let livrosStats = null
  if (books.length > 0) {
    const emAndamento = books.filter((b) => b.status === 'lendo').length
    const concluidos = books.filter((b) => b.status === 'concluido').length
    const totalUnidadesLidas = books.reduce((sum, b) => {
      if (b.mode === 'free') {
        const maxPos = b.entries.length ? Math.max(...b.entries.map((e) => e.position)) : 0
        return sum + maxPos
      } else {
        const done = b.days.filter((d) => d.done)
        return sum + done.reduce((a, d) => a + d.qty, 0)
      }
    }, 0)

    livrosStats = {
      emAndamento,
      concluidos,
      totalLivros: books.length,
      totalUnidadesLidas: totalUnidadesLidas.toLocaleString('pt-BR')
    }
  }

  const hasAnyData = plans.length > 0 || books.length > 0

  return (
    <div className="min-h-screen bg-bk-paper font-sans text-bk-ink">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <header className="mb-8">
          <h1 className="font-serif text-[32px] font-bold text-bk-oceandeep">Início</h1>
          <p className="mt-1 text-bk-inksoft">Visão geral do seu progresso</p>
        </header>

        {hasAnyData ? (
          <>
            {/* Bloco Bíblia */}
            {bibliaStats && (
              <section className="mb-6 rounded-2xl border border-bk-line bg-bk-paper/70 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📖</span>
                  <h2 className="font-serif text-xl font-bold text-bk-oceandeep">Leitura Bíblica</h2>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <StatCard label="Plano ativo" value={bibliaStats.name} />
                  <StatCard label="Progresso" value={`${bibliaStats.progress}%`} />
                  <StatCard label="Versículos lidos" value={bibliaStats.read} />
                  <StatCard label="Versículos restantes" value={bibliaStats.left} />
                  <StatCard label="Total de planos salvos" value={String(bibliaStats.totalPlans)} />
                </div>
              </section>
            )}

            {/* Bloco Livros */}
            {livrosStats && (
              <section className="mb-6 rounded-2xl border border-bk-line bg-bk-paper/70 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <h2 className="font-serif text-xl font-bold text-bk-oceandeep">Minha Biblioteca</h2>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <StatCard label="Livros em andamento" value={String(livrosStats.emAndamento)} />
                  <StatCard label="Livros concluídos" value={String(livrosStats.concluidos)} />
                  <StatCard label="Total de livros" value={String(livrosStats.totalLivros)} />
                  <StatCard label="Páginas/capítulos lidos" value={livrosStats.totalUnidadesLidas} />
                </div>
              </section>
            )}

            {/* Cards de navegação */}
            <nav className="grid grid-cols-2 gap-3">
              <Link to="/biblia" className="rounded-2xl border-2 border-bk-ocean bg-bk-ocean/5 p-6 text-center hover:bg-bk-ocean/10 transition">
                <div className="text-3xl mb-1">📖</div>
                <div className="font-serif text-lg font-bold text-bk-oceandeep">Leitura Bíblica</div>
                <div className="mt-1 text-sm text-bk-inksoft">Continuar seu plano de leitura</div>
              </Link>
              <Link to="/livros" className="rounded-2xl border-2 border-bk-ocean bg-bk-ocean/5 p-6 text-center hover:bg-bk-ocean/10 transition">
                <div className="text-3xl mb-1">📚</div>
                <div className="font-serif text-lg font-bold text-bk-oceandeep">Minha Biblioteca</div>
                <div className="mt-1 text-sm text-bk-inksoft">Gerenciar seus livros</div>
              </Link>
            </nav>
          </>
        ) : (
          /* Estado vazio */
          <div className="rounded-2xl border-2 border-dashed border-bk-line bg-bk-paper/50 p-10 text-center">
            <div className="text-5xl mb-3">📖📚</div>
            <h2 className="font-serif text-xl font-bold text-bk-oceandeep">Bem-vindo!</h2>
            <p className="mt-2 text-bk-inksoft">Nenhum plano bíblico nem livro cadastrado ainda.</p>
            <nav className="mt-6 grid grid-cols-2 gap-3">
              <Link to="/biblia" className="rounded-xl bg-bk-ocean py-3 font-semibold text-white hover:bg-bk-ocean/90 transition">
                📖 Criar plano bíblico
              </Link>
              <Link to="/livros" className="rounded-xl bg-bk-ocean py-3 font-semibold text-white hover:bg-bk-ocean/90 transition">
                📚 Adicionar livro
              </Link>
            </nav>
          </div>
        )}

        <footer className="mt-12 border-t border-t-bk-line pt-4 text-[12.5px] text-bk-inksoft text-center">
          <p>Funciona 100% offline após o primeiro acesso. Instale na tela inicial pelo menu do navegador.</p>
        </footer>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-bk-paper2 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-bk-inksoft">{label}</div>
      <div className="mt-0.5 font-serif text-[19px] font-bold text-bk-oceandeep">{value}</div>
    </div>
  )
}