# Etapa 1 — Setup monorepo + infra base + observabilidade

Resumo do que foi entregue na Etapa 1 do Desafio Técnico Allu.

## Escopo

- Monorepo com workspaces npm (`apps/*`, `services/*`).
- TypeScript no root, em cada serviço e no frontend.
- Docker Compose: Postgres, três serviços (catalog, search, cart), frontend e stack de logs (Loki, Promtail, Grafana).
- Cada serviço Express: `GET /health`, Swagger em `/api-docs`, logging JSON com pino.
- Frontend React + Vite: página inicial, react-router, layout responsivo (mobile-first).
- ESLint e Prettier configurados; scripts agregados: `lint`, `format`, `format:check`, `test`, `build`.
- Testes: Jest nos serviços (health com supertest) e no frontend (RTL); descrições em pt-BR.

## Subfases

| Subfase | Conteúdo                                                                                     |
| ------- | -------------------------------------------------------------------------------------------- |
| A       | Estrutura do monorepo, skeletons dos serviços e do frontend, docker-compose, ESLint/Prettier |
| B       | Testes unitários/integração (health nos serviços; App, Layout, Home no frontend)             |
| C       | UI/UX mobile-first e responsiva (breakpoints 768px, 1024px)                                  |
| D       | Gates: lint, format:check, test, build em todos os workspaces                                |
| E       | Documentação: README completo, Swagger/OpenAPI documentado, esta nota                        |

## Portas

| Recurso         | Porta (dev/compose)       |
| --------------- | ------------------------- |
| Frontend        | 5173 (dev) / 80 (compose) |
| catalog-service | 3001                      |
| search-service  | 3002                      |
| cart-service    | 3003                      |
| Postgres        | 5432                      |
| Grafana         | 3000                      |
| Loki            | 3100                      |

## Próximas etapas

- **Etapa 2:** Banco + migrations + seed + modelo de produto (contratos iniciais).
- **Etapa 3:** Catálogo (paginação/cursor + cache) + endpoints.
- E assim por diante conforme o desafio.
