# Allu - Desafio Técnico Full-Stack

Monorepo com microsserviços (Node.js + Express, TypeScript) e frontend (React + Vite, TypeScript). Docker Compose com Postgres e stack de logs (Loki, Promtail, Grafana).

## Estrutura

- `apps/frontend` — React + Vite
- `services/catalog-service` — Catálogo de produtos (porta 3001)
- `services/search-service` — Busca (porta 3002)
- `services/cart-service` — Carrinho (porta 3003)
- `infra/` — Configurações Loki, Promtail, Grafana
- `docs/` — Documentação adicional

## Pré-requisitos

- Node.js 20+
- npm 9+
- Docker e Docker Compose (para rodar tudo via compose)

## Setup

Na raiz do repositório:

```bash
npm install
```

## Banco de dados (Prisma)

O projeto usa **Prisma** como ORM. Cada serviço com banco tem seu próprio schema em `prisma/schema.prisma`.

### Migrations e Seed (requer Postgres rodando)

```bash
# Subir apenas o Postgres
docker-compose up -d postgres

# catalog-service: gerar client, rodar migrations e seed
npm run prisma:generate -w catalog-service
npm run prisma:migrate -w catalog-service
npm run prisma:seed -w catalog-service

# cart-service: gerar client e rodar migrations
npm run prisma:generate -w cart-service
npm run prisma:migrate -w cart-service
```

### Prisma client isolado por serviço

Para evitar conflitos no monorepo, cada serviço gera o Prisma client em um diretório próprio:

| Serviço         | Output path                           | Import                          |
| --------------- | ------------------------------------- | ------------------------------- |
| catalog-service | `node_modules/.prisma/catalog-client` | `from ".prisma/catalog-client"` |
| search-service  | `node_modules/.prisma/search-client`  | `from ".prisma/search-client"`  |
| cart-service    | `node_modules/.prisma/cart-client`    | `from ".prisma/cart-client"`    |

## Desenvolvimento local

### Backend (um ou mais serviços)

```bash
cd services/catalog-service && npm run dev
# http://localhost:3001/health
# http://localhost:3001/products                              (lista paginada)
# http://localhost:3001/products?search=mac&sortBy=price&order=asc
# http://localhost:3001/products?minPrice=50&maxPrice=300
# http://localhost:3001/products?cursor=5&limit=3            (modo cursor)
# http://localhost:3001/products/1                           (produto por ID)
# http://localhost:3001/products/categories                  (categorias)
# http://localhost:3001/api-docs                             (Swagger)
```

```bash
cd services/search-service && npm run dev
# http://localhost:3002/health
# http://localhost:3002/search/suggestions?q=iphone&limit=5   (autocomplete)
# http://localhost:3002/search/products?q=apple&page=1&limit=10
# http://localhost:3002/api-docs
```

```bash
cd services/cart-service && npm run dev
# http://localhost:3003/health
# http://localhost:3003/carts/sess_abc                    (obter ou criar carrinho)
# http://localhost:3003/carts/sess_abc/items             (POST: adicionar item)
# http://localhost:3003/carts/sess_abc/items/1           (PATCH: quantidade; DELETE: remover)
# http://localhost:3003/api-docs
```

### Frontend

```bash
cd apps/frontend && npm run dev
```

Abre http://localhost:5173. Rotas: `/` (Home), `/catalog` (catálogo com infinite scroll) e `/search` (busca com autocomplete). O catálogo usa `VITE_CATALOG_API_URL` (padrão `http://localhost:3001`); a busca usa `VITE_SEARCH_API_URL` (padrão `http://localhost:3002`). Suba os serviços e Postgres para desenvolvimento local.

## Docker

Subir todos os serviços, frontend e stack de logs:

```bash
docker-compose up --build
```

| Serviço        | URL (local)                |
| -------------- | -------------------------- |
| Frontend       | http://localhost:80        |
| Catalog        | http://localhost:3001      |
| Search         | http://localhost:3002      |
| Cart           | http://localhost:3003      |
| Grafana (logs) | http://localhost:3000      |
| Postgres       | localhost:5432 (allu/allu) |

## Scripts (raiz)

