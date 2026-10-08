# Kurio — Jungle Gaming Frontend Challenge

Implementação do desafio frontend da Jungle Gaming, construída com React, Vite e TypeScript a partir da especificação visual oficial.

**Aplicação publicada:** [jungle-gaming-app.vercel.app](https://jungle-gaming-app.vercel.app/)

## Documentação da entrega

- [Decisões de arquitetura, UX, limitações e desvios do Figma](ARCHITECTURE.md)
- [Medianas, ambiente e condições das auditorias Lighthouse](lighthouse-reports/README.md)
- [Enunciado oficial do desafio](https://github.com/junglegaming/frontend-challenge/blob/main/README.md)

Os relatórios individuais em `lighthouse-reports` são versionados
intencionalmente. O desafio exige três medições da home e do detalhe do NFT em
mobile e desktop, entregues em HTML e JSON. `playwright-report`, `test-results`
e `dist`, por outro lado, são artefatos locais e permanecem no `.gitignore`.

## Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`.
- npm compatível com a versão instalada do Node.js.
- Chromium do Playwright para executar os testes E2E.

## Como executar

```bash
npm ci
npm run dev
```

O MSW fica habilitado por padrão. Para explicitar ou alterar a configuração,
copie `.env.example` para `.env.local`:

```env
VITE_ENABLE_MSW=true
VITE_MOCK_SCENARIO=default
VITE_REALTIME_URL=https://realtime.kurio.test
```

- `VITE_ENABLE_MSW=false`: desativa a API simulada.
- `VITE_MOCK_SCENARIO`: define o cenário inicial dos mocks.
- `VITE_REALTIME_URL`: define o endpoint usado pelo cliente Socket.IO.

## Scripts

- `npm run dev`: inicia o ambiente de desenvolvimento.
- `npm run build`: valida o TypeScript e gera o build de produção.
- `npm run audit:lighthouse`: gera o build e executa três auditorias Lighthouse por página e perfil.
- `npm run typecheck`: executa a verificação de tipos.
- `npm run lint`: executa o Oxlint.
- `npm run test:e2e`: valida os fluxos implementados no Chromium com Playwright.
- `npm run test:visual`: compara os baselines visuais da home, do detalhe, do carrinho, da autenticação, do checkout/recibo, da conta e dos favoritos.
- `npm run test:visual:update`: atualiza os baselines visuais intencionalmente.
- `npm run preview`: serve localmente o build de produção.

Antes da primeira execução dos testes end-to-end, instale o navegador usado pelo Playwright:

```bash
npx playwright install chromium
```

O comando `npm run test:e2e` gera o relatório em `playwright-report` e mantém traces das falhas em `test-results`.

Para validar uma entrega a partir de um checkout limpo:

```bash
npm ci
npx playwright install chromium
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

### Lighthouse

```bash
npm run audit:lighthouse
```

A auditoria usa o build otimizado, o cenário de mock `default` e cobre a home e o detalhe do NFT nos perfis mobile e desktop. São feitas três execuções independentes para cada combinação, com meta mínima de 95 em Performance, Acessibilidade, Boas Práticas e SEO; as medianas e as condições ficam em [`lighthouse-reports/README.md`](lighthouse-reports/README.md). A mesma pasta preserva os relatórios HTML e JSON individuais.

## Deploy

O projeto está preparado para deploy como SPA na Vercel:

- comando de instalação: `npm ci`;
- comando de build: `npm run build`;
- diretório de saída: `dist`;
- `VITE_ENABLE_MSW=true` no ambiente publicado;
- `VITE_MOCK_SCENARIO=default` para a demonstração principal;
- `VITE_REALTIME_URL=https://realtime.kurio.test` para o transporte Socket.IO simulado.

O [`vercel.json`](vercel.json) redireciona rotas do navegador para
`index.html`, mantendo acesso direto e refresh nas rotas controladas pelo
TanStack Router. O preset Vite da Vercel pode detectar os comandos e o diretório
automaticamente; os valores acima devem ser conferidos antes da publicação.

## Arquitetura

As decisões e os trade-offs estão detalhados em
[`ARCHITECTURE.md`](ARCHITECTURE.md). Em resumo:

- `src/app`: bootstrap, configuração, roteamento e estilos globais.
- `src/features`: módulos de negócio isolados, como `home`, `catalog`, `cart`, `auth`, `account`, `wallets`, `favorites`, `checkout` e `orders`.
- `src/routes`: composição das páginas a partir das features.
- `src/shared`: layouts, componentes de UI, hooks, schemas, utilitários, tokens e assets compartilhados.

As dependências apontam de `app/routes` para `features` e de `features` para `shared`, mantendo regras e componentes de negócio encapsulados.

### Convenções de organização

- Cada arquivo de implementação expõe uma única unidade pública: componente, hook, serviço ou facade.
- Arquivos `index.ts` apenas definem a API pública de uma pasta; contratos Zod e tipos coesos permanecem agrupados para evitar fragmentação artificial.
- Pastas `hooks` contêm exclusivamente hooks React.
- Pastas `query` concentram query keys, query options, coordenação de cache e demais integrações com o TanStack Query.
- Pastas `model` mantêm somente regras de negócio puras, sem dependência de React ou TanStack Query; `api` concentra transporte HTTP e validação dos contratos da API.
- Pastas `types` concentram modelos internos de apresentação quando eles não fazem parte do contrato público da feature.
- Componentes de apresentação recebem dados e callbacks por props. Consulta, mutations e regras de interação ficam em controllers ou hooks da própria feature.
- Controllers extensos funcionam como facades e compõem hooks menores por responsabilidade, sem expor essa divisão aos componentes.
- Integrações entre features são compostas em `src/routes`. O checkout, por exemplo, recebe a criação do pedido pela rota, evitando dependência circular; quando uma feature consulta outra, usa somente seu contrato ou facade pública.
- Componentes compostos, como `Dialog`, usam uma facade única (`Dialog.Content`, `Dialog.Header`, etc.) sem espalhar vários exports pelo mesmo arquivo.

## Escopo entregue

- Home desktop baseada no frame de 1440 px.
- Home mobile baseada no frame de 414 px e adaptada para larguras menores.
- Composição intermediária responsiva para tablets em 768 px.
- Catálogo com uma única modelagem para desktop e mobile.
- Catálogo servido por `GET /api/nfts` através de uma API REST simulada com MSW.
- Detalhe servido por `GET /api/nfts/:slug`, com acesso direto, galeria e dados do NFT vindos do mock.
- Carrinho servido por uma API REST simulada, com adição, alteração de quantidade, remoção e persistência isolada para visitante e para cada usuário autenticado.
- Autenticação servida por uma API REST simulada, com cadastro, login, recuperação da sessão, logout e expiração controlada.
- Sessão integrada ao TanStack Query, com revalidação no foco, na reconexão e no vencimento, além da limpeza dos caches privados nas transições de identidade.
- Cabeçalho desktop e navegação mobile refletem a sessão atual e oferecem identificação da conta, logout, estado pendente, tratamento de erro e nova tentativa.
- Login e cadastro responsivos com React Hook Form e Zod, erros de campo/API, retorno seguro ao fluxo de origem e redirecionamento de usuários já autenticados.
- Rotas privadas de perfil e carteiras, com edição dos dados pessoais, avatar, senha e retorno seguro ao login quando a sessão não existe.
- Lista privada de favoritos por usuário, com inclusão e remoção no detalhe, atualização otimista, rollback, persistência e estados vazio/erro.
- Perfil e carteiras validados com React Hook Form e Zod, persistidos por usuário e integrados ao mesmo domínio consumido pelo checkout.
- Cadastro e edição de uma carteira principal e uma secundária, com validação por rede, prevenção de duplicidade e reconciliação da conexão ao alterar endereço ou rede.
- No login, cadastro ou recuperação da sessão, o carrinho visitante é mesclado ao carrinho da conta sem ultrapassar o estoque e sem duplicar a operação.
- Ações de compra do detalhe conectadas ao carrinho, mantendo a mesma edição em uma única linha e respeitando o estoque disponível.
- Rotas privadas de pagamento e pedido, com retorno ao ponto de origem após login ou renovação de uma sessão expirada.
- Checkout responsivo com dados do colecionador validados por React Hook Form e Zod, carteiras registradas, escolha de rede/provedor, conexão, recusa e desconexão.
- Cotação autoritativa antes da confirmação, com revalidação de itens, preços, cupom, taxa, carteira e disponibilidade.
- Criação de pedido idempotente, protegendo duplo clique e retomando a mesma tentativa após timeout.
- Pedidos persistidos nos estados pendente, confirmado ou recusado, com recuperação após reload e polling enquanto o pagamento está pendente.
- Atualizações `nft.updated` propagadas por Socket.IO para catálogo, detalhe, carrinho e checkout, com ajuste do resumo e bloqueio de cotações obsoletas.
- Atualizações `order.updated` propagadas por Socket.IO, com retomada de pedidos pendentes após interrupção, reconexão ou reload.
- Eventos repetidos ou com versão antiga são descartados; após reconexão, os recursos ativos são reconciliados pela API REST.
- Recibo imutável exibido somente após confirmação, com link para o explorador simulado; a confirmação desconta do carrinho e do estoque apenas as quantidades compradas.
- Cupom aplicado e removido pela API, incluindo respostas específicas para código inválido ou expirado.
- Subtotal, desconto, taxa de rede e total calculados no mock com `BigInt` e renderizados a partir da resposta autoritativa.
- Atualizações otimistas de quantidade e remoção com rollback em caso de falha.
- Axios como cliente HTTP e TanStack Query responsável por cache, cancelamento e retry.
- Busca, abas, filtros, ordenação e paginação enviadas como parâmetros reais da API.
- Busca, abas, filtros, ordenação e página sincronizados com a URL pelo TanStack Router.
- Busca desktop em diálogo e filtros/ordenação em drawer no mobile e tablet, reutilizando os mesmos controles da feature.
- Parâmetros padrão omitidos da URL e página corrigida quando excede o total disponível.
- Skeleton com shimmer, estado vazio e erro com nova tentativa.
- Detalhe com estados de carregamento, erro e recurso inexistente, além de edição indisponível e limite de quantidade.
- Navegação do catálogo para o detalhe preserva a URL de busca e filtros ao voltar pelo histórico.
- Diálogos com foco controlado, fechamento por `Escape` e retorno do foco ao gatilho.
- Contratos validados com Zod e valores ETH mantidos como strings decimais.
- Assets responsivos em WebP e tema integrado ao Tailwind CSS e shadcn/ui.
- Roteamento configurado com TanStack Router.
- Fluxos de refresh, voltar, avançar, controles responsivos, guardas de autenticação, expiração, logout com nova tentativa, migração do storage e isolamento do carrinho entre contas cobertos por testes end-to-end com Playwright.
- Cenários de latência, erro HTTP, indisponibilidade de rede, timeout e respostas fora de ordem controlados pelo MSW.
- Regressão visual da home, do detalhe, do carrinho, da autenticação, do pagamento, do recibo, do perfil, das carteiras e dos favoritos em desktop e mobile com baselines do Playwright.

A conta autenticada oferece identificação, perfil, carteiras, favoritos e
logout. O catálogo e os pedidos também permanecem sincronizados pelo transporte
Socket.IO simulado, sem permitir que eventos de uma sessão privada sejam
aplicados a outra identidade.

## API simulada

O fluxo atual da API simulada é:

```text
Componente → TanStack Query → Axios → MSW → regras do recurso → resposta validada
```

O fluxo em tempo real complementa a API REST:

```text
Assinatura da feature → socket.io-client → MSW Socket.IO → evento Zod → cache versionado → interface
```

As fixtures permanecem restritas à camada de mocks. Nas URLs canônicas da home e do detalhe, o cenário `default` usa a mesma facade do MSW para hidratar o primeiro estado do TanStack Query; isso representa uma resposta inicial fornecida pelo servidor sem duplicar dados ou regras. O worker começa a inicializar junto da aplicação e assume todas as consultas seguintes. Na home canônica, onde o cache inicial é garantido, seu download começa logo após o primeiro paint. Cenários de latência, erro, filtros e navegação continuam exercitando a API REST simulada com Axios e MSW. O worker permanece disponível no build publicado, pois o desafio não utiliza um backend externo.

| Método | Rota | Resposta |
| --- | --- | --- |
| `GET` | `/api/nfts` | Listagem, item em destaque, facets e paginação |
| `GET` | `/api/nfts/:slug` | NFT completo e itens relacionados da coleção |
| `GET` | `/api/cart` | Carrinho, cupom, totais e recomendações |
| `POST` | `/api/cart/items` | Adiciona ou soma uma edição, respeitando o estoque |
| `PATCH` | `/api/cart/items/:itemId` | Define a quantidade de uma linha |
| `DELETE` | `/api/cart/items/:itemId` | Remove uma linha |
| `POST` | `/api/cart/coupon` | Valida e aplica um cupom |
| `DELETE` | `/api/cart/coupon` | Remove o cupom aplicado |
| `POST` | `/api/auth/register` | Cria uma conta e inicia sua sessão |
| `POST` | `/api/auth/login` | Valida as credenciais e inicia a sessão |
| `GET` | `/api/auth/session` | Recupera a sessão persistida |
| `DELETE` | `/api/auth/session` | Encerra a sessão atual |
| `GET` | `/api/profile` | Recupera o perfil e o apelido da carteira principal |
| `PATCH` | `/api/profile` | Atualiza dados pessoais e o apelido da carteira principal |
| `PUT` | `/api/profile/avatar` | Persiste um avatar PNG, JPEG ou WebP |
| `DELETE` | `/api/profile/avatar` | Remove o avatar atual |
| `PATCH` | `/api/profile/password` | Valida a senha atual e persiste um novo digest |
| `GET` | `/api/wallets` | Lista carteiras registradas e a conexão atual |
| `POST` | `/api/wallets` | Cadastra a próxima carteira disponível |
| `PATCH` | `/api/wallets/:walletId` | Atualiza apelido, endereço ou rede da carteira |
| `POST` | `/api/wallets/:walletId/connect` | Conecta a carteira usando o provedor selecionado |
| `DELETE` | `/api/wallets/connection` | Desconecta a carteira atual |
| `GET` | `/api/favorites` | Lista os NFTs favoritos do usuário autenticado |
| `PUT` | `/api/favorites/:nftId` | Inclui um NFT de forma idempotente nos favoritos |
| `DELETE` | `/api/favorites/:nftId` | Remove um NFT dos favoritos |
| `POST` | `/api/checkout/quotes` | Valida o checkout e cria uma cotação temporária |
| `POST` | `/api/orders` | Cria ou recupera um pedido pela chave de idempotência |
| `GET` | `/api/orders/:orderId` | Recupera e acompanha o estado do pedido |

### Tempo real

O cliente Socket.IO é uma facade compartilhada e mantém uma única conexão por
identidade. As features registram somente os identificadores que estão visíveis
ou em acompanhamento; contadores de referência evitam remover uma assinatura
ainda usada por outra tela. Ao trocar de conta, assinaturas privadas de pedidos
são descartadas, listeners são removidos e uma nova conexão é criada.

| Evento | Recurso | Efeito |
| --- | --- | --- |
| `nft.updated` | NFT público | Atualiza preço, edições e disponibilidade no catálogo, detalhe e carrinho; uma revisão de checkout obsoleta é invalidada. |
| `order.updated` | Pedido privado | Atualiza somente o pedido pertencente à identidade conectada e encerra o estado pendente ao confirmar ou recusar. |

Cada evento possui `eventId`, `resourceId`, `version` e `occurredAt`. O payload é
tratado como `unknown` na fronteira e validado com Zod. A versão mais recente do
recurso é registrada no cliente; eventos duplicados, atrasados ou regressivos
não alteram o cache nem provocam nova revalidação REST. Estados terminais de
pedido também não retornam para pendente.

Na reconexão, catálogo, detalhes, carrinho e pedidos ativos são invalidados e
consultados novamente pela API REST. Assim, o socket reduz a latência da
interface, mas a resposta REST continua sendo a fonte autoritativa. O polling de
pedidos permanece como fallback simples enquanto o estado for pendente.

No ambiente local, o MSW intercepta a conexão WebSocket e
`@mswjs/socket.io-binding` traduz os pacotes do protocolo; a aplicação ainda
exercita o `socket.io-client` real. Essa simulação não implementa recursos de um
servidor distribuído, como autenticação no handshake, rooms compartilhadas entre
processos ou retenção de eventos. Em produção, `VITE_REALTIME_URL` deve apontar
para um servidor Socket.IO que aplique autorização no servidor e ofereça a mesma
estratégia de versionamento e reconciliação.

### Autenticação

O mock inclui duas contas fictícias para desenvolvimento e testes:

| Usuário | E-mail | Senha |
| --- | --- | --- |
| `luna.rocha` | `luna.rocha@kurio.test` | `Kurio@123` |
| `davi.moura` | `davi.moura@kurio.test` | `Kurio@456` |

O contrato de cadastro transporta apenas nome de usuário, e-mail e senha. A
confirmação de senha pertence ao formulário e é removida antes da chamada REST.
Contas cadastradas e a sessão de oito horas ficam sob a chave versionada
`kurio_mock_auth_v2` do `localStorage`. O estado simulado armazena somente o
digest SHA-256 das senhas; seu uso é determinístico e exclusivo do mock, não uma
estratégia recomendada para autenticação em produção.

O cabeçalho desktop e a navegação mobile aguardam a resolução da sessão antes de
exibir a ação da conta. Visitantes recebem acesso ao login; usuários autenticados
podem consultar sua identificação e encerrar a sessão. Se o logout falhar, a
sessão permanece ativa e o diálogo permite uma nova tentativa.

As rotas `/login` e `/register` são exclusivas para visitantes. Quando acessadas
por uma conta autenticada, redirecionam para o `returnTo` interno validado ou,
na ausência dele, para `/`.

### Cupons de demonstração

Adicione ao menos um NFT ao carrinho antes de testar os cupons:

| Código | Resultado esperado |
| --- | --- |
| `LAUNCH10` | Aplica 10% de desconto ao subtotal |
| `EXPIRED10` | Retorna a mensagem de cupom expirado |
| Qualquer outro código | Retorna a mensagem de cupom inválido |

Os códigos não diferenciam letras maiúsculas e minúsculas. O cupom válido
permanece no carrinho após refresh e pode ser removido pelo mesmo controle.

### Carrinho por identidade

O estado persistido usa a chave `kurio_mock_cart_v2` e separa `guestCart` dos
carrinhos armazenados em `cartsByUserId`. Os handlers resolvem a identidade pela
sessão simulada: sem sessão, operam sobre o visitante; com sessão, operam apenas
sobre o carrinho do usuário atual.

Após cadastro, login ou recuperação de uma sessão válida, o carrinho visitante
é reivindicado de forma idempotente. Itens da mesma edição têm suas quantidades
somadas até o estoque disponível, edições indisponíveis são descartadas e o
cupom já pertencente ao usuário tem prioridade sobre o cupom visitante. Somente
depois da persistência do resultado o carrinho visitante é esvaziado.

Um valor válido da chave legada `kurio_mock_cart_v1` é migrado automaticamente
para `guestCart` e removido após a migração.

### Checkout e pedidos

O checkout é privado e mantém um rascunho por usuário sob a chave
`kurio.checkout.draft:<userId>`. Dados do colecionador, carteira, provedor e uma
tentativa ainda não resolvida sobrevivem a reload ou expiração da sessão, sem
misturar informações entre contas.

Antes da confirmação, `POST /api/checkout/quotes` cria uma fotografia temporária
do carrinho. `POST /api/orders` revalida essa fotografia contra o estado atual e
exige `Idempotency-Key`; repetir a mesma chave e o mesmo conteúdo recupera o
pedido existente, enquanto reutilizá-la com outro conteúdo é rejeitado.

As carteiras ficam em `kurio_mock_wallets_v1` e as cotações em
`kurio_mock_checkout_v1`. Os pedidos,
seus recibos e registros de idempotência ficam em `kurio_mock_orders_v1`, sempre
separados por usuário. O estoque global comprado é persistido em
`kurio_mock_catalog_inventory_v1` e cada pedido é aplicado uma única vez. Um
pedido confirmado conserva o recibo original mesmo se catálogo ou carrinho
mudarem depois. Pedidos recusados preservam o carrinho; pedidos confirmados
removem somente as quantidades efetivamente compradas.

### Favoritos por usuário

Os favoritos usam a chave versionada `kurio_mock_favorites_v1` e são separados
pelo identificador da conta. As contas de demonstração começam com listas
independentes e toda conta cadastrada inicia vazia. Inclusão e remoção são
persistidas pelo mock, enquanto a interface mantém uma cópia otimista no cache
e restaura o estado anterior se a mutation falhar.

### Cenários disponíveis

| Cenário | Escopo | Comportamento |
| --- | --- | --- |
| `default` | Todos | Sucesso com latência fixa de 200 ms |
| `catalog-empty` | Catálogo | Resposta válida sem NFTs |
| `catalog-slow` | Catálogo | Sucesso após 1,5 s |
| `catalog-server-error` | Catálogo | Resposta HTTP 503 recuperável |
| `catalog-network-error` | Catálogo | Falha de conexão simulada |
| `catalog-timeout` | Catálogo | Resposta após o timeout de 10 s do Axios |
| `catalog-out-of-order` | Catálogo | Latências determinísticas para validar respostas obsoletas |
| `nft-detail-slow` | Detalhe | Sucesso após 1,5 s |
| `nft-detail-server-error` | Detalhe | Resposta HTTP 503 recuperável |
| `nft-detail-network-error` | Detalhe | Falha de conexão simulada |
| `nft-detail-timeout` | Detalhe | Resposta após o timeout de 10 s do Axios |
| `cart-slow` | Carrinho | Sucesso após 1,5 s |
| `cart-server-error` | Carrinho | Resposta HTTP 503 recuperável |
| `cart-network-error` | Carrinho | Falha de conexão simulada |
| `auth-session-expired` | Autenticação | Invalida a sessão e retorna HTTP 401 |
| `auth-logout-error` | Autenticação | Retorna HTTP 503 no logout sem encerrar a sessão, permitindo nova tentativa |
| `profile-server-error` | Conta | Retorna HTTP 503 nas operações de perfil, avatar e senha |
| `favorites-server-error` | Favoritos | Retorna HTTP 503 na consulta da lista, permitindo nova tentativa |
| `favorite-mutation-error` | Favoritos | Retorna HTTP 503 após a atualização otimista, validando rollback e recuperação |
| `wallet-connection-refused` | Checkout | Recusa deterministicamente a conexão da carteira |
| `checkout-quote-changed` | Checkout | Altera a taxa na revalidação e exige uma nova confirmação |
| `checkout-item-unavailable` | Checkout | Invalida um item entre a revisão e a confirmação |
| `order-timeout-after-create` | Pedido | Persiste o pedido, mas responde depois do timeout do cliente |
| `payment-declined` | Pedido | Transiciona o pedido pendente para recusado sem alterar o carrinho |
| `order-pending` | Pedido | Mantém o pagamento pendente para validar polling e recuperação após reload |
| `realtime-nft-update` | Catálogo/carrinho | Altera preço e disponibilidade de um NFT por `nft.updated` |
| `realtime-nft-event-ordering` | Catálogo | Emite a versão atual, uma duplicata e uma versão antiga do mesmo NFT |
| `realtime-order-reconnect` | Pedido | Interrompe o socket com um pedido pendente e confirma após a reconexão |

Durante a demonstração, um cookie pode substituir o cenário configurado no
ambiente. No console do navegador:

```js
document.cookie = "kurio_mock_scenario=catalog-slow; Path=/; SameSite=Lax"
location.reload()
```

Para restaurar o cenário configurado no ambiente:

```js
document.cookie = "kurio_mock_scenario=; Max-Age=0; Path=/"
location.reload()
```

O estado do carrinho é persistido por identidade sob uma chave versionada do
`localStorage`. Para reiniciar todos os carrinhos durante o desenvolvimento:

```js
localStorage.removeItem("kurio_mock_cart_v2")
localStorage.removeItem("kurio_mock_cart_v1")
location.reload()
```

Para restaurar contas e sessão ao estado inicial do mock:

```js
localStorage.removeItem("kurio_mock_auth_v2")
location.reload()
```

Para restaurar as listas de favoritos das contas de demonstração:

```js
localStorage.removeItem("kurio_mock_favorites_v1")
location.reload()
```

Para reiniciar carteiras, cotações, pedidos, estoque e rascunhos do checkout:

```js
localStorage.removeItem("kurio_mock_checkout_v1")
localStorage.removeItem("kurio_mock_wallets_v1")
localStorage.removeItem("kurio_mock_orders_v1")
localStorage.removeItem("kurio_mock_catalog_inventory_v1")
localStorage.removeItem("kurio_mock_realtime_catalog_v1")
localStorage.removeItem("kurio_mock_realtime_v1")
Object.keys(localStorage)
  .filter((key) => key.startsWith("kurio.checkout.draft:"))
  .forEach((key) => localStorage.removeItem(key))
location.reload()
```

Cada teste Playwright usa um contexto isolado e seleciona o cenário antes da
primeira chamada REST. Os testes não interceptam as requisições: o fluxo
continua passando por Axios e pelos handlers do MSW.

### Cache e recuperação

- Consultas ficam frescas por 30 segundos e não refazem automaticamente ao focar a janela.
- A consulta do carrinho só é habilitada após a resolução da sessão e usa a chave `['identity', 'cart', ownerId]`, em que `ownerId` é `'guest'` ou o identificador do usuário.
- Perfil, carteiras, favoritos e pedidos também usam chaves privadas iniciadas por `['identity']` e só consultam a API após a identidade ser conhecida.
- O carrinho é sempre revalidado ao montar, reconectar ou voltar o foco.
- Pedidos pendentes são consultados a cada 700 ms; o polling encerra ao confirmar ou recusar.
- Eventos Socket.IO atualizam primeiro o cache correspondente e são aceitos somente quando a versão recebida é mais nova.
- Ao observar uma confirmação, a aplicação invalida carrinho, catálogo e detalhes para reconciliar as quantidades compradas com a API.
- Após uma reconexão do socket, consultas ativas de catálogo, detalhe, carrinho e pedido são revalidadas pela API REST.
- Erros de contrato e respostas HTTP 4xx não são repetidos.
- Falhas de rede e respostas 5xx recebem uma nova tentativa automática.
- Mudanças de busca ou filtros cancelam a requisição anterior por `AbortSignal`.
- Durante mudanças de parâmetros, o último resultado permanece visível até a nova resposta.
- A sessão usa a chave `["auth", "session"]`; ausência e expiração são estados anônimos esperados, enquanto falhas inesperadas permanecem como erro da consulta.
- Login, cadastro, logout e mutations privadas de conta, carteiras, favoritos, carrinho e checkout compartilham um escopo de identidade para serializar transições concorrentes.
- Login, logout, troca ou expiração da sessão cancelam e removem somente os caches privados com prefixo `["identity"]`, preservando os caches públicos de catálogo e detalhe.
- A limpeza do cache não apaga os carrinhos persistidos: após a transição, a aplicação consulta apenas o estado correspondente à nova identidade.
