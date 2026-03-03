# Etapa 4 — Busca (autocomplete + fuzzy) + endpoints

Resumo do que foi entregue na Etapa 4 do Desafio Técnico Allu.

## Escopo

- Search-service passa a usar **Prisma** para leitura da tabela `Product` (mesmo banco do catalog-service).
- **Autocomplete**: `GET /search/suggestions` com ordenação por relevância (exata > começa com > contém).
- **Busca full-text**: `GET /search/products` em nome e descrição, com paginação.
- Cache em memória (SimpleCache) para sugestões e resultados de busca.
- 87 testes no monorepo (23 no search-service).

## Subfases

| Subfase | Conteúdo                                                                            |
| ------- | ----------------------------------------------------------------------------------- |
| A       | Prisma (schema Product, output search-client), repository/service/routes, cache, DI |
| B       | Testes: SearchRepository (6), SearchService (8), rotas (9); cache mock              |
| C       | Sem alterações (etapa backend-only)                                                 |
| D       | Gates: lint, format:check, test (87 OK), build — todos passando                     |
| E       | OpenAPI v0.2.0 do search-service, README, esta nota                                 |

## Arquitetura do search-service

```
src/
├── index.ts                    # Express app, monta /search
├── lib/
│   ├── prisma.ts                # Singleton (.prisma/search-client)
│   ├── logger.ts
│   ├── cache.ts
│   └── __mocks__/prisma.ts
├── repositories/
│   └── search.repository.ts     # suggest, search, searchCount
├── services/
│   └── search.service.ts        # suggest + search com cache
└── routes/
    └── search.routes.ts         # GET /suggestions, GET /products
```

Rotas expostas pelo app: `GET /search/suggestions`, `GET /search/products`.

## API do search-service (v0.2.0)

### GET /search/suggestions

| Parâmetro | Tipo    | Obrigatório | Descrição                    |
| --------- | ------- | ----------- | ---------------------------- |
| `q`       | string  | sim\*       | Texto de busca (\*após trim) |
| `limit`   | integer | não         | 1–20, padrão 5               |

Se `q` estiver vazio, retorna `{ "data": [] }` sem consultar o banco.

**Exemplo:** `GET /search/suggestions?q=iphone&limit=5`

**Resposta:** `{ "data": [ { "id": 1, "name": "iPhone 15 Pro", "category": "Smartphones" }, ... ] }`

### GET /search/products

| Parâmetro | Tipo    | Obrigatório | Descrição        |
| --------- | ------- | ----------- | ---------------- |
| `q`       | string  | sim\*       | Texto de busca   |
| `page`    | integer | não         | Padrão 1         |
| `limit`   | integer | não         | 1–100, padrão 20 |

Se `q` estiver vazio, retorna `{ data: [], total: 0, page, limit, totalPages: 0 }`.

**Exemplo:** `GET /search/products?q=apple&page=1&limit=10`

**Resposta:** `{ "data": [ Product, ... ], "total": 3, "page": 1, "limit": 10, "totalPages": 1 }`

## Prisma no search-service

- **Schema:** `prisma/schema.prisma` com modelo `Product` (mesma estrutura do catalog-service).
- **Output:** `../node_modules/.prisma/search-client` (isolado no monorepo).
- **Uso:** Apenas leitura; não executa migrations (a tabela já existe via catalog-service). Em ambiente novo: subir Postgres, rodar migrations pelo catalog-service, depois `prisma generate` no search-service.

## Cache

| Chave                                | TTL | Uso            |
| ------------------------------------ | --- | -------------- |
| `search:suggest:<q>:<limit>`         | 60s | Sugestões      |
| `search:products:<q>:<page>:<limit>` | 60s | Busca paginada |

`CACHE_TTL_MS` (env) configurável; padrão 60_000 ms.

## Testes (search-service)

| Arquivo                   | Testes | Tipo        |
| ------------------------- | ------ | ----------- |
| search.repository.test.ts | 6      | Unit        |
| search.service.test.ts    | 8      | Unit        |
| search.routes.test.ts     | 9      | Integration |
| health.test.ts            | 1      | Integration |

Todos os `describe`/`it` em pt-BR.

## Decisões técnicas

- **Leitura direta do Postgres:** Search-service não chama o catalog-service via HTTP; lê a tabela `Product` com Prisma. Reduz latência e simplifica testes (mock do Prisma).
- **Relevância em memória:** Após `findMany` com `contains`, a ordenação (exata > startsWith > contains) é feita em JS. Adequado para o volume atual; em escala maior pode-se usar `pg_trgm` ou Elasticsearch.
- **Query vazia:** Tanto `suggest` quanto `search` retornam imediatamente quando `q.trim()` é vazio, sem acessar repository nem cache.

## Próximas etapas

- **Etapa 5:** Carrinho — endpoints CRUD com persistência por sessão no cart-service.
- **Etapa 7:** Frontend — tela de busca com autocomplete consumindo `GET /search/suggestions` e `GET /search/products`.
