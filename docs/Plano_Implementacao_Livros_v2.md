# Plano de Implementação — Módulo de Livros v2
### (com o texto exato de prompt para cada fase)

## Como usar este documento

1. Antes da Fase 1, faça a limpeza e o backup manuais (ver Fase 0 abaixo).
2. Na primeira mensagem ao Hermes, anexe **os dois arquivos**: o zip do código-fonte atual e o `Modulo_Livros_v2.md`. Diga que esses dois anexos valem para todas as fases seguintes da conversa.
3. Envie **um prompt por vez**, na ordem abaixo. Não pule fases nem peça "adiante-se" para a próxima.
4. Depois de cada resposta do Hermes, rode o teste indicado na fase e só então copie o prompt da fase seguinte.
5. Se o Hermes disser em algum momento que precisa alterar um dos arquivos protegidos da Bíblia, **pare e volte aqui** — algo no entendimento dele está desalinhado do plano.

---

### Fase 0 — Preparação (manual, sem prompt)
- [ ] Criar branch/checkpoint de git antes de começar
- [ ] Remover os dois arquivos de protótipo legado identificados no audit anterior (`git rm`)
- [ ] Instalar `react-router-dom` (`npm install react-router-dom`)
- [ ] Rodar o app como está hoje e confirmar que builda/roda normalmente (baseline antes de qualquer mudança)

---

### Prompt 0 — Dry run (antes de qualquer código)

> Anexei o código-fonte atual do app "Plano de Leitura Bíblica" e o documento `Modulo_Livros_v2.md` com a especificação completa de um novo módulo de Livros que quero adicionar a este projeto.
>
> **Antes de escrever qualquer código**, quero que você:
> 1. Liste, fase por fase (seguindo a ordem do documento de especificação), quais arquivos você vai criar e quais (se algum) você entende que precisaria tocar.
> 2. Confirme explicitamente que entendeu que os seguintes arquivos **não podem ser modificados de forma alguma**: `src/App.jsx`, `src/hooks/usePlans.js`, `src/lib/bible.js`, `src/components/PlanCreator.jsx`, `src/components/Dashboard.jsx`, `src/components/Backup.jsx`, `src/data/bible_structure.json`.
> 3. Não gere nenhum código ainda — só a lista e a confirmação.

**Teste:** confira se a lista de arquivos bate com a estrutura de pastas da seção 3 do `Modulo_Livros_v2.md`, e se nenhum arquivo protegido aparece na lista de "a tocar".

---

### Fase 1 — Roteamento mínimo

**Checklist**
- [ ] Ajustar **só** `src/main.jsx`: envolver com `<HashRouter>`, rota `/biblia` → `<App />` (sem alterar `App.jsx`), rota `/` e `/livros` apontando pra uma tela provisória (`<div>em construção</div>`)

**Prompt sugerido:**
> Vamos para a Fase 1 do plano: roteamento mínimo, seção 1 do `Modulo_Livros_v2.md`.
>
> Implemente **apenas** isso:
> - Instale e configure `react-router-dom` com `HashRouter`.
> - Altere **somente** `src/main.jsx` para envolver a árvore com `<HashRouter>` e `<Routes>`.
> - Rota `/biblia` deve renderizar `<App />` importado sem nenhuma alteração.
> - Rotas `/` e `/livros` podem renderizar, por enquanto, um placeholder simples (`<div>em construção</div>`).
>
> Não crie ainda `HomePage.jsx` nem nada de `src/features/books/` — isso é de fases futuras.
>
> Ao final, me mostre o `git diff --stat` para eu confirmar que só `src/main.jsx` e o `package.json`/`package-lock.json` foram alterados.

**Teste:** abrir `/#/biblia` e confirmar que a Bíblia funciona 100% igual a antes (todas as abas, criação de plano, backup, recálculo de atraso). Abrir `/` e `/#/livros` e confirmar que carregam sem erro.

---

### Fase 2 — Tokens Tailwind

