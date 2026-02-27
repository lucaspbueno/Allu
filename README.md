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

## Desenvolvimento local

### Backend (um ou mais serviços)

```bash
cd services/catalog-service && npm run dev
# http://localhost:3001/health
# http://localhost:3001/api-docs (Swagger)
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

Endpoints documentados na Etapa 1: `GET /health` (health check) em cada serviço. Novos endpoints serão documentados nas próximas etapas.

## Testes

- **Backend:** Jest + Supertest (testes do endpoint `/health`).
- **Frontend:** Jest + React Testing Library (App, Layout, Home).
- Descrições dos testes em pt-BR (`describe` / `it`).

Rodar todos os testes:

```bash
npm test
```

## Logs (Docker)

Com `docker-compose up`, os serviços escrevem logs em JSON (pino) para o volume `app_logs`. O Promtail envia para o Loki; o Grafana (http://localhost:3000) já vem com o datasource Loki configurado para consultar os logs.

## Notas da Etapa 1

- Monorepo com workspaces npm (`apps/*`, `services/*`).
- TypeScript, ESLint e Prettier configurados na raiz e nos pacotes.
- Health checks e Swagger stub em cada serviço; logging estruturado com pino.
- Frontend com roteamento mínimo e layout responsivo (mobile-first).
- Ver `docs/ETAPA1.md` para resumo da Etapa 1.
