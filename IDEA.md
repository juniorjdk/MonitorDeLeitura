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
