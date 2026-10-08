# Arquitetura da solução

Este documento registra as decisões técnicas da implementação do Kurio, as
políticas de estado e integração, as escolhas de UX, as limitações conhecidas e
os desvios conscientes do layout. Os comandos, contratos REST, credenciais e
cenários reproduzíveis permanecem no [README](README.md).

## 1. Objetivos e limites

A solução cobre descoberta, detalhe, favoritos, carrinho, autenticação, conta,
carteiras, checkout e acompanhamento do pedido. Toda integração externa é
simulada na camada de rede, conforme o escopo do desafio.

Não fazem parte da solução:

- blockchain, carteira ou gateway de pagamento reais;
- backend remoto ou sincronização entre dispositivos;
- páginas editoriais, suporte, ofertas e download de conteúdo;
- envio real da newsletter e navegação para serviços sociais externos.

A interface não apresenta sucesso fictício para essas ações fora do escopo.

## 2. Stack e responsabilidades

| Responsabilidade | Solução |
| --- | --- |
| Interface | React e TypeScript |
| Build e desenvolvimento | Vite |
| Roteamento e search params | TanStack Router |
| Estado remoto | TanStack Query |
| Transporte REST | Axios |
| Contratos em runtime | Zod |
| Formulários | React Hook Form e Zod |
| Estilização | Tailwind CSS e componentes baseados em shadcn/ui |
| API simulada | MSW |
| Tempo real simulado | `socket.io-client`, MSW e `@mswjs/socket.io-binding` |
| E2E e regressão visual | Playwright |
| Auditoria | Lighthouse |

## 3. Organização feature-based

```text
src/
├── app/       bootstrap, providers, router e ativação dos mocks
├── routes/    composição de páginas e integração entre features
├── features/  módulos de negócio isolados
└── shared/    UI sem regra de negócio, infraestrutura e utilitários comuns
```

A direção principal das dependências é:

```text
app/routes → features → shared
```

Uma feature não importa detalhes internos de outra feature. Quando dois
domínios precisam cooperar, a rota compõe suas APIs públicas ou injeta a ação
necessária. Isso evita ciclos e mantém as regras próximas do domínio a que
pertencem.

Dentro de cada feature:

- `api` contém transporte e validação das respostas;
- `components` contém apresentação e composição visual;
- `hooks` contém apenas hooks React;
- `query` contém query keys, options e operações de cache;
- `model` contém regras puras e schemas de estado da interface;
- `mocks` contém handlers, fixtures e persistência simulada;
- `types` contém view models que não são contratos de transporte.

Componentes de apresentação recebem dados e callbacks. Controllers e custom
hooks concentram consulta, mutations e coordenação de estados. Cada arquivo de
implementação publica uma unidade principal; arquivos `index.ts` existem apenas
como API pública da pasta.

## 4. Fluxos de dados e contratos

O caminho padrão de uma consulta REST é:

```text
componente → controller/hook → TanStack Query → API da feature
→ Axios → MSW → regra do mock → resposta Zod → cache → interface
```

Entradas e saídas das fronteiras são tratadas como dados não confiáveis. Zod
valida parâmetros relevantes, payloads REST, erros e eventos Socket.IO. Os tipos
TypeScript são derivados ou mantidos próximos desses contratos, evitando um
segundo modelo incompatível.

Valores em ETH trafegam como strings decimais. O mock converte esses valores
para unidades inteiras com `BigInt` durante os cálculos e volta a formatá-los
somente na resposta. Números de ponto flutuante não participam de subtotal,
desconto, taxa ou total.

## 5. Roteamento e estado da URL

O TanStack Router valida as rotas e os parâmetros de busca. Busca, aba,
categorias, redes, faixa de preço, ordenação e paginação do catálogo compõem a
URL. Valores inválidos são normalizados para um estado seguro e valores padrão
são omitidos para manter URLs canônicas.

Alterar um filtro reinicia a página. A navegação para o detalhe preserva a URL
anterior do catálogo, permitindo voltar com histórico e filtros intactos. As
rotas privadas consultam a sessão antes de renderizar e carregam um `returnTo`
interno validado; destinos externos são descartados.

