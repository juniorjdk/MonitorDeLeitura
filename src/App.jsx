import { useState } from 'react'
import { usePlans } from './hooks/usePlans'
import { SCOPES, fmtBR } from './lib/bible'
import PlanCreator from './components/PlanCreator'
import Dashboard from './components/Dashboard'
import Backup from './components/Backup'

export default function App() {
  const {
    plans, active, activeId, setActiveId,
    addPlan, updatePlan, removePlan,
    toggleDay, addFreeEntry, removeFreeEntry, replaceAll
  } = usePlans()
  const [tab, setTab] = useState('hoje') // hoje | planos | backup
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <div className="mx-auto max-w-2xl px-5 pb-24">
        <header className="border-b border-line pb-5 pt-10">
          <div className="text-[13px] font-semibold text-forest">Cronograma proporcional por versículo</div>
          <h1 className="mt-1 font-serif text-[32px] font-bold leading-tight text-forestdeep">Plano de Leitura Bíblica</h1>
          <p className="font-serif text-[17px] italic text-inksoft">Metas diárias equilibradas pela contagem real de versículos.</p>

          <nav className="mt-4 grid grid-cols-3 gap-1.5">
            {[
              ['hoje', '📖 Hoje'],
              ['planos', '🗂 Planos'],
              ['backup', '💾 Backup']
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-xl border py-2 text-sm font-semibold ${
                  tab === k ? 'border-forest bg-forest text-white' : 'border-line bg-white/70 text-ink'
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
              {plans.length > 0 && (
                <div className="mb-3 flex items-center gap-2">
                  <select
                    value={activeId || ''}
                    onChange={(e) => setActiveId(e.target.value)}
                    className="flex-1 rounded-xl border border-line bg-white/70 px-3 py-2 text-sm font-medium"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.mode === 'free' ? 'livre' : `${fmtBR(p.startDate)} → ${fmtBR(p.endDate)}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setCreating(true); setTab('planos') }}
                    className="shrink-0 rounded-xl bg-goldsoft px-3 py-2 text-sm font-bold text-forestdeep"
                  >
                    + Novo
                  </button>
                </div>
              )}
              {active ? (
                <>
                  <PlanHeader plan={active} />
                  <div className="mt-3">
                    <Dashboard
                      plan={active}
                      onToggleDay={toggleDay}
                      onUpdatePlan={updatePlan}
                      onAddEntry={addFreeEntry}
                      onRemoveEntry={removeFreeEntry}
                    />
                  </div>
                </>
              ) : (
                <EmptyState onNew={() => { setCreating(true); setTab('planos') }} />
              )}
            </>
          )}

          {tab === 'planos' && (
            <div className="grid gap-3">
              {creating ? (
                <PlanCreator
                  onCreate={(p) => { addPlan(p); setCreating(false); setTab('hoje') }}
                  onCancel={() => setCreating(false)}
                />
              ) : (
                <button onClick={() => setCreating(true)} className="rounded-2xl border-2 border-dashed border-line bg-white/50 py-4 font-semibold text-forest">
                  + Criar novo plano
                </button>
              )}
              {plans.map((p) => (
                <div key={p.id} className={`rounded-2xl border p-4 ${p.id === activeId ? 'border-forest bg-white/80' : 'border-line bg-white/50'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-serif text-lg font-bold text-forestdeep">{p.name}</div>
                      <div className="text-xs text-inksoft">
                        {SCOPES[p.scope]} · {p.totalVerses.toLocaleString('pt-BR')} vs. ·{' '}
                        {p.mode === 'free' ? 'leitura livre' : `${p.totalDays} dias · ${fmtBR(p.startDate)} → ${fmtBR(p.endDate)}`}
                      </div>
                    </div>
                    {p.id !== activeId && (
                      <button onClick={() => { setActiveId(p.id); setTab('hoje') }} className="rounded-lg bg-paper2 px-2.5 py-1.5 text-xs font-bold text-forestdeep">
                        Abrir
                      </button>
                    )}
                  </div>
                  {confirmDelete === p.id ? (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span>Excluir este plano?</span>
                      <button onClick={() => { removePlan(p.id); setConfirmDelete(false) }} className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white">Sim, excluir</button>
                      <button onClick={() => setConfirmDelete(false)} className="rounded-lg bg-paper2 px-2.5 py-1">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)} className="mt-2 text-xs text-red-600 underline">
                      excluir plano
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'backup' && <Backup plans={plans} onImport={(arr) => replaceAll(arr)} />}
        </main>

        <footer className="mt-10 border-t border-line pt-4 text-[12.5px] text-inksoft">
          <p>Cargas diárias calculadas pela contagem real de versículos de cada capítulo — do início ao fim, sem picos.</p>
          <p className="mt-1">Funciona 100% offline após o primeiro acesso. Instale na tela inicial pelo menu do navegador.</p>
        </footer>
      </div>
    </div>
  )
}

function PlanHeader({ plan }) {
  return (
    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-line bg-line">
      {[
        [plan.mode === 'free' ? 'livre' : fmtBR(plan.startDate), 'início'],
        [plan.mode === 'free' ? '—' : fmtBR(plan.endDate), 'fim'],
        [plan.mode === 'free' ? plan.entries.length : plan.totalDays, plan.mode === 'free' ? 'registros' : 'dias'],
        [`~${plan.mode === 'free' ? Math.round(plan.totalVerses / 100) : plan.avgPerDay}`, 'vs./dia']
      ].map(([num, lbl], i) => (
        <div key={i} className="bg-paper px-1 py-2.5 text-center">
          <span className="block font-serif text-[19px] font-bold text-forest">{num}</span>
          <span className="block text-[11px] text-inksoft">{lbl}</span>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-8 text-center">
      <div className="font-serif text-2xl font-bold text-forestdeep">📖</div>
      <h2 className="mt-2 font-serif text-xl font-bold text-forestdeep">Comece seu plano de leitura</h2>
      <p className="mt-1 text-sm text-inksoft">Bíblia toda, um testamento ou uma seleção de livros — com metas diárias proporcionais.</p>
      <button onClick={onNew} className="mt-4 rounded-xl bg-forest px-6 py-2.5 font-semibold text-white">
        Criar meu primeiro plano
      </button>
    </div>
  )
}
