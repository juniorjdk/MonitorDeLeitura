# Especificação — Módulo de Livros v2 (biblia-plano-pwa)

Quero reestruturar o app "Plano de Leitura Bíblica" (React + Vite + Tailwind) em 3 telas totalmente independentes, navegáveis por rota: uma página inicial de estatísticas ("Home"), a seção da Bíblia (já existente, **NÃO deve ser alterada**) e uma nova seção de **Livros** (a ser criada do zero, isolada, chamada de "Minha Biblioteca").

A seção de Livros deve **espelhar exatamente** o layout, os componentes e os padrões de interação da seção da Bíblia — mesma estrutura de abas, mesmos tipos de card, mesma barra de progresso, mesma lógica de blocos de 10 dias e de recálculo de atraso — apenas adaptando o conteúdo de "versículos bíblicos" para "páginas ou capítulos de um livro". Não é para inventar um layout novo: é para reaproveitar o padrão visual/interativo já validado na Bíblia, com paleta de cores própria.

---

## REGRA MAIS IMPORTANTE

O app da Bíblia atual (`src/App.jsx`, `src/hooks/usePlans.js`, `src/lib/bible.js`, `src/components/PlanCreator.jsx`, `src/components/Dashboard.jsx`, `src/components/Backup.jsx`, `src/data/bible_structure.json`) **NÃO PODE SER MODIFICADO**. Nenhuma linha alterada, nenhum arquivo movido, nenhum token do Tailwind da Bíblia renomeado ou removido. Ele só passa a ser renderizado dentro de uma rota.

---

## 1) ROTEAMENTO

- Instalar `react-router-dom`.
- Usar `HashRouter` (compatível com o `base: './'` já configurado no `vite.config.js`, sem precisar de rewrite de servidor — não alterar `vite.config.js`).
- Rotas:
  - `/` → `HomePage` (nova)
  - `/biblia` → renderiza o `<App />` atual, importado sem nenhuma alteração
  - `/livros` → renderiza o novo `<BooksApp />`
- Ajustar **apenas** `src/main.jsx` para envolver a árvore com `<HashRouter>` e as `<Routes>`. Não tocar em `src/App.jsx`.

---

## 2) HOME PAGE (`src/pages/HomePage.jsx`) — só estatísticas, sem lógica de escrita

- Lê diretamente do `localStorage`, em modo somente leitura, as duas chaves existentes/futuras:
  - `"bpwa-plans-v1"` (planos bíblicos)
  - `"bpwa-books-v1"` (livros, nova)
- NÃO importa hooks, componentes ou lógica de nenhuma das duas seções — só faz `JSON.parse(localStorage.getItem(...))` e calcula agregados simples direto na própria página, para não criar acoplamento algum.
- Exibe dois blocos de estatísticas:
  - **Bíblia**: nome/progresso (%) do plano ativo, versículos lidos vs. restantes, total de planos salvos.
  - **Livros**: livros em andamento, livros concluídos, total de páginas/capítulos lidos somando todos os livros.
- Dois botões/cards grandes de navegação:
  - "📖 Leitura Bíblica" → link para `/biblia`
  - "📚 Minha Biblioteca" → link para `/livros`
- Se não houver nenhum plano/livro salvo ainda, mostrar estado vazio amigável com os mesmos dois links.

---

## 3) NOVA SEÇÃO "LIVROS" — estrutura de pastas isolada

`src/features/books/`, sem importar nada de `src/App.jsx`, `src/lib/bible.js`, `src/hooks/usePlans.js` ou `src/components/` da Bíblia. Reimplementar/copiar utilitários de data (`todayISO`, `parseISO`, `addDaysISO`, `diffDays`, `fmtBR`, `uid`, `distribute`) dentro da própria pasta, para zero acoplamento.

```
src/
  main.jsx                     ← único arquivo tocado fora das pastas novas
  App.jsx                      ← intocado
  index.css                    ← intocado
  hooks/usePlans.js            ← intocado
  lib/bible.js                 ← intocado
  components/                  ← intocado (Dashboard, PlanCreator, Backup)
  data/bible_structure.json    ← intocado

  pages/
    HomePage.jsx                ← nova, só leitura

  features/books/
    BooksApp.jsx                 ← componente raiz, navegação interna própria
    hooks/useBooks.js            ← persistência própria, localStorage key "bpwa-books-v1"
    lib/books.js                 ← geração de plano e estatísticas (ver modelo de dados)
    components/
      BookCreator.jsx
      BookDashboard.jsx
      BookHistory.jsx             ← histórico de registros de posição (leitura livre)
      BooksBackup.jsx              ← exporta/importa SÓ os livros, backup separado da Bíblia
```