**Checklist**
- [ ] Adicionar os 10 tokens `bk-*` em `tailwind.config.js`, dentro de `theme.extend.colors`, sem tocar nos tokens existentes da Bíblia

**Prompt sugerido:**
> Fase 2: paleta visual, seção 4 do `Modulo_Livros_v2.md`.
>
> Adicione, em `tailwind.config.js`, os 10 tokens `bk-*` (com os hex exatos da tabela da seção 4) dentro de `theme.extend.colors`, **sem remover, renomear ou alterar valor de nenhum token já existente** (`paper`, `paper2`, `ink`, `inksoft`, `forest`, `forestdeep`, `gold`, `goldsoft`, `line`, `todaybg`, `todayborder`).
>
> Não crie nenhum componente ainda. Ao final, mostre o `git diff` do `tailwind.config.js`.

**Teste:** rodar o build e confirmar que a Bíblia continua com as mesmas cores de antes (nenhum token sobrescrito).

---

### Fase 3 — `lib/books.js` (funções puras, sem UI)

**Checklist**
- [ ] Implementar `todayISO`, `parseISO`, `addDaysISO`, `diffDays`, `fmtBR`, `uid`, `distribute`
- [ ] Implementar `generateBook`, `bookStats`, `recalcKeepEndDate`, `recalcExtendEndDate`

**Prompt sugerido:**
> Fase 3: seção 5 do `Modulo_Livros_v2.md` (modelo de dados) — só a camada de lógica pura, sem UI.
>
> Crie `src/features/books/lib/books.js` com as funções: `todayISO`, `parseISO`, `addDaysISO`, `diffDays`, `fmtBR`, `uid`, `distribute`, `generateBook`, `bookStats`, `recalcKeepEndDate`, `recalcExtendEndDate` — mesma assinatura e comportamento das equivalentes em `src/lib/bible.js` (que você pode consultar como referência de estilo, mas **sem importar nada de lá**).
>
> Estrutura do "book" exatamente como descrita na seção 5.
>
> Não crie componentes React nem o hook de persistência ainda. Ao final, me dê 2-3 exemplos de chamada dessas funções (pode ser um pequeno trecho comentado ou um `console.log` de exemplo) pra eu validar manualmente antes de seguir.

**Teste:** validar manualmente (console do navegador ou os exemplos que o Hermes fornecer) com 2-3 cenários: livro de 300 páginas em 20 dias, livro de 15 capítulos em 10 dias, um cenário de atraso simulando uma data futura.

---

### Fase 4 — `hooks/useBooks.js` (persistência)

**Checklist**
- [ ] Implementar leitura/escrita em `localStorage` na chave `"bpwa-books-v1"`
- [ ] Funções: criar livro, atualizar livro, remover livro, marcar dia como concluído, adicionar/remover entrada de posição (modo livre)

**Prompt sugerido:**
> Fase 4: hook de persistência, ainda sem UI.
>
> Crie `src/features/books/hooks/useBooks.js`, usando as funções de `lib/books.js` da fase anterior, persistindo em `localStorage` na chave `"bpwa-books-v1"`. Exponha: criar livro, atualizar livro, remover livro, marcar/desmarcar dia como concluído, adicionar entrada de posição e remover entrada de posição (recalculando o máximo).
>
> Não crie os componentes visuais ainda. Ao final, mostre o `git diff --stat`.

**Teste:** criar um livro via um teste isolado (ou um botão temporário de debug) e confirmar no DevTools (Application → Local Storage) que o objeto salvo bate com a estrutura da seção 5.

---

### Fase 5 — `BookCreator.jsx`

**Checklist**
- [ ] Formulário completo: título, autor, unidade (páginas/capítulos), total, modo (dias/data/livre), resumo ao vivo
- [ ] Validações dos edge cases: total ≤ 0, totalDays ≤ 0, data final < início

