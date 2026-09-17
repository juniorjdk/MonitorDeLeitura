# Plano de Leitura — Visão Geral do App

> Este documento descreve a visão original do app (seção "Especificação original — Seção Bíblia" abaixo, hoje implementada e congelada na seção Bíblia) e a evolução para uma arquitetura de 3 telas independentes.

## Arquitetura atual (v3)

O app é um PWA em React + Vite + Tailwind CSS com 3 telas totalmente independentes, navegáveis por rota (`HashRouter`):

- **`/`** — Home: estatísticas agregadas (leitura somente da `localStorage`, sem lógica de escrita) e navegação para as duas seções.
- **`/biblia`** — Seção de leitura bíblica (ver especificação original abaixo). Implementada e **congelada**: nenhuma alteração de código é feita aqui desde a v3.
- **`/livros`** — Seção de leitura de livros, isolada, sem compartilhar código com a Bíblia. Ver especificação completa em `docs/Modulo_Livros_v2.md` e o plano de implementação em `docs/Plano_Implementacao_Livros_v2.md`.

Cada seção tem sua própria persistência no `localStorage` (`bpwa-plans-v1` para a Bíblia, `bpwa-books-v1` para Livros) e seu próprio backup exportável, sem misturar dados entre si.

Regra permanente: os arquivos `src/App.jsx`, `src/hooks/usePlans.js`, `src/lib/bible.js`, `src/components/PlanCreator.jsx`, `src/components/Dashboard.jsx`, `src/components/Backup.jsx` e `src/data/bible_structure.json` não são modificados — a seção Bíblia só passou a ser renderizada dentro de uma rota.

---

## Especificação original — Seção Bíblia

*(implementada e congelada; mantida aqui como referência histórica)*

Quero criar um Web App PWA completo, moderno e responsivo em React + Vite + Tailwind CSS para geração e gerenciamento flexível de planos de leitura bíblica.

Por favor, implemente a aplicação do zero seguindo esta estrutura e requisitos:

1. ESTRUTURA E DADOS BÍBLICOS (src/data/bible_structure.json):
   - Crie um arquivo JSON contendo a estrutura dos 66 livros da Bíblia com a contagem exata de capítulos e versículos por capítulo, permitindo cálculos proporcionais precisos por número real de versículos.

2. GERADOR E GESTOR DE PLANOS CUSTOMIZADOS:
   - Permita ao usuário criar e alternar entre múltiplos planos salvos no aplicativo:
     a) Escopo do Plano: Bíblia Toda, Antigo Testamento, Novo Testamento ou Seleção Customizada de Livros (sendo que para esse modo quero uma forma bem dinâmica de selecionar apenas os livros desejados ou um range de livros ).
     b) Definição de Meta: Escolher por "Quantidade de Dias" OU por "Data Final Desejada".
     c) Modo Leitura Livre: Registro espontâneo de capítulos/versículos lidos sem prazo fixo.
   - Divida as metas diárias de forma proporcional com base na contagem real de versículos, mantendo a carga diária equilibrada do início ao fim.

3. MOTOR DE RECÁLCULO EM CASO DE ATRASO:
   - Quando houver leituras pendentes em atraso, disponibilize a opção "Recalcular Plano" com duas abordagens:
     - "Recalcular Carga Diária": Mantém a data final original e redistribui os versículos restantes nos dias que sobram.
     - "Prorrogar Data Final": Mantém a média confortável de versículos/dia e empurra a data de término para frente.

4. PAINEL DE ACOMPANHAMENTO E PROGRESSO (DASHBOARD):
   - Destaque no topo a "Meta de Hoje" calculada pela data do sistema, com botão de rápida conclusão.
   - Exiba uma Barra de Progresso visual clara e intuitiva.
   - Mostre os indicadores exatos em texto e porcentagem:
     * % de dias concluídos vs. % de dias restantes.
     * Total de dias concluídos vs. total de dias restantes do plano.
     * Total de versículos lidos vs. versículos restantes.
   - Agrupe a lista de leitura em blocos retráteis (accordion) de 10 em 10 dias, permitindo marcar cada dia/meta individualmente.

5. PERSISTÊNCIA, BACKUP E SUPORTE PWA:
   - Salve todo o progresso no localStorage.
   - Ative a Persistent Storage API (navigator.storage.persist()) para proteger os dados contra limpezas automáticas do navegador.
   - Crie a seção de Backup com botões para "Exportar Backup" (download de arquivo .json) e "Importar Backup" (carregar arquivo .json).
   - Configure o plugin vite-plugin-pwa (service worker e manifest.json) para que o app funcione 100% offline e possa ser instalado na tela inicial do celular ou desktop.