## 6. Estado remoto, cache e concorrência

O TanStack Query é a fonte do estado remoto da interface. A configuração geral
usa `staleTime` de 30 segundos, não refaz consultas públicas apenas ao focar a
janela e repete uma vez somente falhas de rede ou respostas 5xx. Erros Zod e
respostas 4xx não recebem retry automático.

Políticas específicas:

- catálogo e detalhe usam structural sharing para preservar referências;
- mudanças de parâmetros propagam o `AbortSignal` do Query para o Axios;
- respostas canceladas ou pertencentes a outra query key não substituem o
  resultado atual;
- carrinho, carteiras e pedidos usam `staleTime: 0` e revalidam nos momentos em
  que a consistência é mais importante;
- o carrinho mantém o resultado anterior durante a atualização e reconcilia a
  resposta autoritativa;
- pedidos pendentes usam polling de 700 ms como fallback e param em estados
  terminais;
- mutations de identidade compartilham um escopo para evitar login, logout ou
  troca de conta concorrentes;
- mutations otimistas de carrinho e favoritos registram o snapshot anterior e
  fazem rollback em caso de falha.

O cache inicial da home canônica e do detalhe de demonstração pode ser hidratado
por uma fixture restrita à infraestrutura de mocks. Essa otimização só ocorre no
cenário `default`, sem query string e sem estado persistido que altere o catálogo.
O dado usa o mesmo contrato do handler, e todas as consultas seguintes continuam
passando por Axios e MSW. Cenários de erro, latência, filtros e navegação nunca
usam essa hidratação.

## 7. Sessão e isolamento por identidade

A sessão simulada dura oito horas e é recuperada após refresh. A ausência de
sessão e a expiração são estados anônimos esperados, não erros genéricos.

Dados privados usam query keys iniciadas por `['identity']` e incluem o
identificador do proprietário quando aplicável. Em login, logout, expiração ou
troca de conta, consultas privadas são canceladas e removidas antes que a nova
identidade possa usá-las. Catálogo e detalhe, por serem públicos, permanecem no
cache.

O mock persiste apenas um digest determinístico das senhas fictícias. Essa
escolha evita texto claro no armazenamento do desafio, mas não representa uma
arquitetura de autenticação de produção, que exigiria cookies seguros, TLS,
proteções contra CSRF e validação no servidor.

## 8. Carrinho, checkout e idempotência

O carrinho separa o visitante de cada usuário. No login ou cadastro, os itens do
visitante são mesclados uma única vez, limitados ao estoque atual. A persistência
é concluída antes de limpar o carrinho visitante.

O checkout cria uma cotação autoritativa com preço, estoque, desconto e taxa.
Qualquer alteração relevante invalida a revisão e exige nova confirmação. A
criação do pedido recebe `Idempotency-Key`:

- mesma chave e mesmo conteúdo recuperam o mesmo pedido;
- mesma chave com conteúdo diferente produz conflito;
- timeout após a criação não gera uma segunda compra;
- pedido confirmado consome apenas os itens comprados;
- pedido recusado preserva o carrinho;
- o recibo é um snapshot imutável da compra.

Controles pendentes e single-flight bloqueiam cliques repetidos no cliente, mas
a garantia definitiva permanece no contrato idempotente da API simulada.

## 9. REST e Socket.IO

REST é a fonte autoritativa. Socket.IO reduz o tempo até a interface observar
uma alteração, mas não substitui a reconciliação.

Cada evento possui `eventId`, `resourceId`, `version` e `occurredAt`. O cliente
registra a versão mais nova por recurso, descarta duplicatas e eventos antigos e
não permite que um pedido terminal volte a pendente. Assinaturas privadas são
vinculadas à identidade e removidas no logout ou na troca de usuário.

Na reconexão, catálogo, detalhe, carrinho e pedidos ativos são invalidados e
consultados novamente por REST. Assim, perda de eventos não deixa o cache como
fonte permanente de verdade.

## 10. Mocking e persistência

