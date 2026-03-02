# Desafio Técnico Allu — Plano Completo Full-Stack

## STACK OBRIGATÓRIA

- Arquitetura em microsserviços
- Backend: Node.js + Express (TypeScript)
- Frontend: React.js + Vite (TypeScript)
- Banco: Postgres
- ORM: Prisma
- Testes: Jest (backend) + Jest/React Testing Library (frontend)
- Docker + docker-compose
- ESLint + Prettier
- API docs: Swagger/OpenAPI
- CI: GitHub Actions (build, lint, tests)
- Logs: pino (JSON) + Loki/Promtail/Grafana via compose

## PADRÕES DO PROJETO

### Monorepo (workspaces npm)

```
Allu/
├── package.json           # workspaces: apps/*, services/*
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc / .prettierignore
├── docker-compose.yml
├── apps/
│   └── frontend/          # React + Vite
├── services/
│   ├── catalog-service/   # porta 3001
│   ├── search-service/    # porta 3002
│   └── cart-service/      # porta 3003
├── infra/                 # Loki, Promtail, Grafana configs
└── docs/
```

### Portas

| Recurso         | Porta (dev/compose)       |
| --------------- | ------------------------- |
| Frontend        | 5173 (dev) / 80 (compose) |
| catalog-service | 3001                      |
| search-service  | 3002                      |
| cart-service    | 3003                      |
| Postgres        | 5432                      |
| Grafana         | 3000                      |
| Loki            | 3100                      |

### Prisma (ORM)

- Cada serviço com banco tem seu próprio `prisma/schema.prisma`
- Output customizado para evitar conflitos no monorepo:
  - catalog-service: `output = "../node_modules/.prisma/catalog-client"`
  - cart-service: `output = "../node_modules/.prisma/cart-client"`
- Imports: `from ".prisma/catalog-client"` (não `@prisma/client`)
- IDs: `Int @id @default(autoincrement())`
- Timestamps com `@db.Timestamptz(3)`, soft delete com `deletedAt`

### Testes

- Todos os `describe` e `it` devem estar em **pt-BR**
- Backend: Jest + Supertest + jest-mock-extended (mock do Prisma)
- Frontend: Jest + React Testing Library
- `passWithNoTests: true` em todos os jest.config
- `NODE_ENV !== "test"` para não subir `app.listen` nos testes
- `export { app }` nos serviços para testes com supertest

### Separação por camadas (SOLID) — catalog-service como referência

```
src/
├── index.ts                    # Express app + middlewares + rotas
├── lib/
│   ├── prisma.ts               # Singleton PrismaClient
│   ├── logger.ts               # Pino logger
│   └── __mocks__/prisma.ts     # Mock deep para testes
├── repositories/
│   └── product.repository.ts   # Acesso ao banco
├── services/
│   └── product.service.ts      # Regras de negócio
└── routes/
    └── product.routes.ts       # createProductRoutes(service?) com DI
```

### Commits (Conventional Commits)

- Escopos: `frontend`, `catalog-service`, `search-service`, `cart-service`, `infra`, `repo`, `docs`, `ci`
- SUBFASE A: `feat`/`chore`/`refactor`
- SUBFASE B: `test` (+ `fix`/`refactor` se necessário)
- SUBFASE C: `feat(frontend)`/`refactor(frontend)` (responsividade)
- SUBFASE D: `fix`/`chore` (ajustes para gates passarem)
- SUBFASE E: `docs`

## FLUXO POR ETAPA (GATED)

Cada etapa = 5 subfases. Executar SOMENTE a subfase atual e PARAR.

- **SUBFASE A** — IMPLEMENTAR (funcionalidade)
- **SUBFASE B** — TESTAR (criar/expandir testes)
- **SUBFASE C** — MOBILE (ajustar UI/UX mobile-first/responsivo)
- **SUBFASE D** — GATES (lint + format:check + test + build; corrigir até passar)
- **SUBFASE E** — DOCS (OpenAPI/Swagger + README + notas)

Avanço: "APROVAR SUBFASE X" para ir para a próxima.

### Gates obrigatórios (SUBFASE D)

```bash
npm run lint
npm run format:check
npm test
npm run build
```

### Formato de saída (toda subfase)

1. Checklist da subfase ([ ] / [x])
2. Arquivos criados/alterados (paths)
3. Conteúdo completo dos arquivos-chave (quando aplicável)
4. Como validar localmente (comandos exatos)
5. Commits sugeridos (mensagens exatas + ordem)
6. Assumptions / Trade-offs
7. Aguardando comando: "APROVAR SUBFASE X"

---

## PROGRESSO DAS ETAPAS

### ETAPA 1 — Setup monorepo + infra base + healthchecks + observabilidade (CONCLUÍDA)

