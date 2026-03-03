# Etapa 9 — Frontend: Carrinho persistente + fluxo completo

Resumo do que foi entregue na Etapa 9 do Desafio Técnico Allu.

## Escopo

- Página **Carrinho** no frontend em `/cart`, consumindo o cart-service (GET/POST/PATCH/DELETE de carrinhos e itens).
- **SessionId** persistido em localStorage (`allu_cart_session_id`), gerado uma vez por dispositivo/navegador.
- **Fluxo:** listagem de itens, edição de quantidade, remoção de item, total; estado vazio com link para o catálogo; botão **Adicionar ao carrinho** na página do produto.
- Variável de ambiente `VITE_CART_API_URL` (padrão `http://localhost:3003`).
- UX mobile: safe area, alvos de toque ≥ 44px e estados `:active` em links e botões da página do carrinho.
- 203 testes no monorepo (92 no frontend: inclui api/cart, useCart, Cart, ProductPage com botão adicionar).

## Subfases

| Subfase | Conteúdo                                                                                                                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A       | CART_API_BASE, tipos Cart/CartItem, api/cart (getCart, addItem, updateQuantity, removeItem), cartSession (localStorage), useCart, página Cart, rota /cart, link Carrinho, botão na ProductPage |
| B       | Testes: api/cart, useCart, Cart, ProductPage (adicionar ao carrinho e botão desabilitado); describe/it em pt-BR                                                                                |
| C       | Safe area, touch targets e :active em links e botões da cart-page; media query para título e itens em 768px                                                                                    |
| D       | Gates: lint, format:check, test, build — todos passando                                                                                                                                        |
| E       | README (rota /cart, VITE_CART_API_URL, cobertura 29 suites / 203 testes), docs/ETAPA9.md, plano atualizado                                                                                     |

## Arquitetura do frontend (carrinho)

```
apps/frontend/src/
├── config/
│   └── api.ts                 # + CART_API_BASE (VITE_CART_API_URL ou localhost:3003)
├── types/
│   └── cart.ts                # Cart, CartItem
├── api/
│   └── cart.ts                # getCart, addItem, updateQuantity, removeItem
├── lib/
│   └── cartSession.ts         # getOrCreateCartSessionId() (localStorage)
├── hooks/
│   └── useCart.ts             # cart, loading, error, refetch, addItem, updateQuantity, removeItem
├── pages/
│   └── Cart.tsx               # Lista itens, quantidade, remover, total; estado vazio
└── App.tsx                    # + Rota /cart
```

## Rotas

| Rota           | Componente  | Descrição                                                   |
| -------------- | ----------- | ----------------------------------------------------------- |
| `/`            | Home        | Página inicial                                              |
| `/catalog`     | Catalog     | Catálogo com infinite scroll                                |
| `/search`      | Search      | Busca com autocomplete                                      |
| `/produto/:id` | ProductPage | Página do produto (carousel, preços, adicionar ao carrinho) |
| `/cart`        | Cart        | Carrinho (itens, quantidade, remover, total)                |

## Comportamento

- **SessionId:** ao primeiro uso, `getOrCreateCartSessionId()` gera um ID (UUID ou fallback) e grava em `localStorage`; o mesmo ID é usado em todas as chamadas ao cart-service.
- **Carregamento:** `useCart()` chama `getCart(sessionId)` no mount; estados de loading e erro com link "Ir ao catálogo".
- **Itens:** cada item exibe nome (link para `/produto/:id`), preço × quantidade = subtotal; input de quantidade (mín. 1) e botão Remover; total no rodapé.
- **Adicionar na ProductPage:** botão "Adicionar ao carrinho" envia productId, name, price, quantity 1; mensagem "Adicionado ao carrinho"; botão desabilitado quando estoque &lt; 1.

## Decisões técnicas

- **Persistência:** apenas sessionId em localStorage; sem login, o carrinho é por dispositivo/navegador.
- **Preço no carrinho:** backend retorna `price` como string (decimal); frontend usa `parseFloat` para totais e envia `price` como number em `addItem`.

## Próximas etapas

- **Etapa 10:** CI (GitHub Actions) + endurecimento + README final + docs consolidadas.
