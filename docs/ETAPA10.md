# Etapa 10 — CI + endurecimento + README final + docs consolidadas

Resumo do que foi entregue na Etapa 10 do Desafio Técnico Allu.

## Escopo

- **CI (GitHub Actions):** workflow que roda em todo push e pull request para os branches `main` e `master`, executando lint, verificação de formatação, testes e build.
- **Endurecimento:** `.nvmrc` na raiz (Node 20) para alinhar ambiente local e CI; script de validação do workflow para garantir que o YAML contém os passos obrigatórios.
- **Documentação:** README com seção de CI, script `validate:workflow` na tabela de scripts, subseção "Frontend — Mobile e acessibilidade" consolidando as escolhas mobile-first; este arquivo (`docs/ETAPA10.md`) e plano atualizado.

## Subfases

| Subfase | Conteúdo                                                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A       | Workflow `.github/workflows/ci.yml` (checkout, setup Node via .nvmrc, npm ci, lint, format:check, test, build); `.nvmrc` com 20; seção CI no README |
| B       | Script `scripts/validate-workflow.cjs` e passo "Validar configuração do workflow" no pipeline; script `validate:workflow` no package.json           |
| C       | Subseção "Frontend — Mobile e acessibilidade" no README (viewport, safe area, toque, :active, responsivo)                                           |
| D       | Gates: lint, format:check, test, build — todos passando                                                                                             |
| E       | README (validate:workflow na tabela, Notas da Etapa 10), docs/ETAPA10.md, plano atualizado                                                          |

## CI (GitHub Actions)

- **Arquivo:** `.github/workflows/ci.yml`
- **Trigger:** `push` e `pull_request` nos branches `main` e `master`
- **Job único:** `lint-test-build`
  - Checkout
  - Validar configuração do workflow (`npm run validate:workflow`)
  - Configurar Node.js (versão lida de `.nvmrc`, cache `npm`)
  - Instalar dependências (`npm ci`)
  - Lint (`npm run lint`)
  - Verificar formatação (`npm run format:check`)
  - Testes (`npm test`)
  - Build (`npm run build`)

## Validação do workflow

- **Script:** `scripts/validate-workflow.cjs`
- **Comando:** `npm run validate:workflow`
- **Verificações:** existência de `.github/workflows/ci.yml`; presença dos comandos `npm run lint`, `npm run format:check`, `npm test`, `npm run build`; presença de `name: CI`.

## Estado final do projeto

- **Testes:** 203 passando (29 suites: frontend 16, catalog 5, search 4, cart 4).
- **Build:** frontend (Vite) e três serviços (TypeScript + Prisma) buildam com sucesso.
- **Documentação:** README com setup, rotas, variáveis de ambiente, CI, Swagger, testes, mobile e notas por etapa; `docs/ETAPA1.md` a `docs/ETAPA10.md`; `docs/PLANO-COMPLETO.md` com todas as etapas concluídas.

## Conclusão do desafio

Com a Etapa 10 concluída, o Desafio Técnico Allu está finalizado: monorepo com frontend (React/Vite), três microsserviços (catalog, search, cart), Prisma, Docker Compose, logs (Loki/Promtail/Grafana), CI com GitHub Actions e documentação consolidada.
