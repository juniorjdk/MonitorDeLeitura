# 📖📚 Plano de Leitura — Bíblia & Livros

Web app PWA para criar e acompanhar planos de leitura com metas diárias **proporcionais** — de Bíblia (por versículo) e, agora, de qualquer livro (por página ou capítulo) — tudo num único app instalável, 100% offline.

🔗 **App no ar:** [juniorjdk.github.io/MonitorDeLeitura](https://juniorjdk.github.io/MonitorDeLeitura/)

## 💛 Por que esse app existe

Esse app nasceu para minhas filhas, **Clara** e **Ana Julia**, registrarem suas leituras diárias e terem como gerenciar sua leitura com metas e cronograma — seja da Bíblia, seja de qualquer outro livro.

---

## ✨ O que o app faz

O app tem **3 telas independentes**, navegáveis por rota:

| Tela | O que é |
|---|---|
| 🏠 **Início** | Estatísticas agregadas das duas seções abaixo, com atalho pra cada uma |
| 📖 **Leitura Bíblica** | Planos de leitura da Bíblia, com metas proporcionais por versículo |
| 📚 **Minha Biblioteca** | Planos de leitura de qualquer livro, por página ou capítulo |

Cada seção guarda seus dados separadamente (nada se mistura), tem seu próprio backup exportável, e segue o mesmo padrão visual/de interação — só muda a paleta de cores de cada uma.

### 📖 Leitura Bíblica
- **Dados reais**: 66 livros, contagem exata de versículos por capítulo (AT + NT), pra metas diárias verdadeiramente proporcionais — não estimadas por capítulo.
- **Escopo flexível**: Bíblia toda, só Antigo Testamento, só Novo Testamento, ou uma seleção customizada de livros.
- **3 formas de definir a meta**: por quantidade de dias, por data final desejada, ou em modo de leitura livre (sem prazo).
- **Dashboard completo**: meta do dia em destaque, barra de progresso, indicadores de dias/versículos concluídos e restantes, lista de leitura organizada em blocos de 10 dias.
- **Recálculo em caso de atraso**: escolha entre manter a data final (redistribuindo a carga) ou prorrogar o prazo (mantendo a mesma média diária).

### 📚 Minha Biblioteca (novo módulo)
- Cadastre **qualquer livro** e escolha se o progresso é medido em **páginas** ou **capítulos**.
- As mesmas 3 formas de definir a meta da Bíblia (dias / data final / leitura livre) — na leitura livre, basta registrar até onde você chegou.
- Mesmo estilo de dashboard, blocos de 10 dias e recálculo de atraso da seção bíblica, com identidade visual própria.
- Múltiplos livros em andamento ao mesmo tempo, cada um com seu histórico.

### 📲 Funciona como app de verdade
- **Instalável** na tela inicial do celular ou computador (PWA).
- **100% offline** depois da primeira visita — service worker cacheia tudo.
- **Nunca perde progresso**: dados salvos localmente no dispositivo, com proteção contra limpeza automática do navegador.
- **Backup exportável**: cada seção tem seu próprio botão de exportar/importar `.json`.

---

## 🛠️ Stack

React + Vite + Tailwind CSS, sem backend e sem TypeScript — tudo roda no navegador, com `localStorage` como única persistência.

- **Roteamento**: `react-router-dom` (`HashRouter`)
- **PWA**: `vite-plugin-pwa` (service worker + manifest, atualização automática)
- **Deploy**: GitHub Actions → GitHub Pages, a cada push na `main`

## 🚀 Rodando localmente

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # gera dist/ (build de produção, PWA instalável)
npm run preview  # serve o build de produção localmente
```

## 📂 Estrutura do projeto

```
src/
  main.jsx                     # roteamento (HashRouter)
  App.jsx                      # seção Leitura Bíblica
  hooks/usePlans.js
  lib/bible.js
  components/                  # PlanCreator, Dashboard, Backup
  data/bible_structure.json    # estrutura dos 66 livros da Bíblia

  pages/
    HomePage.jsx                # tela inicial (estatísticas agregadas)

  features/books/               # seção Minha Biblioteca, isolada
    BooksApp.jsx
    hooks/useBooks.js
    lib/books.js
    components/                 # BookCreator, BookDashboard, BookHistory, BooksBackup
```

As duas seções de leitura são **totalmente independentes**: nenhum código, hook ou componente é compartilhado entre elas — cada uma tem sua própria lógica, persistência e paleta de cores. A única ponte é a tela inicial, que só lê as estatísticas de cada uma para exibição.

---

## 📌 Roadmap
- [ ] Streak / sequência de dias de leitura
- [ ] Notificações e lembretes
- [ ] Busca de metadados de livros (capa, ISBN)