**Navegação interna do `BooksApp.jsx`**: exatamente 3 abas, no mesmo espírito do `App.jsx` da Bíblia — **📚 Hoje / 📚 Livros / 💾 Backup** (a aba "Livros" substitui a aba "Planos" da Bíblia; não existe uma 4ª aba "Estante" — a lista de livros já vive dentro da aba "Livros").

---

## 4) IDENTIDADE VISUAL — paleta própria em `tailwind.config.js`

A Bíblia usa os tokens `paper/paper2/ink/inksoft/forest/forestdeep/gold/goldsoft/line/todaybg/todayborder`. Para não colidir em nenhum nome, todos os tokens da seção Livros usam o prefixo **`bk-`** e são **somados** ao `theme.extend.colors` já existente (não substituem nada da Bíblia):

| Token | Papel (equivalente na Bíblia) | Cor |
|---|---|---|
| `bk-paper` | fundo geral (= `paper`) | `#F5F7FA` |
| `bk-paper2` | fundo secundário / chips (= `paper2`) | `#E9EDF3` |
| `bk-ink` | texto principal (= `ink`) | `#0D0D0D` |
| `bk-inksoft` | texto secundário (= `inksoft`) | `#566B73` |
| `bk-ocean` | cor principal — botões, aba ativa, progresso (= `forest`) | `#465E8C` |
| `bk-oceandeep` | títulos (H1), negrito, borda de item ativo (= `forestdeep`) | `#401D09` |
| `bk-clay` | destaque quente — card "hoje", alertas de atraso, botão "+ Novo" (= `gold`) | `#A6826D` |
| `bk-line` | bordas (= `line`) | `#D6DEE7` |
| `bk-todaybg` | fundo do card "meta de hoje" (= `todaybg`) | `#F6EDE7` |
| `bk-todayborder` | borda do card "meta de hoje" (= `todayborder`) | `#A6826D` |

Tipografia: mantém **Source Serif 4** (serifada, títulos) + **Inter** (sans, corpo) — igual à Bíblia.

Barra de progresso e outros gradientes que na Bíblia usam `from-forest to-gold` devem usar `from-bk-ocean to-bk-clay` na seção de Livros.

---

## 5) MODELO DE DADOS DO "BOOK"

Dois eixos independentes de configuração, igual ao combinado:

**a) Unidade de progresso:**
- `unit: 'paginas' | 'capitulos'`
- `total: number` (inteiro > 0, informado manualmente pelo usuário — total de páginas ou de capítulos, conforme a unidade escolhida)
- A função `distribute(total, nDias)` é a mesma para os dois casos — só muda o rótulo exibido na UI ("~42 páginas/dia" vs. "~3 capítulos/dia").

**b) Modo de cronograma:**
- `mode: 'days' | 'date' | 'free'`
- `'days'` ou `'date'`: gera `days[] = [{ n, date, startLabel, endLabel, qty, done, doneAt }]` — `startLabel`/`endLabel` são números de página/capítulo (não referências bíblicas), `qty` é a quantidade daquele dia (equivalente a `verses` na Bíblia).
- `'free'`: gera `entries[] = [{ id, date, position, note }]` — registro da **posição absoluta** (página/capítulo) que o usuário alcançou naquele dia, com nota opcional.

**Estrutura completa de um "book":**
```js
{
  id, title, author,
  unit: 'paginas' | 'capitulos',
  total: number,
  status: 'lendo' | 'concluido' | 'pausado',
  mode: 'days' | 'date' | 'free',
  startDate, endDate, totalDays, avgPerDay,
  days: [{ n, date, startLabel, endLabel, qty, done, doneAt }],
  entries: [{ id, date, position, note }],
  createdAt, updatedAt
}
```

**Funções em `lib/books.js`** (mesma assinatura e comportamento das equivalentes em `lib/bible.js`, reimplementadas sem import cruzado):
`generateBook`, `bookStats(book, today)`, `recalcKeepEndDate(book, today)`, `recalcExtendEndDate(book, today)`, `todayISO`, `parseISO`, `addDaysISO`, `diffDays`, `fmtBR`, `uid`, `distribute`.

---

## 6) LAYOUT E INTERAÇÃO — espelhamento detalhado