**Prompt sugerido:**
> Fase 5: seção 6.4 do `Modulo_Livros_v2.md`.
>
> Crie `src/features/books/components/BookCreator.jsx`, espelhando o layout e a interação de `src/components/PlanCreator.jsx` (você pode abrir esse arquivo como referência visual, mas **sem importar nada dele**), usando as cores `bk-*` da Fase 2 e o `useBooks` da Fase 4.
>
> Inclua as validações da seção 7 do `Modulo_Livros_v2.md` que se aplicam à criação: total ≤ 0, totalDays ≤ 0 (modo dias), data final anterior ao início (modo data).
>
> Ainda não precisa estar conectado a uma tela completa — pode ser testado isoladamente. Ao final, mostre o `git diff --stat`.

**Teste:** criar um livro em cada um dos 3 modos e confirmar que o resumo ao vivo bate com o `days[]`/`entries[]` gerado.

---

### Fase 6 — `BookDashboard.jsx`

**Checklist**
- [ ] Card "Meta de hoje", barra de progresso, grid de 6 indicadores
- [ ] Blocos de 10 dias colapsáveis com checkbox de concluído
- [ ] Painel de atraso com os dois botões de recálculo

**Prompt sugerido:**
> Fase 6: seção 6.2 do `Modulo_Livros_v2.md`.
>
> Crie `src/features/books/components/BookDashboard.jsx`, espelhando exatamente o layout e a interação de `src/components/Dashboard.jsx` (referência visual, sem import cruzado): card "Meta de hoje" (`bk-todaybg`/`bk-todayborder`), barra de progresso com gradiente `from-bk-ocean to-bk-clay`, grid de 6 indicadores, blocos de 10 dias colapsáveis, e o painel de atraso com "Recalcular carga diária" e "Prorrogar data final" usando `recalcKeepEndDate`/`recalcExtendEndDate`.
>
> Ao final, mostre o `git diff --stat`.

**Teste:** simular um livro com data de início no passado (criando um livro com início alguns dias atrás) para forçar o estado de atraso e testar os dois recálculos. Marcar/desmarcar dias e confirmar que a barra de progresso e os indicadores atualizam corretamente.

---

### Fase 7 — `BookHistory.jsx` (modo leitura livre)

**Checklist**
- [ ] Card de progresso (posição atual / total)
- [ ] Formulário de registro de posição + nota opcional
- [ ] Histórico com opção de remover, recalculando o máximo

**Prompt sugerido:**
> Fase 7: seção 6.3 do `Modulo_Livros_v2.md`.
>
> Crie `src/features/books/components/BookHistory.jsx` para o modo `mode: 'free'`. Diferente do `FreePanel` da Bíblia, aqui o registro é por **posição absoluta** (não soma de trechos): campo "Cheguei até a página/o capítulo: [___]" + nota opcional, progresso = maior posição já registrada, histórico com opção de remover recalculando o máximo.
>
> Inclua as validações: posição menor que a última registrada, ou maior que o total, devem mostrar erro tratado.
>
> Ao final, mostre o `git diff --stat`.

**Teste:** registrar 3-4 posições fora de ordem, remover a mais recente e confirmar que o "máximo" recalcula certo. Tentar registrar uma posição menor que a última, e uma maior que o total — confirmar que os dois erros aparecem.

---

### Fase 8 — `BooksApp.jsx` (montagem final)

**Checklist**
- [ ] Header, 3 abas (Hoje/Livros/Backup), seletor de livro ativo, `EmptyState`, footer
- [ ] Integrar `BookCreator`, `BookDashboard`/`BookHistory`, lista de livros

**Prompt sugerido:**
> Fase 8: seção 6.1 do `Modulo_Livros_v2.md`.
>
> Crie `src/features/books/BooksApp.jsx`, montando tudo que já existe: header com H1 "Minha Biblioteca", nav de 3 abas (📚 Hoje / 📚 Livros / 💾 Backup — mesmo estilo do `App.jsx` da Bíblia, sem importar de lá), seletor de livro ativo, `EmptyState`, footer, e a integração de `BookCreator`, `BookDashboard`/`BookHistory` (conforme `mode` do livro) e a lista de livros na aba "Livros".
>
> Depois, conecte essa rota em `src/main.jsx`: `/livros` → `<BooksApp />`, substituindo o placeholder da Fase 1.
>
> Ao final, mostre o `git diff --stat`.

