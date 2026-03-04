# Allu - Desafio Técnico Full-Stack

## 1. Como rodar (Quickstart)

### Pré-requisitos

- **Docker** e **Docker Compose** (para subir toda a stack).
- Opcional (desenvolvimento local sem Docker): Node.js 20+ (`.nvmrc`), npm 9+.

### Subir tudo via Docker Compose

Na raiz do repositório, com um `.env` configurado (use `.env.example` como base):

```bash
docker compose up -d --build
```

Os serviços aplicam **migrations** e o **catalog-service** roda o **seed** na subida (entrypoints): não é preciso rodar migrações ou seed à mão quando se usa apenas Docker.

Se quiser rodar **localmente** (Postgres já rodando, ex.: `docker compose up -d postgres`):

```bash
# catalog-service: client, migrations e seed
cd services/catalog-service/

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed:local

npm run dev

# search-service: só gerar client (lê do catalog-schema)
cd services/search-service/

npm run prisma:generate

npm run dev

# cart-service: client e migrations
cd services/cart-service/

npm run prisma:generate
npm run prisma:migrate

npm run dev

# frontend
cd apps/frontend/

npm run dev
```

### URLs (copy/paste)

| Recurso | URL |
| -------- | --- |
| **Web (frontend)** | http://localhost:5173 |
| **API Catalog** | http://localhost:3002 |
| **API Search** | http://localhost:3003 |
| **API Cart** | http://localhost:3001 |
| **Swagger Catalog** | http://localhost:3002/api-docs |
| **Swagger Search** | http://localhost:3003/api-docs |
| **Swagger Cart** | http://localhost:3001/api-docs |
| **Viewer de logs (Grafana)** | http://localhost:3000 |

As portas podem ser alteradas via `.env` (ex.: `FRONTEND_PORT`, `CATALOG_PORT`).

## 2. Visão Geral (Overview)

O projeto **Allu** é um e-commerce em formato de monorepo: três microsserviços em Node.js + Express (TypeScript) — catálogo, busca e carrinho — e um frontend React + Vite (TypeScript) com páginas de home, catálogo (infinite scroll), busca (autocomplete), produto e carrinho persistente. O MVP entrega CRUD de carrinho por sessão, listagem e filtros de produtos, busca full-text e stack observável (Docker Compose com Postgres, Loki, Promtail e Grafana). Extras incluem CI (GitHub Actions), Swagger em todos os serviços, layout mobile-first com acessibilidade e documentação por etapa.

**Links rápidos (desenvolvimento local):**


