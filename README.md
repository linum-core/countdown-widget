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
2. Clique em **Copiar** na URL do widget.
3. No Notion, digite `/embed`, cole a URL e ajuste a altura do bloco.

O widget nasce com fundo transparente, então ele assume o fundo da página do Notion — em tema claro e em tema escuro. O bloco não tem barra de rolagem: se o conteúdo não couber, aumente a altura do bloco ou use `size=small`.

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
| `theme`      | —        | `light`, `dark`, `auto`                          | `auto`        |
| `size`       | —        | `small`, `medium`, `large`                       | `medium`      |
| `font`       | —        | `inter`, `poppins`, `manrope`, `geist`, `system` | `inter`       |
| `skin`       | `style`  | `flat`, `glass`, `neon`                          | `flat`        |
| `animation`  | `anim`   | `fade`, `slide`, `flip`, `none`                  | `slide`       |
| `color`      | `colour` | hex (`ffffff` ou `#fff`)                         | cor do tema   |
| `numberColor` | `nc`    | hex                                              | `color`       |
| `titleColor` | `tc`     | hex                                              | `color`       |
| `labelColor` | `lc`     | hex                                              | `color`       |
| `background` | `bg`     | `transparent` ou hex                             | `transparent` |
| `radius`     | —        | `0` a `48`                                       | `16`          |

`color` é a cor base de todo o texto. `numberColor` (dígitos e anéis do layout circular), `titleColor` (título) e `labelColor` (rótulos das unidades e subtítulo) sobrescrevem essa base e podem ser diferentes entre si. Quem não recebe cor própria segue `color`; sem `color`, segue o tema.

`theme=auto` segue a preferência do sistema de quem abrir, resolvida em CSS puro — sem JavaScript e sem flash na primeira pintura. Atenção em embeds: é o sistema do leitor que decide, não o tema da página que hospeda o iframe. Um leitor com sistema escuro abrindo uma página clara vê texto claro sobre fundo claro. Em embed, prefira `theme=light`/`theme=dark` ou cores explícitas.

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

O `vercel.json` já define o framework, os comandos e o cache dos assets estáticos. Duas configurações importantes vivem em `next.config.ts`:

- **`X-Frame-Options` nunca é enviado.** Esse cabeçalho bloquearia o iframe do Notion.
- **`Content-Security-Policy: frame-ancestors`** autoriza explicitamente os domínios do Notion.

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
