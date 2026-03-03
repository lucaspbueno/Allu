# Etapa 5 — Carrinho (persistência) + endpoints

Resumo do que foi entregue na Etapa 5 do Desafio Técnico Allu.

## Escopo

- Cart-service com **endpoints de carrinho por sessão**: obter/criar carrinho, adicionar item, alterar quantidade, remover item.
- Persistência com **Prisma** (Cart, CartItem); soft delete em itens; upsert por (cartId, productId).
- Camadas repository → service → routes com injeção de dependência.
- 119 testes no monorepo (33 no cart-service).

## Subfases

| Subfase | Conteúdo                                                                             |
| ------- | ------------------------------------------------------------------------------------ |
| A       | lib (prisma, logger, mock), CartRepository, CartService, cart.routes, OpenAPI v0.3.0 |
| B       | Testes: CartRepository (10), CartService (11), rotas (11); health (1)                |
| C       | Sem alterações (etapa backend-only)                                                  |
| D       | Gates: lint, format (openapi.json), test (119), build — todos passando               |
| E       | README (endpoints cart, cobertura), docs/ETAPA5.md, plano atualizado                 |

## Arquitetura do cart-service

```
src/
├── index.ts                 # Express app, monta /carts
├── lib/
│   ├── prisma.ts             # Singleton (.prisma/cart-client)
│   ├── logger.ts
│   └── __mocks__/prisma.ts
├── repositories/
│   └── cart.repository.ts    # findBySessionId, create, upsertItem, updateItemQuantity, removeItem
├── services/
│   └── cart.service.ts       # getOrCreateCart, getCart, addItem, updateQuantity, removeItem
└── routes/
    └── cart.routes.ts        # GET /:sessionId, POST /:sessionId/items, PATCH/DELETE .../items/:productId
```

## API do cart-service (v0.3.0)

| Método | Path                                 | Descrição                                                                                                                                                   |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/carts/:sessionId`                  | Obter ou criar carrinho (sempre 200; items vazio se novo).                                                                                                  |
| POST   | `/carts/:sessionId/items`            | Adicionar item. Body: `productId` (number), `name` (string), `price` (number), `quantity?` (default 1). Cria carrinho se não existir; upsert por productId. |
| PATCH  | `/carts/:sessionId/items/:productId` | Alterar quantidade. Body: `quantity` (number ≥ 0). 404 se carrinho ou item não existir.                                                                     |
| DELETE | `/carts/:sessionId/items/:productId` | Remover item (soft delete). 404 se carrinho ou item não existir.                                                                                            |

Respostas 400 quando `sessionId` vazio ou `productId` não numérico; 404 em PATCH/DELETE quando carrinho ou item não encontrado.

## Prisma (cart-service)

- **Schema:** Cart (id, sessionId único, items), CartItem (cartId, productId, name, price, quantity; único [cartId, productId]; soft delete com deletedAt).
- **Output:** `../node_modules/.prisma/cart-client`.
- **Upsert:** restaura item com `deletedAt: null` ao adicionar de novo o mesmo productId.

## Testes (cart-service)

| Arquivo                 | Testes | Tipo        |
| ----------------------- | ------ | ----------- |
| cart.repository.test.ts | 10     | Unit        |
| cart.service.test.ts    | 11     | Unit        |
| cart.routes.test.ts     | 11     | Integration |
| health.test.ts          | 1      | Integration |

Todos os `describe`/`it` em pt-BR.

## Decisões técnicas

- **GET retorna getOrCreateCart:** primeiro acesso retorna carrinho vazio em vez de 404.
- **Remoção por soft delete:** item com `deletedAt` preenchido; upsert ao readicionar o mesmo productId.
- **POST items:** corpo com productId, name, price (e quantity opcional); nome e preço vêm do cliente (em produção podem ser validados contra o catalog-service).

## Próximas etapas

- **Etapa 6:** Frontend — Catálogo (infinite scroll + cache client-side).
- **Etapa 9:** Frontend — Carrinho persistente + fluxo completo consumindo a API do cart-service.