| Recurso               | URL                                                              |
| --------------------- | ---------------------------------------------------------------- |
| **Frontend**          | [http://localhost:5173](http://localhost:5173)                   |
| **Swagger — Catalog** | [http://localhost:3002/api-docs](http://localhost:3002/api-docs) |
| **Swagger — Search**  | [http://localhost:3003/api-docs](http://localhost:3003/api-docs) |
| **Swagger — Cart**    | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) |
| **Docs internas**     | [docs/](docs/) (ETAPA1.md … ETAPA10.md, PLANO-COMPLETO.md)       |

## 3. Requisitos atendidos

Checklist objetivo mapeando cada item do desafio:

- ✅ **Catálogo + infinite scroll + cache** — Página `/catalog` com `useCatalogInfinite` e `IntersectionObserver`; catalog-service com listagem (offset/cursor), filtros e cache em memória (SimpleCache, TTL configurável).
- ✅ **Busca + autocomplete + fuzzy** — Página `/search` com autocomplete (debounce) e resultados em grid; search-service com `/search/suggestions` e `/search/products`, ordenação por relevância (exata > começa com > contém); cache em memória.
- ✅ **Página do produto + carrossel + otimização de imagens** — Página `/produto/:id` com `ImageCarousel` (prev/next, dots, swipe), preço à vista e parcelado; imagens com `loading="lazy"` no catálogo, busca e carrinho.
- ✅ **Carrinho + persistência** — Página `/cart` com listagem, alteração de quantidade e remoção; `sessionId` persistido em `localStorage`; cart-service com CRUD por sessão e persistência em Postgres.
- ✅ **Microsserviços, Docker, Swagger, testes, CI, logs** — Três serviços (catalog, search, cart); Docker Compose com Postgres e stack de logs (Loki, Promtail, Grafana); Swagger em `/api-docs` em cada serviço; Jest em todos os workspaces; GitHub Actions (lint, format:check, test, build).

## 4. Arquitetura

### Diagrama

```mermaid
flowchart LR
  subgraph client["Cliente"]
    FE[Frontend React]
  end

  subgraph backend["Backend"]
    CAT[catalog-service :3002]
    SRCH[search-service :3003]
    CART[cart-service :3001]
  end

  subgraph data["Dados"]
    PG[(Postgres)]
  end

  subgraph observability["Observabilidade"]
    PROM[Promtail]
    LOKI[Loki]
    GRAF[Grafana]
  end

  FE --> CAT
  FE --> SRCH
  FE --> CART
  CAT --> PG
  SRCH --> PG
  CART --> PG
  CAT -.-> PROM
  SRCH -.-> PROM
  CART -.-> PROM
  PROM --> LOKI
  GRAF --> LOKI
```

**Serviços:**

| Serviço             | Porta | Descrição                                                                            |
| ------------------- | ----- | ---------                                                                            |
| **frontend**        | 5173  | SPA React (Vite), consome as três APIs diretamente (sem BFF/gateway).                |
| **catalog-service** | 3002  | Catálogo de produtos: listagem (offset/cursor), filtros, produto por ID, categorias. |
| **search-service**  | 3003  | Busca e autocomplete: sugestões e busca full-text em nome/descrição.                 |
| **cart-service**    | 3001  | Carrinho por sessão: obter/criar, adicionar/alterar/remover itens.                   |
| **postgres**        | 5432  | Um único banco, schemas separados: `catalog-schema` (Product), `cart-schema` (Cart, CartItem). search-service lê apenas `catalog-schema`. |

### Responsabilidade de cada serviço

- **catalog-service** — Fonte da verdade de produtos (CRUD via Prisma, migrations e seed). Expõe listagem paginada (offset e cursor), filtros (categoria, busca, preço, ordenação), produto por ID e lista de categorias. Cache em memória (SimpleCache) para listas, produto e categorias.
- **search-service** — Leitura da tabela Product (mesmo schema do catalog). Autocomplete (`/search/suggestions`) com ordenação por relevância; busca full-text (`/search/products`) em nome e descrição. Apenas gera client Prisma (sem migrations). Cache em memória para sugestões e resultados de busca.
- **cart-service** — Carrinho por `sessionId`: obter ou criar carrinho, adicionar/atualizar/remover itens. Persistência em Postgres (Cart, CartItem). Sem cache; operações sempre contra o banco.
- **Frontend** — Não há BFF nem API Gateway: o frontend chama cada serviço via `VITE_*_API_URL`. SessionId do carrinho fica em `localStorage`; estado do carrinho é buscado/atualizado no cart-service.

### Fluxo de dados

- **Cache** — catalog-service e search-service usam `SimpleCache` (TTL em `CACHE_TTL_MS`, padrão 60s). Cache em listagem, produto por ID, categorias (catalog) e em sugestões/busca (search). Cart-service não utiliza cache.
- **Paginação / cursor** — Catálogo: `GET /products` aceita `page`/`limit` (offset) ou `cursor`/`limit` (cursor). O frontend usa modo cursor no infinite scroll (`useCatalogInfinite`): a cada “load more” envia o último ID e acumula os resultados em estado.
- **Persistência do carrinho** — O frontend gera ou lê um `sessionId` em `localStorage` e envia em todas as chamadas ao cart-service (`/carts/:sessionId`, `/carts/:sessionId/items`). O cart-service persiste Cart e CartItem no Postgres; ao reabrir a aplicação, o mesmo `sessionId` recupera o carrinho.

## 5. Stack / Tecnologias

| Área                            | Tecnologia                    | Versões / observações |
| ------------------------------- | ----------------------------- | --------------------- |
| **Runtime / package manager**   | Node.js, npm                  | Node 20 (`.nvmrc`), npm 9+ (workspaces na raiz) |
| **Backend**                     | Node.js, Express, TypeScript  | Express 4.x, TypeScript 5.4; cada serviço: Express + Prisma + pino |
| **ORM / DB client**             | Prisma                        | ^5.12; client isolado por serviço (catalog, search, cart) |
| **Frontend**                    | React, Vite, TypeScript       | React 18, Vite 5, React Router 6, TypeScript 5.4 |
| **Banco de dados**              | PostgreSQL                    | 16 (imagem `postgres:16-alpine` no Docker) |
| **Cache**                       | Em memória                    | SimpleCache (TTL configurável via `CACHE_TTL_MS`); catalog e search; sem Redis |
| **Observabilidade / logging**   | Pino, Loki, Promtail, Grafana | Logs JSON (pino) em arquivo; Promtail envia para Loki; Grafana consulta Loki. Imagens: Loki 2.9.3, Promtail 2.9.3, Grafana 10.3.0 |
| **API docs**                    | Swagger UI, OpenAPI 3.0       | swagger-ui-express 5.x; cada serviço expõe `/api-docs` |
| **Testes**                      | Jest, Supertest, RTL          | Jest 29; backend: Supertest + jest-mock-extended (mock Prisma); frontend: React Testing Library |
| **CI**                          | GitHub Actions                | Workflow em `.github/workflows/ci.yml`: checkout, Node via `.nvmrc`, `npm ci`, lint, format:check, test, build; `actions/setup-node@v4`, `actions/checkout@v4` |

## 6. Serviços e Portas

| Serviço            | Porta (padrão)            | URL (dev local)       | Descrição curta  |
| ------------------ | ------------------------- | --------------------- | ---------------- |
| **Frontend (web)** | `${FRONTEND_PORT}` (5173) | http://localhost:5173 | SPA React (Vite) que consome diretamente os APIs de catálogo, busca e carrinho. |
| **Catalog API**    | `${CATALOG_PORT}` (3002)  | http://localhost:3002 | Catálogo de produtos: listagem (offset/cursor), filtros, produto por ID e categorias. |
| **Search API**     | `${SEARCH_PORT}` (3003)   | http://localhost:3003 | Busca e autocomplete de produtos (sugestões e busca full-text em nome/descrição). |
| **Cart API**       | `${CART_PORT}` (3001)     | http://localhost:3001 | Carrinho por sessão com CRUD de itens e totalização. |
| **Postgres**       | 5432                      | localhost:5432        | Banco de dados `allu` (schemas `catalog-schema`, `cart-schema`). |
| **Grafana (logs)** | 3000                      | http://localhost:3000 | Dashboard para visualizar logs enviados pelo Promtail para o Loki. |

### Variáveis de ambiente principais

| Variável               | Exemplo / padrão                             | Uso                                                            |
| ---------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| `POSTGRES_USER`        | `allu`                                       | Usuário do banco Postgres.                                     |
| `POSTGRES_PASSWORD`    | `allu`                                       | Senha do banco Postgres.                                       |
| `POSTGRES_HOST`        | `db` (Docker) / `localhost` (local)          | Host usado pelos serviços para conectar no Postgres.           |
| `POSTGRES_DB`          | `allu`                                       | Nome do database principal.                                    |
| `DATABASE_URL`         | `postgresql://allu:allu@localhost:5432/allu` | String de conexão usada nos comandos locais do Prisma.         |
| `CART_PORT`            | `3001`                                       | Porta exposta do cart-service.                                 |
| `CATALOG_PORT`         | `3002`                                       | Porta exposta do catalog-service.                              |
| `SEARCH_PORT`          | `3003`                                       | Porta exposta do search-service.                               |
| `FRONTEND_PORT`        | `5173`                                       | Porta exposta do frontend.                                     |
| `VITE_CART_API_URL`    | `http://localhost:3001`                      | Base URL da Cart API consumida pelo frontend.                  |
| `VITE_CATALOG_API_URL` | `http://localhost:3002`                      | Base URL da Catalog API consumida pelo frontend.               |
| `VITE_SEARCH_API_URL`  | `http://localhost:3003`                      | Base URL da Search API consumida pelo frontend.                |
| `LOG_LEVEL`            | `info`                                       | Nível de log dos serviços (pino).                              |
| `CACHE_TTL_MS`         | `60000` (opcional)                           | TTL padrão do SimpleCache em milissegundos (catalog e search). |
## 7. Documentação da API (Swagger/OpenAPI)

### Onde acessar

Cada serviço expõe Swagger UI com a especificação OpenAPI 3.0 no path `/api-docs` (ambiente de desenvolvimento):

- **Catalog**: http://localhost:3002/api-docs
- **Search**: http://localhost:3003/api-docs
- **Cart**: http://localhost:3001/api-docs

Os arquivos de spec ficam versionados em `services/*/src/openapi.json` (um por serviço).

### Autenticação

- **Não há autenticação** nos endpoints: todas as rotas são públicas e voltadas ao desafio técnico.
- Em produção, a recomendação seria proteger os serviços (ex.: API Gateway, auth JWT), mas isso ficou fora do escopo do MVP.

### Principais endpoints

**Catalog-service (`/products` e derivados)**

- `GET /health` — Health check do serviço.
- `GET /products` — Lista de produtos com paginação offset/cursor, filtros (`category`, `search`, `minPrice`, `maxPrice`) e ordenação (`sortBy`, `order`).
- `GET /products/:id` — Detalhes de um produto por ID numérico (com cache em memória).
- `GET /products/categories` — Lista de categorias distintas ordenadas alfabeticamente (com cache em memória).

**Search-service (busca e autocomplete)**

- `GET /health` — Health check do serviço.
- `GET /search/suggestions` — Sugestões para autocomplete a partir de `q` (query) e `limit` (1–20), com ordenação por relevância e cache em memória.
- `GET /search/products` — Busca full-text em nome e descrição (`q`, `page`, `limit`), com resultados paginados e cache em memória.

**Cart-service (carrinho por sessão)**

- `GET /health` — Health check do serviço.
- `GET /carts/:sessionId` — Obtém ou cria o carrinho para a sessão informada (sempre retorna 200).
- `POST /carts/:sessionId/items` — Adiciona item ao carrinho (body: `productId`, `name`, `price`, `quantity`).
- `PATCH /carts/:sessionId/items/:productId` — Atualiza a quantidade de um item (body: `quantity`).
- `DELETE /carts/:sessionId/items/:productId` — Remove um item do carrinho.

## 8. Dados / Seed

### Como a base é criada

- **Schema e migrations**: o Postgres é inicializado com múltiplos schemas (`catalog-schema`, `cart-schema`) via script `infra/init-schemas.sql` + migrations do Prisma. No Docker, os entrypoints dos serviços rodam `prisma migrate deploy` automaticamente.
- **Seed do catálogo**: o `catalog-service` executa um seed Prisma (`services/catalog-service/src/seed.ts`) que popula mais de 100 produtos de exemplo (smartphones, notebooks, tablets, acessórios, etc.), com nome, descrição, preço, categoria, estoque e `imageUrl`. Esse seed roda automaticamente no Docker (`npm run prisma:seed:docker`) e pode ser rodado localmente via `npm run prisma:seed:local -w catalog-service`.
- **Search-service**: não tem seed próprio; ele apenas lê a tabela `Product` no `catalog-schema`, compartilhando os mesmos dados do catálogo.
- **Cart-service**: não possui seed de dados de negócio, a base começa vazia e os registros de `Cart`/`CartItem` são criados conforme o usuário interage com o carrinho.

### Imagens dos produtos

- As imagens **não** ficam em storage local nem em volume Docker. O campo `imageUrl` dos produtos aponta para URLs externas (`picsum.photos` e `images.unsplash.com`) pensadas para ambiente de desenvolvimento/demonstração.
- Não há upload de arquivos nem CDN própria: o frontend apenas consome as URLs já persistidas na tabela `Product` (exibidas no catálogo, página de produto e carrinho com `loading="lazy"`).
## 9. Funcionalidades e detalhes de implementação

### Infinite scroll (catálogo)

- O frontend usa o hook `useCatalogInfinite`, que faz paginação **offset-based** (`page`/`limit`) e acumula os resultados em memória conforme o usuário desce a página.
- O backend oferece tanto offset (`page`, `limit`) quanto cursor (`cursor`, `limit`) em `GET /products`, mas o frontend prioriza offset pela simplicidade de integração com o layout (total de páginas conhecido e API mais simples para o hook).

### Cache em memória

- **Onde**: cache in-memory (`SimpleCache`) dentro dos serviços de catálogo e busca (sem Redis ou BFF).
- **O que cacheia (catalog-service)**:
  - Listagens paginadas (`products:list:...`), listagens por cursor (`products:cursor:...`), produto por ID (`products:id:...`) e lista de categorias (`products:categories`).
- **O que cacheia (search-service)**:
  - Sugestões de autocomplete (`search:suggest:...`) e resultados paginados de busca (`search:products:...`).
- **TTL / invalidação**: TTL padrão de **60s**, configurável via `CACHE_TTL_MS`. Quando expira, a entrada é descartada no próximo acesso; existe um método de invalidação por padrão de chave, mas como o CRUD de produtos não faz parte do escopo do desafio, a estratégia usada é **apenas expiração por tempo**.

### Busca fuzzy + autocomplete

- **Autocomplete**: o `search-service` busca produtos por `name ILIKE %q%` e depois ordena em memória atribuindo um score: **match exato** (`name === q`) primeiro, depois nomes que **começam com** `q`, depois nomes que apenas **contêm** `q`; empates são resolvidos por `localeCompare`. Isso simula um comportamento fuzzy leve sem depender de extensões específicas do Postgres (como trigram).
- **Busca full-text**: a busca usa `ILIKE %q%` em nome e descrição (`OR`), paginada (`page`, `limit`) e ordenada alfabeticamente, cobrindo os principais casos de uso do catálogo com implementação simples e portável.
- **Trade-offs**: essa abordagem é fácil de manter e funciona bem no volume do desafio, mas não escala tão bem quanto índices trigram/full-text dedicados em bases muito grandes, o que seria o próximo passo em um ambiente de produção.

### Imagens (otimizações)

- As imagens de produto vêm de URLs externas já redimensionadas (~400x400) via `picsum.photos` e `images.unsplash.com` (com parâmetros `w`, `h` e `fit=crop`), o que reduz payload desnecessário.
- No frontend, todas as imagens de catálogo, busca e carrinho usam `loading="lazy"` para adiar o carregamento fora de tela e melhorar desempenho em mobile.
- Não há uso de componentes especializados como `next/image` (o projeto é Vite/React puro), nem compressão própria no backend, a estratégia foca em **tamanho controlado na origem + lazy loading no cliente**, suficiente para o escopo do desafio.
## 10. Testes

### Como rodar

- **Projeto todo** (todos os workspaces):
  - `npm test`
- **Workspace específico** (ex.: apenas frontend):
  - `npm test -w frontend`
  - `npm test -w catalog-service`
  - `npm test -w search-service`
  - `npm test -w cart-service`

Os comandos acima usam Jest em todos os pacotes, conforme configurado nos respectivos `package.json`.

### O que os testes cobrem

- **Backend (serviços)**:
  - Camada de serviços e repositories (regras de negócio, filtros, paginação, cálculo de totais).
  - Rotas HTTP com Supertest (status codes, validação de parâmetros, formas de paginação, comportamento do carrinho por sessão).
  - Integração com Prisma simulada via `jest-mock-extended` (mocks de `PrismaClient`).
  - Comportamento do cache (`SimpleCache`) em catálogo e busca.
- **Frontend**:
  - Páginas principais: Home, Catalog, Search, ProductPage e Cart.
  - Componentes de apresentação essenciais: layout, navegação, `ImageCarousel`.
  - Hooks de dados: `useCatalogInfinite`, `useSearchSuggestions`, `useSearchResults`, `useProduct`, `useCart`.
  - Clientes de API: `api/catalog`, `api/search`, `api/cart`.

### Cobertura e o que ficou fora

- A suíte soma **200+ testes** (frontend + três serviços), cobrindo os fluxos críticos do desafio: catálogo com filtros e infinite scroll, busca/autocomplete, detalhes de produto, carrinho persistente e integrações básicas com o banco via Prisma.
- Não há relatório formal de cobertura por arquivo no README (ex.: NYC/coverage HTML), mas as áreas mais sensíveis à regra de negócio (services, repositories, hooks e páginas principais) estão cobertas.
- Ficam de fora, por simplicidade do desafio:
  - Casos extremos de erro de infraestrutura (queda de banco, timeouts de rede), são tratados de forma genérica.
  - Cenários muito específicos de UX (animações, estilos visuais complexos) e testes de acessibilidade automatizados aprofundados.
  - Testes de contrato formais entre serviços (ex.: via Pact), Swagger serve como fonte de verdade dos contratos.

## 11. CI (GitHub Actions)

### O que o pipeline faz

O workflow em `.github/workflows/ci.yml` roda em todo **push** e **pull request** para os branches `main` e `master`. Um único job executa, em ordem:

1. **Validar configuração do workflow** — `npm run validate:workflow` (garante que o YAML contém os passos esperados).
2. **Configurar Node.js** — usa `.nvmrc` (Node 20) e cache de dependências npm.
3. **Instalar dependências** — `npm ci` (instalação limpa e reproduzível).
4. **Lint** — `npm run lint` (ESLint em todos os workspaces).
5. **Verificar formatação** — `npm run format:check` (Prettier em todo o monorepo).
6. **Testes** — `npm test` (Jest em todos os workspaces).
7. **Build** — `npm run build` (build de frontend e dos três serviços).

Se qualquer passo falhar, o pipeline falha e o status fica vermelho no GitHub.

### Como verificar o status

- **Na interface do GitHub**: abra o repositório → aba **Actions** → workflow **CI** → veja o resultado do último run (e dos commits).
- **Badge opcional** (substitua `OWNER` e `REPO` pelo dono e nome do repositório):

  ```markdown
  [![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
  ```

## 12. Logs e Monitoramento

### Como ver logs centralizados

Com a stack sobe via `docker compose up`:

- **Coleta**: cada serviço (catalog, search, cart) escreve logs em **arquivo** em `/var/log/app/` (ex.: `catalog.log`, `search.log`, `cart.log`) e em **stdout**. O **Promtail** (container na mesma rede) faz scrape desses arquivos e envia os logs para o **Loki**.
- **Visualização**: o **Grafana** (http://localhost:3000) já vem com o datasource **Loki** configurado. Lá você consulta e filtra os logs de todos os serviços em um só lugar (por tempo, nível, serviço, etc.).

Ou seja: collector = Promtail (lê `/var/log/app/*.log`); armazenamento/agregação = Loki; onde olhar = Grafana.

### Formato e correlação

- **Formato**: logs em **JSON estruturado** (Pino). Cada linha é um objeto JSON com campos como `level`, `time`, `msg`, `name` (nome do serviço), `req` (dados da requisição HTTP quando aplicável), `res` (resposta), etc.
- **Correlação por request**: o middleware **pino-http** gera um identificador por requisição (`req.id`) e o inclui nos logs daquele request. No Grafana/Loki você pode filtrar por esse valor para seguir todas as linhas de uma mesma requisição.

### Onde olhar

| Onde | O que ver |
| ---- | --------- |
| **Grafana** (http://localhost:3000) | Logs centralizados no Loki; use **Explore** → datasource Loki e queries LogQL (ex.: `{job="allu-app"}` ou por nível/serviço). |
| **Arquivos em cada container** | `/var/log/app/catalog.log`, `search.log`, `cart.log` — úteis para debug direto no container. |
| **Stdout dos containers** | `docker compose logs -f catalog` (e idem para `search`, `cart`) para acompanhar em tempo real. |

## 13. Decisões e Trade-offs

- **Cache em memória (SimpleCache) em vez de Redis** — Evitar infra extra no desafio; TTL e invalidação por tempo são suficientes para o volume e o escopo. Redis faria sentido com múltiplas instâncias ou cache compartilhado entre serviços.
- **Paginação por offset no infinite scroll em vez de só cursor** — O backend expõe os dois modos; o frontend usa offset para ter `totalPages` e integração mais simples no hook, sem precisar gerenciar cursor no estado da UI.
- **Busca com ILIKE + score em memória em vez de trigram/Full-Text Search** — Implementação portátil e fácil de manter; atende bem o tamanho do catálogo do desafio. Trigram/FTS seria o próximo passo para escala e relevância em bases grandes.
- **Frontend chamando as APIs diretamente (sem BFF/API Gateway)** — Menos camadas para o escopo do MVP; cada serviço já expõe REST e Swagger. BFF ou gateway entrariam com auth, agregação e rate limit em produção.
- **Um único Postgres com schemas separados** — Reduz operação (um banco para subir e migrar); isolamento lógico por schema atende o desafio. Bancos separados por serviço seriam opção em cenário de escala/equipes distintas.
- **Imagens via URL externa + lazy loading, sem CDN/compressão própria** — Foco em entregar a funcionalidade; tamanho fixo na origem e `loading="lazy"` cobrem o necessário. Com mais tempo: CDN, formatos modernos (WebP/AVIF) e possível componente de imagem otimizado.
- **Sem autenticação nas APIs** — Escopo do desafio é catálogo, busca e carrinho por sessão; auth (JWT, API key, etc.) ficaria para uma fase de produção.
- **Logs: Pino + Loki/Promtail/Grafana** — Logs estruturados e centralizados sem precisar de stack paga; suficiente para debug e demonstração. Com mais tempo: métricas (Prometheus), traces (ex.: OpenTelemetry) e alertas.

### Com mais tempo

- **Redis** para cache compartilhado e sessão (ex.: carrinho por token em vez de só localStorage), com invalidação explícita ao alterar catálogo.
- **Observabilidade** — Métricas (Prometheus + Grafana), tracing distribuído (OpenTelemetry) e alertas (ex.: latência, erro 5xx) para operação em produção.
- **Busca** — Índice full-text ou trigram no Postgres (ou motor dedicado) para relevância e performance em catálogos grandes.
- **Auth e segurança** — API Gateway ou BFF com rate limit, validação de entrada reforçada e auditoria de acessos.

## 14. Limitações conhecidas

- **Busca “fuzzy” simples** — Baseada em `ILIKE %termo%` e score em memória (exato > prefixo > contém). Não há tolerância a typo, sinônimos nem ranking por relevância (TF-IDF, BM25, etc.).
- **Sem ranking avançado** — Ordenação da busca é alfabética; não há score de relevância nem personalização.
- **Cache in-memory por processo** — Não é compartilhado entre instâncias; em múltiplas réplicas cada uma teria seu próprio cache e TTL, sem invalidação centralizada.
- **Carrinho atrelado ao dispositivo** — `sessionId` em `localStorage`; trocar de navegador/dispositivo ou limpar dados perde o carrinho. Não há conta de usuário nem sincronização.
- **APIs públicas** — Nenhum endpoint exige autenticação nem rate limit; não adequado para exposição direta em produção.
- **Imagens apenas externas** — Sem upload, redimensionamento server-side nem formatos modernos (WebP/AVIF); dependência de URLs de terceiros (Picsum, Unsplash) para o seed.
- **Sem métricas nem tracing** — Apenas logs; não há métricas de latência/throughput nem traces distribuídos para análise de performance ponta a ponta.
- **Um banco compartilhado** — Postgres único com schemas; isolamento é lógico, não por instância, o que pode limitar evolução independente dos serviços em cenários de escala.

## 15. Autor

**Lucas Parreiras Romanelli Bueno**

- [LinkedIn](https://www.linkedin.com/in/seu-perfil)
- [GitHub](https://github.com/seu-usuario)

