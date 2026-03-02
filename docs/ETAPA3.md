# Etapa 3 — Catálogo avançado (paginação/cursor + cache + filtros)

Resumo do que foi entregue na Etapa 3 do Desafio Técnico Allu.

## Escopo

- Cache em memória (`SimpleCache`) com TTL configurável.
- Paginação por cursor como alternativa ao offset no `GET /products`.
- Novos filtros: `search` (busca parcial ILIKE), `minPrice`, `maxPrice`, `sortBy`, `order`.
- Novo endpoint `GET /products/categories`.
- Soft delete consistente: `deletedAt: null` em todas as queries.
- 65 testes passando (55 no catalog-service).

## Subfases

| Subfase | Conteúdo                                                                          |
| ------- | --------------------------------------------------------------------------------- |
| A       | `SimpleCache`, `ProductRepository` refatorado, `ProductService` com cache, rotas  |
| B       | `cache.test.ts` + atualização de todos os testes do catalog-service (55 no total) |
| C       | Sem alterações (etapa backend-only)                                               |
| D       | Gates: lint (1 fix prettier), format:check, test (65 OK), build — todos passando  |
| E       | OpenAPI v0.3.0, README expandido, esta nota                                       |

## Novos arquivos

| Arquivo                 | Descrição                                |
| ----------------------- | ---------------------------------------- |
| `src/lib/cache.ts`      | `SimpleCache` com get/set/invalidate/TTL |
| `src/lib/cache.test.ts` | 6 testes unitários do cache              |

## Arquivos alterados

| Arquivo                                       | Mudanças                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `src/repositories/product.repository.ts`      | `buildWhere` privado, `findAllCursor`, `findCategories`, novos filtros |
| `src/services/product.service.ts`             | Cache em todos os métodos, `listCursor`, `getCategories`               |
| `src/routes/product.routes.ts`                | Rota `/categories`, novos query params, validações                     |
| `src/openapi.json`                            | v0.3.0: `GET /categories`, modo cursor, todos os params                |
| `src/repositories/product.repository.test.ts` | 17 testes (atualizado)                                                 |
| `src/services/product.service.test.ts`        | 17 testes (atualizado + cache mock)                                    |
| `src/routes/product.routes.test.ts`           | 16 testes (atualizado + novos endpoints)                               |

## API do catalog-service (v0.3.0)

### GET /products

Aceita dois modos de paginação:

**Modo offset** (padrão):

```
GET /products?page=1&limit=20&category=Smartphones&search=iphone&sortBy=price&order=asc
```

Resposta:

```json
{
  "data": [...],
  "total": 3,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

**Modo cursor**:

```
GET /products?cursor=5&limit=3&minPrice=50&maxPrice=300
```

Resposta:

```json
{
  "data": [...],
  "nextCursor": 8,
  "hasMore": true
}
```

Para a página seguinte: `GET /products?cursor=8&limit=3`

### GET /products/:id

```
GET /products/1
```

Retorna `Product` ou 404. Resultado cacheado por 60s.

### GET /products/categories

```
GET /products/categories
```

Resposta:

```json
{
  "data": ["Acessórios", "Monitores", "Notebooks", "Smartphones", "Tablets", "Wearables"]
}
```

Resultado cacheado por 60s (ou valor de `CACHE_TTL_MS`).

## Cache

| Chave                           | TTL | Invalidação        |
| ------------------------------- | --- | ------------------ |
| `products:list:<json-params>`   | 60s | Automática por TTL |
| `products:cursor:<json-params>` | 60s | Automática por TTL |
| `products:id:<id>`              | 60s | Automática por TTL |
| `products:categories`           | 60s | Automática por TTL |

O TTL é configurável via variável de ambiente `CACHE_TTL_MS` (padrão: `60000` ms).

## Decisões técnicas

- **`SimpleCache` in-memory**: evita dependência de Redis nesta etapa; a interface (`get`, `set`, `invalidate`) é compatível com uma troca futura por Redis sem alterar service/routes.
- **Cursor vs offset coexistindo**: a presença do param `cursor` na query ativa o modo cursor; ausência usa offset. Mantém backward compatibility.
- **`/categories` antes de `/:id`**: registro de rota mais específica primeiro para evitar que `"categories"` seja tratado como `:id` pelo Express.
- **`deletedAt: null` em todos os WHERE**: garante que produtos soft-deleted não apareçam, mesmo antes de haver endpoint de deleção.
- **`buildWhere` privado**: centraliza a lógica de construção de filtros, evitando duplicação entre `findAll`, `findAllCursor` e `count`.

## Próximas etapas

- **Etapa 4**: search-service — autocomplete, fuzzy search.
- **Etapa 5**: cart-service — endpoints CRUD para carrinho por sessão.
- **Etapa 6**: frontend — tela de catálogo com infinite scroll consumindo a API do catalog-service.
