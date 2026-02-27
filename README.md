# Allu - Desafio Técnico Full-Stack

Monorepo com microsserviços (Node.js + Express) e frontend (React + Vite). TypeScript, Docker, Loki/Promtail/Grafana para logs.

## Setup

```bash
npm install
```

## Desenvolvimento local

- **Backend (ex.: catalog):** `cd services/catalog-service && npm run dev` → http://localhost:3001/health e http://localhost:3001/api-docs
- **Frontend:** `cd apps/frontend && npm run dev` → http://localhost:5173

## Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Catalog: http://localhost:3001
- Search: http://localhost:3002
- Cart: http://localhost:3003
- Grafana (logs): http://localhost:3000

## Scripts (raiz)

- `npm run lint` — ESLint em todos os workspaces
- `npm run format` — Prettier (write)
- `npm run format:check` — Prettier (check)
- `npm test` — Jest em todos os workspaces
- `npm run build` — Build de todos os workspaces

Documentação completa e Swagger consolidado na SUBFASE E.