| Comando                | Descrição                       |
| ---------------------- | ------------------------------- |
| `npm run lint`         | ESLint em todos os workspaces   |
| `npm run format`       | Prettier — formata código       |
| `npm run format:check` | Prettier — apenas verifica (CI) |
| `npm test`             | Jest em todos os workspaces     |
| `npm run build`        | Build de todos os workspaces    |

Para um único workspace (ex.: frontend):

```bash
npm run lint -w frontend
npm run format:check -w frontend
npm test -w frontend
npm run build -w frontend
```

## Swagger / OpenAPI

Cada serviço expõe a documentação OpenAPI 3.0 via Swagger UI no path `/api-docs`:

| Serviço | URL (dev)                      | Spec (arquivo)                              |
| ------- | ------------------------------ | ------------------------------------------- |
| Catalog | http://localhost:3001/api-docs | `services/catalog-service/src/openapi.json` |
| Search  | http://localhost:3002/api-docs | `services/search-service/src/openapi.json`  |
| Cart    | http://localhost:3003/api-docs | `services/cart-service/src/openapi.json`    |

### Endpoints documentados

| Serviço | Endpoint                             | Método | Descrição                                                  |
| ------- | ------------------------------------ | ------ | ---------------------------------------------------------- |
| Catalog | `/health`                            | GET    | Health check                                               |
| Catalog | `/products`                          | GET    | Lista paginada — modo offset ou cursor; filtros variados   |
| Catalog | `/products/:id`                      | GET    | Produto por ID numérico (400/404); cache em memória        |
| Catalog | `/products/categories`               | GET    | Categorias distintas ordenadas; cache em memória           |
| Search  | `/health`                            | GET    | Health check                                               |
| Search  | `/search/suggestions`                | GET    | Autocomplete (q, limit 1–20); cache em memória             |
| Search  | `/search/products`                   | GET    | Busca em nome/descrição (q, page, limit); cache em memória |
| Cart    | `/health`                            | GET    | Health check                                               |
| Cart    | `/carts/:sessionId`                  | GET    | Obter ou criar carrinho (sempre 200)                       |
| Cart    | `/carts/:sessionId/items`            | POST   | Adicionar item (body: productId, name, price, quantity?)   |
| Cart    | `/carts/:sessionId/items/:productId` | PATCH  | Alterar quantidade (body: quantity)                        |
| Cart    | `/carts/:sessionId/items/:productId` | DELETE | Remover item                                               |

#### Filtros e parâmetros de `GET /products`

| Parâmetro  | Tipo    | Descrição                                    |
| ---------- | ------- | -------------------------------------------- |
| `page`     | integer | Página (offset, padrão 1)                    |
| `limit`    | integer | Itens por página 1–100 (padrão 20)           |
| `cursor`   | integer | ID do último item — ativa modo cursor        |
| `category` | string  | Filtra por categoria exata                   |
| `search`   | string  | Busca parcial por nome (case-insensitive)    |
| `minPrice` | number  | Preço mínimo inclusive                       |
| `maxPrice` | number  | Preço máximo inclusive                       |
| `sortBy`   | string  | `name` \| `price` \| `createdAt` (só offset) |
| `order`    | string  | `asc` \| `desc` (só offset, padrão `desc`)   |

## Testes

- **Backend:** Jest + Supertest + jest-mock-extended (mock Prisma).
- **Frontend:** Jest + React Testing Library (App, Layout, Home, Catalog, Search, hooks, api/catalog, api/search).
- Descrições dos testes em pt-BR (`describe` / `it`).

Rodar todos os testes:

```bash
npm test
```

### Cobertura de testes (Etapa 7)

| Workspace       | Suites | Testes  |
| --------------- | ------ | ------- |
| frontend        | 10     | 44      |
| catalog-service | 5      | 55      |
| search-service  | 4      | 23      |
| cart-service    | 4      | 33      |
| **Total**       | **23** | **155** |

## Arquitetura de camadas (backend)

Cada serviço segue uma arquitetura em camadas inspirada em SOLID:

```
src/
├── index.ts               # Express app + middlewares + montagem de rotas
├── lib/
│   ├── prisma.ts           # Singleton PrismaClient
│   ├── logger.ts           # Pino logger
│   └── __mocks__/prisma.ts # Mock para testes
├── repositories/           # Acesso a dados (Prisma)
├── services/               # Regras de negócio
└── routes/                 # Rotas Express (DI do service)
```

