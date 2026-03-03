# Etapa 7 — Frontend: Busca (autocomplete + fuzzy UX)

Resumo do que foi entregue na Etapa 7 do Desafio Técnico Allu.

## Escopo

- Página **Busca** no frontend consumindo o search-service: **autocomplete** (sugestões com debounce) e **busca full-text** (resultados em grid).
- Variável de ambiente `VITE_SEARCH_API_URL` (padrão `http://localhost:3002`).
- UX mobile: safe area, alvos de toque ≥ 44px, form em coluna no mobile, dropdown com scroll suave e fechamento ao toque fora.
- 155 testes no monorepo (44 no frontend: App, Layout, Home, Catalog, Search, useCatalogInfinite, useSearchSuggestions, useSearchResults, api/catalog, api/search).

## Subfases

| Subfase | Conteúdo                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A       | SEARCH_API_BASE em config, tipos SuggestionItem/SearchResult, api/search, useSearchSuggestions (debounce), useSearchResults, página Search, rota /search, link Busca no Layout                    |
| B       | Testes: api/search, useSearchSuggestions (fake timers), useSearchResults, Search (mocks dos hooks); describe/it em pt-BR                                                                          |
| C       | Safe area na search-page; input min-height e padding; dropdown min(280px, 60vh) e -webkit-overflow-scrolling: touch; :active nos itens; form em coluna no mobile; touchstart para fechar dropdown |
| D       | Gates: lint, format:check, test, build — todos passando                                                                                                                                           |
| E       | README (rotas, VITE_SEARCH_API_URL, cobertura 23 suites / 155 testes), docs/ETAPA7.md, plano atualizado                                                                                           |

## Arquitetura do frontend (busca)

```
apps/frontend/src/
├── config/
│   └── api.ts                 # + SEARCH_API_BASE (VITE_SEARCH_API_URL ou localhost:3002)
├── types/
│   └── search.ts              # SuggestionItem, SearchResult (data: Product[])
├── api/
│   └── search.ts              # fetchSuggestions(q, limit?), fetchSearchProducts(q, page, limit?)
├── hooks/
│   ├── useSearchSuggestions.ts  # query → debounce 300ms → suggestions, loading, error
│   └── useSearchResults.ts      # submittedQuery → data, total, loading, error
├── pages/
│   └── Search.tsx             # Input, dropdown de sugestões, botão Buscar, grid de resultados
└── App.tsx                    # + Rota /search
```

## Rotas e variáveis de ambiente

| Rota       | Componente | Descrição                           |
| ---------- | ---------- | ----------------------------------- |
| `/`        | Home       | Página inicial                      |
| `/catalog` | Catalog    | Catálogo com infinite scroll        |
| `/search`  | Search     | Busca com autocomplete e resultados |

- **Variáveis:** `VITE_CATALOG_API_URL` (catalog-service), `VITE_SEARCH_API_URL` (search-service, padrão `http://localhost:3002`).

## Comportamento da busca

- **Autocomplete:** ao digitar, após 300 ms é chamado `GET /search/suggestions?q=...&limit=8`. Sugestões aparecem em dropdown (nome + categoria). Clique em uma sugestão preenche o termo e dispara a busca.
- **Busca:** ao enviar o formulário (Enter ou botão Buscar) ou ao clicar numa sugestão, é chamado `GET /search/products?q=...&page=1&limit=20`. Resultados exibidos em grid (mesmo padrão visual do catálogo); cada card leva a `/produto/:id`.
- **Dropdown:** fecha ao clicar/toque fora (listeners `mousedown` e `touchstart`).

## Decisões técnicas

- **Debounce 300 ms** nas sugestões para reduzir requisições enquanto o usuário digita.
- **Dropdown com max-height: min(280px, 60vh)** e `-webkit-overflow-scrolling: touch` para uso confortável em telas pequenas.
- **Form em coluna no mobile** (input + botão empilhados) para melhor alcance do botão; a partir de 480px, layout em linha.
- **Combobox/listbox** no markup para acessibilidade (role, aria-expanded, aria-selected).

## Próximas etapas

- **Etapa 8:** Frontend — Página do produto (carousel, preços, imagens); links já existem nos cards do catálogo e da busca.
- **Etapa 9:** Frontend — Carrinho persistente + fluxo completo.
