# Countdown Widget

Contagem regressiva minimalista, configurável inteiramente por URL e feita para ser embutida no Notion com `/embed`.

Sem conta, sem banco de dados, sem rastreio e sem nenhuma chamada externa em runtime — a configuração inteira vive na query string.

```
https://seu-dominio.com/w?target=2027-05-15T16:00:00&title=Casamento&layout=cards
```

---

## Índice

- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Scripts](#scripts)
- [Como usar no Notion](#como-usar-no-notion)
- [Fora do Notion: tela de início e Dock](#fora-do-notion-tela-de-início-e-dock)
- [Parâmetros](#parâmetros)
- [Layouts](#layouts)
- [Exemplos](#exemplos)
- [Deploy na Vercel](#deploy-na-vercel)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Arquitetura](#arquitetura)
- [Testes](#testes)
- [Screenshots](#screenshots)

---

## Requisitos

- Node.js 20.9 ou superior
- pnpm 10 ou superior

## Instalação

```bash
pnpm install
pnpm dev
```

A aplicação sobe em `http://localhost:3000`. A homepage traz o gerador visual; o widget isolado fica em `/w`.

## Scripts

| Comando             | O que faz                                  |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Servidor de desenvolvimento                |
| `pnpm build`        | Build de produção                          |
| `pnpm start`        | Sobe o build de produção                   |
| `pnpm test`         | Roda a suíte de testes uma vez             |
| `pnpm test:watch`   | Testes em modo watch                       |
| `pnpm typecheck`    | Verificação de tipos sem emitir arquivos   |
| `pnpm lint`         | ESLint                                     |
| `pnpm format`       | Formata o projeto com Prettier             |
| `pnpm format:check` | Verifica a formatação sem alterar arquivos |

## Como usar no Notion

1. Abra a homepage e ajuste a contagem no gerador até a prévia ficar do jeito desejado.
2. Na saída do gerador, escolha a aba **Notion** e clique em **Copiar**.
3. No Notion, digite `/embed`, cole a URL e ajuste a altura do bloco.

**Cole a URL, não o código.** O bloco `/embed` recebe um endereço e não interpreta marcação — um `<iframe>` colado ali vira um parágrafo de texto. O snippet HTML e o arquivo `.html` do gerador existem para outros sites: enviar um arquivo ao Notion produz um anexo com link de download, nunca um embed.

O widget nasce com fundo transparente, então ele assume o fundo da página do Notion — em tema claro e em tema escuro. O bloco não tem barra de rolagem: se o conteúdo não couber, aumente a altura do bloco ou use `size=small`.

### Retomar a edição depois

O formulário do gerador vive na URL da própria homepage: ela é reescrita a cada ajuste, e abri-la de volta traz tudo preenchido — inclusive para outra pessoa. É o **Link de edição** na saída do gerador.

```
https://seu-deploy.vercel.app/?target=2027-07-18T15:00:00&title=Casamento&layout=cards
```

Os mesmos parâmetros da tabela abaixo, na raiz em vez de em `/w`. A URL semeia o formulário uma vez, na abertura; a partir daí o caminho é só de ida, do formulário para a URL, então digitar nunca é atropelado por uma releitura.

### Contraste: use `theme=neutral` no embed

O Notion não entrega o tema da página ao embed: não há parâmetro na URL do iframe, não há `postMessage` e o `color-scheme` da página que hospeda não atravessa a fronteira do iframe. Só sobra `prefers-color-scheme`, que **responde pelo sistema operacional de quem lê** — com uma exceção: no aplicativo de computador, que é Electron, o Notion chama `nativeTheme.themeSource` ao trocar de tema, e aí a media query passa a acompanhar o tema do próprio Notion. No navegador e no celular, não.

Ou seja, `theme=auto` acerta no app de computador e é um chute nas outras superfícies. E cor fixa resolve o chute, mas só serve ao fundo para o qual foi escolhida: `#852323` tem 9.3:1 sobre branco e 1.9:1 sobre o `#191919` do Notion escuro.

Para um embed que precisa servir aos dois, use **`theme=neutral`**:

```
&theme=neutral
```

A paleta dele fica na faixa de luminância relativa ~0.20, onde o contraste contra branco e contra preto se iguala em torno de 4.2:1 — o teto matemático para uma cor só, e acima do mínimo de 3:1 que o WCAG pede para texto grande. As caixas dos layouts `cards` e `circular` derivam de `currentColor`, então acompanham.

Cores próprias continuam valendo por cima. O gerador confere cada uma contra os dois extremos e, quando alguma só serve a um lado, oferece **Ajustar cores para claro e escuro** na aba **Notion** — o ajuste preserva matiz e saturação e mexe só na claridade, então a cor escolhida continua sendo a mesma cor.

`theme=auto` continua sendo a escolha certa para o widget **instalado** (tela de início, Dock): ali o fundo é da própria página, e ele acompanha o sistema junto com o texto.

## Fora do Notion: tela de início e Dock

A mesma URL do embed se instala como aplicativo. `/w` serve um manifest derivado dos próprios parâmetros, então o atalho reabre exatamente aquela contagem — e não a homepage do gerador.

- **iPhone**: abra a URL no **Safari** (o Chrome do iOS não instala web apps) → Compartilhar → Adicionar à Tela de Início. Um toque abre em tela cheia, com os segundos correndo.
- **Mac**: Safari → Arquivo → Adicionar ao Dock.
- **Mac, sempre visível**: [Plash](https://apps.apple.com/app/plash/id1494023538) desenha a página viva no papel de parede. É o único caminho com contagem fiel na área de trabalho.

Widget nativo de tela de início não entra nessa lista: o iOS proíbe webview em extensão de widget e limita a atualização a ~15 min, o que torna os segundos impossíveis ali. Para um widget de verdade — desenhado nativamente, com a data fixa no aparelho, no iPhone e no Android — veja [`widgets/`](widgets/README.md).

Instalado, o widget deixa de ser transparente e passa a pintar o próprio fundo seguindo o tema do sistema — no embed nada muda.

## Parâmetros

Todos são opcionais, exceto `target`. **Qualquer valor inválido volta ao padrão em vez de quebrar o embed** — dentro de um iframe, uma tela em branco seria o pior resultado possível.

### Data

| Parâmetro  | Aliases     | Valores                                  | Padrão             |
| ---------- | ----------- | ---------------------------------------- | ------------------ |
| `target`   | `date`, `t` | `2027-05-15T16:00:00`, `2027-05-15`, ISO | —                  |
| `timezone` | `tz`        | Qualquer fuso IANA (`America/Sao_Paulo`) | Fuso de quem abrir |
| `from`     | —           | Mesma sintaxe de `target`                | —                  |

Uma data **sem** offset é interpretada no fuso indicado por `timezone`; se `timezone` não for informado, no fuso de quem abrir o link. Uma data **com** offset explícito (`Z` ou `+02:00`) é absoluta e ignora `timezone`.

### Conteúdo

| Parâmetro   | Aliases | Valores | Padrão             |
| ----------- | ------- | ------- | ------------------ |
| `title`     | —       | texto   | —                  |
| `subtitle`  | `sub`   | texto   | —                  |
| `emoji`     | —       | emoji   | —                  |
| `endedText` | `ended` | texto   | `Evento iniciado!` |

### Aparência

| Parâmetro    | Aliases  | Valores                                          | Padrão        |
| ------------ | -------- | ------------------------------------------------ | ------------- |
| `layout`     | —        | `minimal`, `horizontal`, `cards`, `circular`     | `minimal`     |
| `theme`      | —        | `light`, `dark`, `auto`, `neutral`               | `auto`        |
| `size`       | —        | `small`, `medium`, `large`                       | `medium`      |
| `font`       | —        | `inter`, `poppins`, `manrope`, `geist`, `playfair`, `greatvibes`, `system` | `inter` |
| `titleFont`  | `tf`     | mesmos valores de `font`                         | igual a `font` |
| `skin`       | `style`  | `flat`, `glass`, `neon`                          | `flat`        |
| `animation`  | `anim`   | `fade`, `slide`, `flip`, `none`                  | `slide`       |
| `color`      | `colour` | hex (`ffffff` ou `#fff`)                         | cor do tema   |
| `numberColor` | `nc`    | hex                                              | `color`       |
| `titleColor` | `tc`     | hex                                              | `color`       |
| `labelColor` | `lc`     | hex                                              | `color`       |
| `background` | `bg`     | `transparent` ou hex                             | `transparent` |
| `radius`     | —        | `0` a `48`                                       | `16`          |

`playfair` (serifada de convite) e `greatvibes` (cursiva) existem para o caso de casamento; `greatvibes` só faz sentido no `titleFont`, porque nos dígitos fica ilegível. `titleFont` aceita as mesmas fontes e vale só para o título — o resto continua em `font`.

`color` é a cor base de todo o texto. `numberColor` (dígitos e anéis do layout circular), `titleColor` (título) e `labelColor` (rótulos das unidades e subtítulo) sobrescrevem essa base e podem ser diferentes entre si. Quem não recebe cor própria segue `color`; sem `color`, segue o tema.

`theme=auto` segue a preferência do sistema de quem abrir, resolvida em CSS puro — sem JavaScript e sem flash na primeira pintura. Atenção em embeds: é o sistema do leitor que decide, não o tema da página que hospeda o iframe. Um leitor com sistema escuro abrindo uma página clara vê texto claro sobre fundo claro.

`theme=neutral` é a resposta para esse caso: em vez de apostar num fundo, usa tons de meio-termo que leem sobre branco e sobre preto ao mesmo tempo. É o tema recomendado para embed com `background=transparent`. Ver [Contraste: use `theme=neutral` no embed](#contraste-use-themeneutral-no-embed).

### Unidades e extras

| Parâmetro                                                 | Aliases                | Valores        | Padrão             |
| --------------------------------------------------------- | ---------------------- | -------------- | ------------------ |
| `days`, `hours`, `minutes`, `seconds`                     | —                      | `true`/`false` | `true`             |
| `labelDays`, `labelHours`, `labelMinutes`, `labelSeconds` | `ld`, `lh`, `lm`, `ls` | texto          | `Dias`, `Horas`, … |
| `icons`                                                   | —                      | `true`/`false` | `false`            |
| `progress`                                                | —                      | `true`/`false` | `false`            |

Desligar uma unidade **redistribui** o tempo para a maior unidade ativa seguinte. Com `days=false`, um alvo a dois dias exibe `48` horas em vez de perder a informação.

Todo texto visível é parâmetro: para uma contagem em inglês, basta trocar os rótulos.

```
?target=2027-05-15T16:00:00&ld=Days&lh=Hours&lm=Minutes&ls=Seconds&ended=We%20made%20it!
```

`progress=true` exige `from` para saber de onde medir a fração.

Booleanos aceitam `true/1/yes/on/sim` e `false/0/no/off/nao`.

## Layouts

| `layout`     | Descrição                                                      |
| ------------ | -------------------------------------------------------------- |
| `minimal`    | Só tipografia, sem molduras. O mais discreto dentro do Notion. |
| `horizontal` | Tudo em uma linha: `458d : 12h : 35m : 41s`.                   |
| `cards`      | Uma caixa por unidade, respeitando `radius` e `skin`.          |
| `circular`   | Um anel SVG por unidade, com o número ao centro.               |

O widget escala por _container queries_, não por breakpoints de viewport: dentro de um iframe o viewport não reflete o espaço real disponível. É isso que faz o mesmo link funcionar em bloco estreito e em bloco de largura total.

## Exemplos

```
# Casamento, cards, tema escuro
/w?target=2027-05-15T16:00:00&tz=America/Sao_Paulo&title=Casamento&sub=Nos+vemos+no+altar&emoji=💍&layout=cards&theme=dark&radius=18

# Lançamento compacto, em uma linha
/w?target=2027-01-10T09:00:00&title=Lançamento&emoji=🚀&layout=horizontal&size=small

# Ano Novo com anéis, neon e barra de progresso
/w?target=2027-01-01T00:00:00&from=2026-01-01T00:00:00&title=Ano+Novo&emoji=🎆&layout=circular&skin=neon&color=38bdf8&progress=true

# Contagem em inglês, sem segundos
/w?target=2027-05-15T16:00:00&title=Launch&seconds=false&ld=Days&lh=Hours&lm=Minutes&ended=Live+now!
```

## Deploy na Vercel

```bash
pnpm dlx vercel        # preview
pnpm dlx vercel --prod # produção
```

O `vercel.json` já define o framework, os comandos e o cache dos assets estáticos.

### Nenhum cabeçalho de enquadramento em `/w`

`next.config.ts` não envia **nem `X-Frame-Options`, nem `frame-ancestors` no CSP**. Não é esquecimento — é o que faz o embed funcionar no aplicativo do Notion no iPhone.

O `frame-ancestors` já esteve lá, listando os domínios do Notion e terminando em `*`. Mesmo assim o bloco aparecia vazio no aplicativo do iPhone, enquanto a mesma URL abria normalmente no Safari do mesmo aparelho. O motivo: `*` numa source-list de CSP casa apenas com esquemas de rede (http/https/ws/wss), nunca com a origem `null` que um WKWebView — ou qualquer iframe com atributo `sandbox` — apresenta. Nenhuma source-list consegue nomear essa origem, então a única forma de permitir é não mandar a diretiva.

Se você for endurecer os cabeçalhos, deixe essa rota de fora. O custo de segurança é nulo: `/w` é público, somente leitura, sem autenticação, sem cookie e sem ação destrutiva — não há o que sequestrar com clickjacking.

Se você usar um domínio próprio, defina `NEXT_PUBLIC_SITE_URL` para que as URLs geradas na homepage e os metadados apontem para ele.

## Variáveis de ambiente

Nenhuma é obrigatória. Veja `.env.example`.

| Variável               | Para quê                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Origem pública usada em metadata, sitemap e nas URLs do gerador. |

Sem ela, a Vercel preenche a origem automaticamente e o desenvolvimento local usa `http://localhost:3000`.

## Arquitetura

```
app/
  page.tsx           homepage + gerador
  w/page.tsx         o widget (Server Component fino + ilha client)
components/
  countdown/         widget e seus quatro layouts
  generator/         formulário, prévia e saída de URL
  home/              seções estáticas da homepage
  ui/                primitivos de formulário
hooks/
  useCountdown.ts    tick de 1s sem drift
lib/
  config/            schema, parse, serialize, rascunho do gerador
  time/              diferença de tempo e resolução de timezone
  theme/             tokens de estilo e fontes
types/
```

Três decisões sustentam o resto:

**`lib/` é puro.** Nada ali importa React ou toca no DOM, então toda a lógica de parsing, tempo e cor é testável em Node e não entra no bundle do cliente mais de uma vez.

**O schema é a fonte única de verdade.** `lib/config/schema.ts` declara valores aceitos, defaults e nomes de parâmetro; `parse` e `serialize` derivam tudo dele. Adicionar uma opção exige tocar em um lugar só, e o round-trip `parse(serialize(x)) === x` é garantido por teste.

**O estilo é dirigido por CSS custom properties.** Classes montadas dinamicamente (`bg-[${cor}]`) não existiriam no CSS final, porque o Tailwind só enxerga classes literais no código-fonte. Variáveis inline resolvem isso e ainda deixam o tema `auto` ser resolvido por media query, sem JavaScript.

### Precisão do contador

O valor exibido é sempre recalculado de `target - agora`, nunca decrementado — nenhum erro se acumula. O próximo tick é agendado para a próxima virada de segundo do relógio (`1000 - agora % 1000`), o que corrige qualquer atraso do timer anterior. E `visibilitychange` força um recomputo ao voltar de uma aba em segundo plano, onde o navegador estrangula timers.

## Testes

```bash
pnpm test
```

Cobrem o cálculo de tempo (incluindo redistribuição de unidades e bordas de horário de verão), o parser e o serializador da URL, as funções de cor, o hook do contador com timers falsos e a renderização do widget — estado de encerramento, ausência de valores negativos, transparência do fundo e rótulos acessíveis.

## Screenshots

TODO: adicionar capturas da homepage, do gerador e do widget nos quatro layouts.