O MSW intercepta os recursos REST e a conexão compatível com o protocolo
Socket.IO. Handlers, regras, fixtures e armazenamento ficam fora de componentes,
hooks e cliente Axios. O mesmo conjunto de cenários é usado em desenvolvimento,
build de demonstração e Playwright.

O estado simulado é persistido no `localStorage` por chaves versionadas e pode
ser restaurado pelos comandos documentados no README. Cada contexto Playwright
seleciona o cenário antes da primeira chamada e começa isolado.

## 11. Decisões de UX e acessibilidade

- skeletons preservam dimensões para reduzir layout shift e respeitam
  `prefers-reduced-motion`;
- a navegação da home acompanha a seção visível durante clique, scroll suave ou
  scroll manual, mantendo um único destino marcado como atual;
- mudanças de página reposicionam o catálogo para evitar uma viewport vazia
  quando a nova página contém menos cards;
- drawers e diálogos controlam foco, fecham com `Escape` e devolvem o foco ao
  gatilho;
- modais e drawers usam o portal compartilhado do Radix, baseado em
  `ReactDOM.createPortal`, e são montados fora do `#root` para não depender de
  stacking contexts das páginas;
- mensagens de formulário são associadas aos campos, mutations importantes
  usam feedback acessível e todos os campos possuem limites coerentes;
- selects nativos recebem tema escuro para manter contraste também quando
  abertos;
- carregamento, vazio, erro, sucesso e atualização em segundo plano possuem
  estados distintos;
- ações fora do escopo permanecem inertes ou claramente indisponíveis, em vez
  de confirmar operações inexistentes.

## 12. Relação com o Figma

O Figma orienta identidade, hierarquia, proporções, tokens e composição. Os
seguintes ajustes foram intencionais:

- os valores, contagens, preços e textos de negócio vêm das fixtures, não dos
  exemplos estáticos do layout;
- as artes dos NFTs são assets próprios e responsivos; elementos decorativos
  simples são produzidos com CSS em vez de imagens de recorte;
- o frame mobile de 414 px foi adaptado também para 390 px e o intervalo de
  tablet foi construído para 768 px;
- perfil, carteiras e confirmação receberam versões mobile coerentes com o
  design system, pois não havia frame específico para todos esses estados;
- alturas rígidas viraram `min-height` quando texto, zoom ou localização podiam
  causar corte ou sobreposição;
- estados não desenhados — erro, vazio, loading, indisponibilidade, recusa e
  reconexão — reutilizam os mesmos tokens visuais;
- foco visível, labels acessíveis, regiões de status e contraste dos controles
  foram priorizados mesmo quando não estavam explicitados no frame.

## 13. Performance

Rotas são carregadas sob demanda. Dependências maiores são separadas em chunks,
assets raster usam WebP responsivo e o worker de mocks não bloqueia o primeiro
paint da rota canônica hidratada. Não existe uma versão simplificada exclusiva
para a auditoria: imagens, fontes, MSW e funcionalidades da entrega permanecem
ativos.

A configuração versionada executa três medições para home e detalhe em mobile e
desktop. HTML, JSON, medianas, versões, ambiente, LCP, CLS e TBT estão em
[`lighthouse-reports`](lighthouse-reports/README.md).

## 14. Limitações conhecidas

- o estado do mock pertence ao navegador e à origem; não existe sincronização
  real entre dispositivos ou usuários simultâneos;
- o transporte Socket.IO simulado não representa rooms distribuídas,
  autenticação de handshake, retenção durável ou múltiplos processos;
- carteira, rede, transação e link de explorador são simulações determinísticas;
- upload de avatar fica limitado ao armazenamento disponível no navegador;
- as pontuações Lighthouse variam conforme CPU, Chrome e processos concorrentes,
  por isso a entrega registra três runs e reporta a mediana;
- o deploy precisa manter `VITE_ENABLE_MSW=true`, servir
  `mockServiceWorker.js` na raiz e redirecionar rotas desconhecidas para
  `index.html` para suportar acesso direto e refresh.

Essas limitações são compatíveis com o escopo sem backend do desafio. Em uma
versão de produção, autenticação, persistência, autorização, idempotência e
tempo real seriam garantidos por serviços de backend.