- [x] SUBFASE A — Monorepo, TypeScript, docker-compose, skeletons Express, frontend React+Vite, ESLint/Prettier
- [x] SUBFASE B — Testes: health (supertest) nos 3 serviços, App/Layout/Home (RTL) no frontend
- [x] SUBFASE C — CSS mobile-first com breakpoints 768px/1024px, tipografia e viewport
- [x] SUBFASE D — Gates passando (lint, format:check, test, build)
- [x] SUBFASE E — README completo, docs/ETAPA1.md

### ETAPA 2 — Banco + migrations + seed + modelo de produto (EM ANDAMENTO)

- [x] SUBFASE A — Prisma no catalog-service (schema Product, seed 10 produtos, camadas SOLID), Prisma no cart-service (schema Cart/CartItem), DATABASE_URL no compose, OpenAPI atualizado
- [x] SUBFASE B — Testes: ProductRepository (7), ProductService (6), rotas /products (7); refactor DI nas rotas; Prisma client isolado por serviço; IDs numéricos
- [x] SUBFASE C — Sem alterações (etapa backend-only)
- [x] SUBFASE D — Gates passando (31 testes, lint, format, build OK)
- [x] SUBFASE E — Documentação (OpenAPI, README, docs/ETAPA2.md)

### ETAPA 3 — Catálogo (paginação/cursor + cache) + endpoints

- [x] SUBFASE A
- [x] SUBFASE B
- [x] SUBFASE C
- [x] SUBFASE D
- [x] SUBFASE E

### ETAPA 4 — Busca (autocomplete + fuzzy) + endpoints **<-- PRÓXIMO PONTO DE PARTIDA (SUBFASE A)**

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

### ETAPA 5 — Carrinho (persistência) + endpoints

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

### ETAPA 6 — Frontend: Catálogo (infinite scroll + cache client-side)

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

### ETAPA 7 — Frontend: Busca (autocomplete + fuzzy UX)

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

### ETAPA 8 — Frontend: Página do produto (carousel + preços mensal/anual + imagens)

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

### ETAPA 9 — Frontend: Carrinho persistente + fluxo completo

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

### ETAPA 10 — CI + endurecimento + README final + docs consolidadas

- [ ] SUBFASE A
- [ ] SUBFASE B
- [ ] SUBFASE C
- [ ] SUBFASE D
- [ ] SUBFASE E

---

## ESTADO ATUAL DO CÓDIGO (ao final da Etapa 2, Subfase D)

### Testes: 31 passando

| Workspace       | Suites | Testes |
| --------------- | ------ | ------ |
| frontend        | 3      | 8      |
| catalog-service | 4      | 21     |
| search-service  | 1      | 1      |
| cart-service    | 1      | 1      |

### Schemas Prisma

**catalog-service** (`services/catalog-service/prisma/schema.prisma`):

- `Product`: id (Int auto), name, description, price (Decimal 10,2), imageUrl, category, stock, active, createdAt, updatedAt, deletedAt
- Indexes: category, name
- Output: `.prisma/catalog-client`

**cart-service** (`services/cart-service/prisma/schema.prisma`):

- `Cart`: id (Int auto), sessionId (unique), items[], createdAt, updatedAt, deletedAt
- `CartItem`: id (Int auto), cartId, productId, name, price (Decimal 10,2), quantity, createdAt, updatedAt, deletedAt
- Unique: [cartId, productId]
- Output: `.prisma/cart-client`

### Endpoints implementados

| Serviço | Endpoint          | Descrição                              |
| ------- | ----------------- | -------------------------------------- |
| catalog | GET /health       | Health check                           |
| catalog | GET /products     | Lista paginada (page, limit, category) |
| catalog | GET /products/:id | Produto por ID (number)                |
| search  | GET /health       | Health check                           |
| cart    | GET /health       | Health check                           |

### Migrations pendentes

As migrations Prisma ainda não foram executadas (`prisma migrate dev`). Requerem Postgres rodando. O próximo chat deve:

1. Garantir que as migrations sejam criadas/executadas antes de continuar
2. Executar o seed após a migration

---

## INSTRUÇÕES PARA O PRÓXIMO CHAT

Cole o prompt principal (regras do desafio + fluxo GATED + commits) junto com este plano e diga:

> "Continuando o Desafio Técnico Allu. O plano atualizado está em `docs/PLANO-COMPLETO.md`. Execute a **ETAPA 4 — SUBFASE A** (IMPLEMENTAR)."

O próximo chat deve:

1. Ler `docs/PLANO-COMPLETO.md` para contexto completo
2. Executar a SUBFASE A da ETAPA 4 (Busca: autocomplete + fuzzy no search-service)
3. Seguir o fluxo GATED normalmente (A → B → C → D → E)
