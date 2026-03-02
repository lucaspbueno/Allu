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
| cart-service    | `node_modules/.prisma/cart-client`    | `from ".prisma/cart-client"`    |

## Desenvolvimento local

### Backend (um ou mais serviços)

```bash
cd services/catalog-service && npm run dev
# http://localhost:3001/health
# http://localhost:3001/products      (lista paginada)
# http://localhost:3001/products/1    (produto por ID)
# http://localhost:3001/api-docs      (Swagger)
```

```bash
cd services/search-service && npm run dev
# http://localhost:3002/health
# http://localhost:3002/api-docs
```

```bash
cd services/cart-service && npm run dev
# http://localhost:3003/health
# http://localhost:3003/api-docs
```

### Frontend

```bash
cd apps/frontend && npm run dev
```

Abre http://localhost:5173

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

| Serviço | Endpoint        | Método | Descrição                                     |
| ------- | --------------- | ------ | --------------------------------------------- |
| Catalog | `/health`       | GET    | Health check                                  |
| Catalog | `/products`     | GET    | Lista paginada (query: page, limit, category) |
| Catalog | `/products/:id` | GET    | Produto por ID numérico (400/404)             |
| Search  | `/health`       | GET    | Health check                                  |
| Cart    | `/health`       | GET    | Health check                                  |

## Testes

- **Backend:** Jest + Supertest + jest-mock-extended (mock Prisma).
- **Frontend:** Jest + React Testing Library (App, Layout, Home).
- Descrições dos testes em pt-BR (`describe` / `it`).

Rodar todos os testes:

```bash
npm test
```

### Cobertura de testes (Etapa 2)

| Workspace       | Suites | Testes |
| --------------- | ------ | ------ |
| frontend        | 3      | 8      |
| catalog-service | 4      | 21     |
| search-service  | 1      | 1      |
| cart-service    | 1      | 1      |
| **Total**       | **9**  | **31** |

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
