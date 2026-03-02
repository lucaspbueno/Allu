# Etapa 2 — Banco + migrations + seed + modelo de produto

Resumo do que foi entregue na Etapa 2 do Desafio Técnico Allu.

## Escopo

- Prisma ORM integrado no catalog-service e cart-service.
- Prisma client com output isolado por serviço (evita conflito no monorepo).
- Modelo `Product` com seed de 10 produtos de exemplo.
- Modelos `Cart` e `CartItem` (schema pronto, endpoints em etapas futuras).
- Endpoints REST: `GET /products` (paginação + filtro) e `GET /products/:id`.
- Arquitetura em camadas: repository → service → routes (SOLID + DI).
- 31 testes passando (unit + integration), todos com descrições em pt-BR.

## Subfases

| Subfase | Conteúdo                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------ |
| A       | Prisma schemas, seed, camadas SOLID no catalog-service, DATABASE_URL no compose, OpenAPI         |
| B       | Testes: ProductRepository (7), ProductService (6), rotas /products (7); mock Prisma; DI refactor |
| C       | Sem alterações (etapa backend-only)                                                              |
| D       | Gates: lint, format:check, test (31 OK), build — todos passando                                  |
| E       | Documentação: OpenAPI atualizado, README expandido, esta nota                                    |

## Schemas Prisma

### catalog-service (`services/catalog-service/prisma/schema.prisma`)

```prisma
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String
  price       Decimal   @db.Decimal(10, 2)
  imageUrl    String    @map("image_url")
  category    String
  stock       Int       @default(0)
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt   DateTime? @map("deleted_at") @db.Timestamptz(3)

  @@index([category])
  @@index([name])
}
```

- Output: `../node_modules/.prisma/catalog-client`
- Import: `from ".prisma/catalog-client"`

### cart-service (`services/cart-service/prisma/schema.prisma`)

```prisma
model Cart {
  id        Int        @id @default(autoincrement())
  sessionId String     @unique @map("session_id")
  items     CartItem[]
  createdAt DateTime   @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime   @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt DateTime?  @map("deleted_at") @db.Timestamptz(3)
}

model CartItem {
  id        Int       @id @default(autoincrement())
  cartId    Int       @map("cart_id")
  productId Int       @map("product_id")
  name      String
  price     Decimal   @db.Decimal(10, 2)
  quantity  Int       @default(1)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime  @updatedAt @map("updated_at") @db.Timestamptz(3)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(3)

  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
}
```

- Output: `../node_modules/.prisma/cart-client`
- Import: `from ".prisma/cart-client"`

## Endpoints implementados

| Serviço | Endpoint        | Método | Parâmetros                          | Respostas   |
| ------- | --------------- | ------ | ----------------------------------- | ----------- |
| Catalog | `/health`       | GET    | —                                   | 200         |
| Catalog | `/products`     | GET    | `page`, `limit`, `category` (query) | 200         |
| Catalog | `/products/:id` | GET    | `id` (path, integer)                | 200/400/404 |
| Search  | `/health`       | GET    | —                                   | 200         |
| Cart    | `/health`       | GET    | —                                   | 200         |

### Paginação (`GET /products`)

```json
{
  "data": [
    /* array de Product */
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

## Seed (10 produtos)

| Produto                  | Categoria   | Preço  |
| ------------------------ | ----------- | ------ |
| iPhone 15 Pro            | Smartphones | 219.90 |
| Samsung Galaxy S24 Ultra | Smartphones | 199.90 |
| MacBook Air M3           | Notebooks   | 349.90 |
| Dell XPS 15              | Notebooks   | 299.90 |
| iPad Pro 12.9            | Tablets     | 179.90 |
| AirPods Pro 2            | Acessórios  | 49.90  |
| Apple Watch Series 9     | Wearables   | 89.90  |
| Sony WH-1000XM5          | Acessórios  | 59.90  |
| Monitor LG UltraWide 34  | Monitores   | 129.90 |
| Teclado Keychron K8      | Acessórios  | 29.90  |

## Arquitetura de camadas (catalog-service)

```
src/
├── index.ts                        # Express app + middlewares + montagem de rotas
├── lib/
│   ├── prisma.ts                    # Singleton PrismaClient
│   ├── logger.ts                    # Pino logger configurado
│   └── __mocks__/prisma.ts          # Deep mock (jest-mock-extended)
├── repositories/
│   └── product.repository.ts        # findAll, findById, count
├── services/
│   └── product.service.ts           # list (paginação), getById
└── routes/
    └── product.routes.ts            # createProductRoutes(service?) — DI
```

## Testes (31 total)

| Arquivo                    | Testes | Tipo        |
| -------------------------- | ------ | ----------- |
| product.repository.test.ts | 7      | Unit        |
| product.service.test.ts    | 6      | Unit        |
| product.routes.test.ts     | 7      | Integration |
| index.test.ts (catalog)    | 1      | Integration |
| index.test.ts (search)     | 1      | Integration |
| index.test.ts (cart)       | 1      | Integration |
| App.test.tsx               | 3      | Unit        |
| Layout.test.tsx            | 3      | Unit        |
| Home.test.tsx              | 2      | Unit        |

## Decisões técnicas

- **IDs numéricos (autoincrement):** Escolhido por simplicidade e performance vs UUID. Validação de tipo numérico na camada de rotas (retorna 400 se não-numérico).
- **Prisma client isolado:** Cada serviço gera em `node_modules/.prisma/<service>-client` para evitar overwrite no monorepo quando ambos rodam `prisma generate`.
- **DI nas rotas:** `createProductRoutes(service?)` aceita um service injetado, permitindo mock nos testes sem monkey-patching.
- **Soft delete:** Campo `deletedAt` preparado nos modelos, mas filtro de exclusão ainda não aplicado (será implementado com os endpoints de deleção).

## Próximas etapas

- **Etapa 3:** Catálogo avançado — paginação por cursor, cache, mais filtros.
- **Etapa 4:** Busca — autocomplete, fuzzy search no search-service.
- **Etapa 5:** Carrinho — endpoints CRUD com persistência por sessão.