### 6.1 `BooksApp.jsx` (equivalente ao `App.jsx`)
- Header: kicker "Cronograma por página/capítulo", H1 **"Minha Biblioteca"**, subtítulo itálico equivalente.
- Nav de 3 abas: **📚 Hoje / 📚 Livros / 💾 Backup** — mesmo estilo de botão ativo/inativo do `App.jsx` da Bíblia, com cores `bk-ocean`.
- Aba **Hoje**: seletor de livro ativo (dropdown) + botão "+ Novo" (mesmo padrão da Bíblia), `PlanHeader`-equivalente (stat-strip de 4 colunas: início/fim/dias/**pág.-cap. por dia**), e o `BookDashboard`.
- Aba **Livros**: botão "+ Adicionar livro" + lista de cards (título + autor, status, "Abrir"/"excluir" com confirmação) — mesmo padrão de card da aba "Planos" da Bíblia.
- Aba **Backup**: idêntico ao `Backup.jsx`, trocando a chave de storage e o rótulo do arquivo exportado (`livros-backup-AAAA-MM-DD.json`, payload `{ app: 'biblia-plano-pwa-livros', version: 1, exportedAt, books }`).
- `EmptyState` equivalente: ícone 📚, texto convidando a cadastrar o 1º livro, botão de criar.
- Footer com nota equivalente sobre leitura de livros.

### 6.2 `BookDashboard.jsx` (equivalente ao `Dashboard.jsx`)
- Card "Meta de hoje" (fundo `bk-todaybg`, borda `bk-todayborder`): "Dia N · até página/capítulo X" + botão "✓ Concluir meta de hoje". Mesma lógica de foco (dia de hoje pendente ou próximo dia se em dia) e mesmo card "Livro concluído! 🎉" ao final.
- Barra de progresso + `%` + "dia X de Y" — idêntico, gradiente `from-bk-ocean to-bk-clay`.
- Grid de 6 indicadores (dias concluídos/restantes, dias feitos, unidades lidas/restantes, média/dia) — trocando "versículos" por "páginas" ou "capítulos" conforme `unit` do livro.
- Painel de atraso: "⚠ N dia(s) em atraso" + botões "Recalcular carga diária" (mantém data final) / "Prorrogar data final" (mantém a média) — mesma lógica de `recalcKeepEndDate`/`recalcExtendEndDate`.
- Blocos de 10 dias colapsáveis, cada dia com ✓ circular, data, "até pág./cap. X", contagem de unidades — idêntico ao padrão de blocos da Bíblia.
- Se `plan.mode === 'free'`, renderiza `BookHistory` no lugar do `FreePanel`.

### 6.3 `BookHistory.jsx` (substitui o `FreePanel` da Bíblia)
Como o registro livre aqui é por **posição absoluta**, não por trecho:
- Card de progresso no topo (mesmo estilo do card de progresso do `FreePanel`): "posição atual / total" + barra de progresso + `%`.
- Formulário: campo numérico **"Cheguei até a página/o capítulo: [___]"** + campo de nota opcional + botão "Registrar".
- Progresso = **maior `position` já registrada** (`pctUnits = position_max / total`), não soma de trechos.
- Histórico abaixo, mesmo padrão de lista da Bíblia (data, posição, nota, botão "remover"). Remover um registro recalcula o máximo automaticamente a partir do que restar.

### 6.4 `BookCreator.jsx` (equivalente ao `PlanCreator.jsx`)
- Campos: **Título*** (obrigatório), **Autor** (opcional).
- Seletor **"Medir progresso por:"** → Páginas | Capítulos (muda o rótulo do campo seguinte dinamicamente).
- Campo numérico: "Total de páginas" ou "Total de capítulos", conforme escolhido.
- Seletor de cronograma: **Qtd. de dias / Data final / Leitura livre** — mesmo estilo de botão do `PlanCreator` da Bíblia.
- Campos de Início/Dias ou Início/Data final — idênticos.
- Texto explicativo do modo livre — adaptado ("posição absoluta", não trecho).
- Resumo ao vivo: "312 páginas em 20 dias (~15,6 páginas/dia), termina em dd/mm".
- Botões "Adicionar livro" / "Cancelar".
- Não existe equivalente ao `BookSelector` de múltiplos livros bíblicos (aqui é sempre 1 livro por vez, sem seleção de escopo).

### 6.5 `BooksBackup.jsx` (equivalente ao `Backup.jsx`)
Idêntico em UI e fluxo (exportar/importar `.json`), isolado da Bíblia — nunca lê nem grava `"bpwa-plans-v1"`.

---

## 7) EDGE CASES

- `total` (páginas ou capítulos) vazio ou ≤ 0 → erro tratado.
- `totalDays` ≤ 0 (modo `days`) → erro tratado.
- Data final anterior à data de início (modo `date`) → erro tratado.
- Remover um livro que está expandido na tela no momento → não pode quebrar a UI.
- Permitir múltiplos livros com o mesmo título (ids independentes).
- Trocar a unidade (páginas ↔ capítulos) de um livro já existente **não é permitido** — para mudar, o usuário precisa criar um novo livro.
- Registro de posição livre menor que a última posição registrada, ou maior que `total` → erro tratado ("a posição deve ser maior que a última registrada e não pode ultrapassar o total").

---

## 8) FORA DE ESCOPO POR ENQUANTO

- Qualquer dado compartilhado entre Bíblia e Livros além da leitura somente-visualização feita pela `HomePage`.
- Streak/sequência de dias lendo.
- Notificações/lembretes, busca de metadados externos (capa, ISBN, etc.).
- Aba "Estante" separada (a lista de livros vive na aba "Livros").