## Logs (Docker)

Com `docker-compose up`, os serviços escrevem logs em JSON (pino) para o volume `app_logs`. O Promtail envia para o Loki; o Grafana (http://localhost:3000) já vem com o datasource Loki configurado para consultar os logs.

## Notas da Etapa 1

- Monorepo com workspaces npm (`apps/*`, `services/*`).
- TypeScript, ESLint e Prettier configurados na raiz e nos pacotes.
- Health checks e Swagger stub em cada serviço; logging estruturado com pino.
- Frontend com roteamento mínimo e layout responsivo (mobile-first).
- Ver `docs/ETAPA1.md` para resumo da Etapa 1.

## Notas da Etapa 2

- Prisma integrado no catalog-service e cart-service com output isolado por serviço.
- Modelo `Product` no catalog-service com seed de 10 produtos de exemplo.
- Modelos `Cart` e `CartItem` no cart-service (schema pronto, endpoints nas próximas etapas).
- Endpoints `GET /products` (paginação + filtro por categoria) e `GET /products/:id` implementados.
- Camadas repository → service → routes com injeção de dependência para testabilidade.
- 31 testes passando (21 no catalog, 8 no frontend, 1 search, 1 cart).
- Ver `docs/ETAPA2.md` para resumo da Etapa 2.

## Notas da Etapa 3

- Cache em memória (`SimpleCache`) com TTL configurável via `CACHE_TTL_MS` (padrão 60s).
- Paginação por cursor: passe `cursor=<id>` para navegar sem drift de offset.
- Novos filtros em `GET /products`: `search` (ILIKE), `minPrice`, `maxPrice`, `sortBy`, `order`.
- Novo endpoint `GET /products/categories`: lista categorias ativas ordenadas alfabeticamente.
- `deletedAt: null` adicionado a todas as queries (suporte completo a soft delete).
- 65 testes passando (55 no catalog-service, incluindo testes de cache).
- Ver `docs/ETAPA3.md` para resumo da Etapa 3.

## Notas da Etapa 5

- Cart-service com endpoints de carrinho por sessão: GET (obter ou criar), POST items (adicionar/upsert), PATCH items/:productId (quantidade), DELETE items/:productId (remover item, soft delete).
- Camadas repository → service → routes com DI; 119 testes no monorepo (33 no cart-service).
- Ver `docs/ETAPA5.md` para resumo da Etapa 5.

## Notas da Etapa 6

- Frontend: página **Catálogo** (`/catalog`) consumindo o catalog-service; infinite scroll com `IntersectionObserver`; cache client-side (lista acumulada em state no hook `useCatalogInfinite`).
- Config da API: `VITE_CATALOG_API_URL` (padrão `http://localhost:3001`). Navegação com links Início e Catálogo no layout; layout e catálogo com safe area e alvos de toque ≥ 44px (mobile).
- Testes: api/catalog, useCatalogInfinite, página Catalog; 132 testes no monorepo (21 no frontend).
- Ver `docs/ETAPA6.md` para resumo da Etapa 6.

## Notas da Etapa 7

- Frontend: página **Busca** (`/search`) consumindo o search-service; autocomplete com debounce (300 ms), dropdown de sugestões e resultados em grid; variável `VITE_SEARCH_API_URL` (padrão `http://localhost:3002`).
- UX mobile: safe area, input e itens do dropdown com alvo de toque ≥ 44px, form em coluna no mobile, fechamento do dropdown ao toque fora (`touchstart` + `mousedown`).
- Testes: api/search, useSearchSuggestions, useSearchResults, página Search; 155 testes no monorepo (44 no frontend).
- Ver `docs/ETAPA7.md` para resumo da Etapa 7.

## Notas da Etapa 4

- Search-service com Prisma (leitura da tabela Product), output `.prisma/search-client`.
- `GET /search/suggestions?q=&limit=` — autocomplete com ordenação por relevância (exata > startsWith > contains); cache em memória.
- `GET /search/products?q=&page=&limit=` — busca full-text em nome e descrição; resultado paginado e cacheado.
- 87 testes passando (23 no search-service: repository, service, routes).
- Ver `docs/ETAPA4.md` para resumo da Etapa 4.
