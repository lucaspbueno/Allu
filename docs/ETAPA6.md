# Etapa 6 — Frontend: Catálogo (infinite scroll + cache client-side)

Resumo do que foi entregue na Etapa 6 do Desafio Técnico Allu.

## Escopo

- Página **Catálogo** no frontend consumindo a API do catalog-service (`GET /products` com paginação offset).
- **Infinite scroll** via `IntersectionObserver`; carregamento da próxima página ao aproximar do fim da lista.
- **Cache client-side**: produtos acumulados no state do hook (não refetch de páginas já carregadas).
- UI mobile-first: safe area, alvos de toque ≥ 44px, grid responsivo (1 → 2 → 3 colunas).
- 132 testes no monorepo (21 no frontend: App, Layout, Home, Catalog, useCatalogInfinite, api/catalog).

## Subfases

| Subfase | Conteúdo                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A       | config/api, tipos Product/PaginatedProducts, api/catalog (fetchProducts), useCatalogInfinite, página Catalog, rota /catalog, nav no Layout  |
| B       | Testes: api/catalog (3), useCatalogInfinite (5), Catalog (5); describe/it em pt-BR                                                          |
| C       | Safe area (header/footer/container), touch targets na nav (≥ 44px), catalog padding-bottom; rootMargin 200px no mobile para infinite scroll |
| D       | Gates: lint, format:check, test, build; fix tipo do mock (jest.MockedFunction) no Catalog.test para tsc                                     |
| E       | README (rotas, VITE_CATALOG_API_URL, cobertura 19 suites / 132 testes), docs/ETAPA6.md, plano atualizado                                    |

## Arquitetura do frontend (catálogo)

```
apps/frontend/src/
├── config/
│   └── api.ts              # CATALOG_API_BASE (VITE_CATALOG_API_URL ou localhost:3001)
├── types/
│   └── product.ts          # Product, PaginatedProducts
├── api/
│   └── catalog.ts          # fetchProducts(page, limit, category?)
├── hooks/
│   └── useCatalogInfinite.ts  # products, loading, hasMore, error, loadMore; cache em state
├── pages/
│   └── Catalog.tsx          # Grid de cards, IntersectionObserver, ProductCard → /produto/:id
├── components/
│   └── Layout.tsx          # Nav com Início e Catálogo
└── App.tsx                 # Rotas / e /catalog
```

## Rotas e variável de ambiente

| Rota       | Componente | Descrição                    |
| ---------- | ---------- | ---------------------------- |
| `/`        | Home       | Página inicial               |
| `/catalog` | Catalog    | Catálogo com infinite scroll |

- **Variável:** `VITE_CATALOG_API_URL` — URL base do catalog-service (padrão `http://localhost:3001`). Usada em `fetchProducts`.

## Comportamento do catálogo

- **Primeira carga:** `useCatalogInfinite` chama `fetchProducts(1, 12)`; exibe loading até a resposta.
- **Infinite scroll:** um elemento sentinela no fim da lista é observado; quando entra no viewport (com `rootMargin` 100px ou 200px em viewport &lt; 768px), chama `loadMore()`, que busca a próxima página e concatena em `products`.
- **Cache:** não há nova requisição para páginas já carregadas; estado acumulado no hook.
- **Cards:** cada produto é um link para `/produto/:id` (página a ser implementada na Etapa 8).

## Decisões técnicas

- **Paginação offset:** uso de `page`/`limit` em vez de cursor no frontend para simplicidade e compatibilidade com a API existente.
- **rootMargin maior no mobile:** 200px em viewports &lt; 768px para disparar o carregamento antes do usuário chegar ao fim, melhorando a fluidez no scroll em telas pequenas.
- **Safe area e touch:** uso de `env(safe-area-inset-*)` e `min-height: 2.75rem` nos links da nav para dispositivos com notch e acessibilidade (WCAG 2.5.5).
- **Mock no teste:** `useCatalogInfinite` mockado em `Catalog.test.tsx` com `jest.MockedFunction` para o build `tsc` type-checkar corretamente.

## Próximas etapas

- **Etapa 7:** Frontend — Busca (autocomplete + fuzzy UX) consumindo o search-service.
- **Etapa 8:** Frontend — Página do produto (carousel, preços, link já presente nos cards).
- **Etapa 9:** Frontend — Carrinho persistente + fluxo completo.
