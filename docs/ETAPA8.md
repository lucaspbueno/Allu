# Etapa 8 — Frontend: Página do produto (carousel + preços mensal/anual + imagens)

Resumo do que foi entregue na Etapa 8 do Desafio Técnico Allu.

## Escopo

- Página **Produto** no frontend em `/produto/:id`, consumindo o catalog-service (`GET /products/:id`).
- **Carousel de imagens** (componente ImageCarousel): uma ou várias imagens, botões anterior/próximo, dots e **swipe horizontal** em mobile.
- **Preços:** valor à vista e **valor mensal equivalente** (preço/12) em 12x; descrição e estoque.
- UX mobile: safe area, alvos de toque ≥ 44px (link Voltar, botões e dots do carousel), swipe no carousel.
- 173 testes no monorepo (62 no frontend: inclui api/catalog fetchProductById, useProduct, ImageCarousel, ProductPage).

## Subfases

| Subfase | Conteúdo                                                                                                                         |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A       | fetchProductById em api/catalog, useProduct(id), ImageCarousel (track, prev/next, dots), ProductPage, rota /produto/:id, estilos |
| B       | Testes: fetchProductById, useProduct, ImageCarousel, ProductPage (pt-BR); mock config em ProductPage.test                        |
| C       | Link Voltar e botões/dots com touch ≥ 44px; :active; swipe horizontal no carousel (touchStart/touchEnd); touch-action: pan-y     |
| D       | Gates: lint, format:check, test, build — todos passando                                                                          |
| E       | README (rota /produto/:id, cobertura 26 suites / 173 testes), docs/ETAPA8.md, plano atualizado                                   |

## Arquitetura do frontend (página do produto)

```
apps/frontend/src/
├── api/
│   └── catalog.ts              # + fetchProductById(id)
├── hooks/
│   └── useProduct.ts            # id → product, loading, error
├── components/
│   └── ImageCarousel.tsx        # images[], alt; track, prev/next, dots; swipe
├── pages/
│   └── ProductPage.tsx         # useParams id, useProduct, carousel, preços, descrição
└── App.tsx                      # + Rota /produto/:id
```

## Rotas

| Rota           | Componente  | Descrição                            |
| -------------- | ----------- | ------------------------------------ |
| `/`            | Home        | Página inicial                       |
| `/catalog`     | Catalog     | Catálogo com infinite scroll         |
| `/search`      | Search      | Busca com autocomplete               |
| `/produto/:id` | ProductPage | Página do produto (carousel, preços) |

## Comportamento

- **Carregamento:** `useParams` obtém `id`; `useProduct(id)` chama `fetchProductById`; estados de loading e erro com link "Voltar ao catálogo".
- **Carousel:** recebe `images: string[]` (hoje `[product.imageUrl]`); múltiplas imagens exibem setas e dots; swipe com delta horizontal > 50px troca de slide.
- **Preços:** "R$ X (valor à vista)" e "Ou R$ Y/mês (valor mensal equivalente em 12x)" com Y = price/12.

## Decisões técnicas

- **Carousel:** track com `transform: translateX(-current*100%)`; botões e dots só com mais de uma imagem.
- **Swipe:** `touchStart` guarda clientX; `touchEnd` calcula delta e chama goNext/goPrev se |delta| > 50; `touch-action: pan-y` no viewport.
- **Preço mensal:** exibido apenas quando o preço é um número válido; formatação com vírgula decimal.

## Próximas etapas

- **Etapa 9:** Frontend — Carrinho persistente + fluxo completo (integrar com cart-service).
- **Etapa 10:** CI + endurecimento + README final + docs consolidadas.