**Teste end-to-end:** do zero — abrir `/livros` sem nenhum livro salvo, criar o primeiro livro, navegar entre as 3 abas, trocar de livro ativo, excluir um livro.

---

### Fase 9 — `BooksBackup.jsx`

**Checklist**
- [ ] Exportar `.json` com o payload `{ app: 'biblia-plano-pwa-livros', version: 1, exportedAt, books }`
- [ ] Importar `.json` (com validação básica do formato)

**Prompt sugerido:**
> Fase 9: seção 6.5 do `Modulo_Livros_v2.md`.
>
> Crie `src/features/books/components/BooksBackup.jsx`, espelhando `src/components/Backup.jsx` (referência visual, sem import cruzado). Payload de exportação: `{ app: 'biblia-plano-pwa-livros', version: 1, exportedAt, books }`, nome de arquivo `livros-backup-AAAA-MM-DD.json`. Conecte essa aba dentro do `BooksApp.jsx`.
>
> Ao final, mostre o `git diff --stat`.

**Teste:** exportar, apagar os dados do `localStorage`, importar de volta e confirmar que tudo volta idêntico.

---

### Fase 10 — `HomePage.jsx`

**Checklist**
- [ ] Leitura somente-leitura das duas chaves de `localStorage`
- [ ] Dois blocos de estatísticas (Bíblia / Livros) + dois cards de navegação
- [ ] Estado vazio quando não há nada salvo em nenhuma das duas seções

**Prompt sugerido:**
> Fase 10: seção 2 do `Modulo_Livros_v2.md`.
>
> Crie `src/pages/HomePage.jsx`. Lê diretamente do `localStorage` (`"bpwa-plans-v1"` e `"bpwa-books-v1"`) em modo **somente leitura**, sem importar nenhum hook/componente/lógica da Bíblia nem de Livros — só `JSON.parse` direto e cálculo de agregados na própria página. Dois blocos de estatísticas e dois cards de navegação ("📖 Leitura Bíblica" → `/biblia`, "📚 Minha Biblioteca" → `/livros`), com estado vazio amigável quando não houver nada salvo.
>
> Conecte a rota `/` a esse componente em `src/main.jsx`, substituindo o placeholder da Fase 1.
>
> Ao final, mostre o `git diff --stat`.

**Teste:** com dados só na Bíblia, só em Livros, em ambas, e em nenhuma — 4 cenários.

---

### Fase 11 — Revisão final de edge cases

**Checklist**
- [ ] Repassar a lista completa da seção 7 do `Modulo_Livros_v2.md` um a um
- [ ] Confirmar que nenhum arquivo da Bíblia foi tocado

**Prompt sugerido:**
> Fase 11: revisão final.
>
> Rode `git diff --stat` do projeto inteiro (comparado com o commit antes da Fase 1) e confirme que `src/App.jsx`, `src/hooks/usePlans.js`, `src/lib/bible.js`, `src/components/PlanCreator.jsx`, `src/components/Dashboard.jsx`, `src/components/Backup.jsx` e `src/data/bible_structure.json` aparecem com **zero alterações**.
>
> Depois, revise um a um todos os edge cases da seção 7 do `Modulo_Livros_v2.md` e me diga, para cada um, se está tratado e onde (arquivo/linha).

**Teste:** validar manualmente cada edge case da lista, tentando reproduzi-lo na UI.

---

### Fase 12 — Fechamento (manual, sem prompt)
- [ ] Build de produção final e teste em modo preview
- [ ] Confirmar que o PWA (manifest/ícones) continua funcionando normalmente com as novas rotas
- [ ] Commit final com mensagem descritiva
