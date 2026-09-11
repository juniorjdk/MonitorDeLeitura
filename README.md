# 📖 Plano de Leitura Bíblica (PWA)

Web app em React + Vite + Tailwind para gerar e acompanhar planos de leitura bíblica com metas diárias **proporcionais à contagem real de versículos**.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ (PWA instalável, 100% offline)
npm run preview  # serve o build de produção
```

## Funcionalidades

- **Dados bíblicos** (`src/data/bible_structure.json`): 66 livros, versículos por capítulo (AT 23.145 + NT 7.957 = 31.102).
- **Planos**: Bíblia toda, AT, NT ou seleção customizada (busca, presets, range de livros); meta por quantidade de dias, data final ou **leitura livre** (registro espontâneo).
- **Dashboard**: Meta de Hoje, barra de progresso, % e totais de dias/versículos, accordion de 10 em 10 dias.
- **Recálculo em atraso**: manter data final (redistribui carga) ou prorrogar data final (mantém média).
- **Persistência**: localStorage + `navigator.storage.persist()`; backup exportar/importar `.json`.
- **PWA**: service worker + manifest, ícones 192/512/maskable, instalável e offline.
