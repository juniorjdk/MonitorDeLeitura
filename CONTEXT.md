# CONTEXT.md — biblia-plano-pwa v3

Stack: React + Vite + Tailwind (PWA), sem TypeScript. Roteamento: react-router-dom (HashRouter).

Documentação completa (fonte de verdade para qualquer detalhe não coberto neste resumo):
- `docs/Modulo_Livros_v2.md` — especificação completa do módulo de Livros
- `docs/Plano_Implementacao_Livros_v2.md` — plano de implementação em fases, com o prompt exato de cada fase

## Arquitetura — 3 telas, 2 módulos totalmente isolados

- `/` → `src/pages/HomePage.jsx` — só estatísticas globais (lê os dois localStorage em modo leitura), com links para `/biblia` e `/livros`. Não importa hooks/lib/componentes de nenhum dos dois módulos.
- `/biblia` → módulo **Leitura Bíblica** (existente, regra de zero-toque — ver abaixo)
  - `src/App.jsx`, `src/hooks/usePlans.js`, `src/lib/bible.js`, `src/components/{PlanCreator,Dashboard,Backup}.jsx`, `src/data/bible_structure.json`
  - localStorage: `bpwa-plans-v1`
  - Unidade de progresso: versículos (via `bible_structure.json`, 66 livros)
- `/livros` → módulo **Leitura de Livros** (novo, "Minha Biblioteca", pasta isolada)
  - `src/features/books/BooksApp.jsx` + `components/{BookCreator,BookDashboard,BookHistory,BooksBackup}.jsx` + `hooks/useBooks.js` + `lib/books.js`
  - Não existe `BookShelf.jsx` nem aba "Estante" — a lista de livros vive na própria aba "Livros"
  - localStorage: `bpwa-books-v1`
  - Unidade de progresso: páginas OU capítulos (escolhido por livro, **não convertível** depois de criado)
  - Modos de cronograma: dias / data final / leitura livre
    - Leitura livre = registro de **posição absoluta** ("cheguei até a página/capítulo X"), progresso = maior posição já registrada — **não** é soma/incremento de trechos lidos

**Navegação interna do módulo Livros:** exatamente 3 abas — 📚 Hoje / 📚 Livros / 💾 Backup — mesmo espírito visual/interativo das abas da Bíblia.

**Regra de isolamento:** os dois módulos não compartilham hooks, lib, componentes nem tokens de cor entre si (cada um reimplementa seus próprios utilitários de data, dentro de `lib/books.js` no caso de Livros). A única ponte é a `HomePage`, que só lê os dois localStorage — nunca escreve, nunca importa lógica de nenhum dos dois.

## Paleta Tailwind — DUAS paletas separadas, nunca compartilhadas

- **Bíblia** (intocável): `paper`, `paper2`, `ink`, `inksoft`, `forest`, `forestdeep`, `gold`, `goldsoft`, `line`, `todaybg`, `todayborder`.
- **Livros** (prefixo `bk-`, somada ao `theme.extend.colors`, nunca sobrescreve nem reaproveita os tokens da Bíblia): `bk-paper` `#F5F7FA`, `bk-paper2` `#E9EDF3`, `bk-ink` `#0D0D0D`, `bk-inksoft` `#566B73`, `bk-ocean` `#465E8C`, `bk-oceandeep` `#401D09`, `bk-clay` `#A6826D`, `bk-line` `#D6DEE7`, `bk-todaybg` `#F6EDE7`, `bk-todayborder` `#A6826D`.

Tipografia (Source Serif 4 + Inter) é compartilhada entre os dois módulos.

## Regra permanente

**Nunca** alterar, sob nenhuma circunstância — nem para ajustes pequenos de navegação/UX, nem como "tweak pontual": `src/App.jsx`, `src/lib/bible.js`, `src/hooks/usePlans.js`, `src/components/{PlanCreator,Dashboard,Backup}.jsx`, `src/data/bible_structure.json`. Se uma tarefa parecer exigir tocar nesses arquivos, pare e pergunte antes.

## Padrões de código

Componentes funcionais, hooks customizados, localStorage para persistência, sem backend, sem TypeScript. Toda mudança em arquivo já existente: aplicar via patch/diff, não reescrever o arquivo inteiro.
