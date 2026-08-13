# Google AdSense

Anúncios existem em **uma rota só**: a homepage (`/`), que é o gerador. Três posições — dois trilhos laterais e um bloco antes do rodapé.

## Índice

- [Por que o widget fica de fora](#por-que-o-widget-fica-de-fora)
- [Consentimento](#consentimento)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Ligar os anúncios](#ligar-os-anúncios)
- [Por que os trilhos só aparecem em 1536px](#por-que-os-trilhos-só-aparecem-em-1536px)
- [Testar localmente](#testar-localmente)
- [Arquivos](#arquivos)

---

## Por que o widget fica de fora

`/w` é servido dentro de um iframe do Notion. Um anúncio ali seria inventário exibido num contexto que não controlamos, o que as políticas do AdSense proíbem, e ainda quebraria o embed — o widget ocupa o viewport inteiro (`fixed inset-0`), sem espaço para mais nada.

A restrição tem uma consequência estrutural: **existe um único `app/layout.tsx`, herdado por `/` e por `/w`**. Nada relacionado a anúncios pode entrar nele. Todo o código de ads é montado dentro de `app/page.tsx`, e o `<Script>` do AdSense mora num componente que só aquela página renderiza.

Se um dia aparecer a tentação de mover o script para o layout raiz "para simplificar": é exatamente o que este arranjo impede.

## Consentimento

Banner próprio em pt-BR, com [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent). Os defaults (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) são enfileirados como `denied` antes de qualquer coisa.

| Estado                      | Script AdSense | Anúncios                        |
| --------------------------- | -------------- | ------------------------------- |
| Sem decisão (banner aberto) | não carrega    | nenhum                          |
| Aceitou                     | carrega        | personalizados                  |
| Recusou                     | carrega        | não-personalizados (sem perfil) |

Recusar **não** apaga os anúncios: o `requestNonPersonalizedAds = 1` é definido antes do script e o AdSense passa a servir sem cookies de perfil. Só o estado indeciso bloqueia o download.

A decisão fica em `localStorage`, na chave `cw-consent`. É o único dado que o site guarda no navegador. `/privacidade` traz um botão que apaga a chave e recarrega, reabrindo o banner.

Os sinais de consentimento são emitidos no corpo do componente `AdSenseScript`, não num `useEffect` — efeitos rodam depois que o React insere o DOM, e o `<script>` já teria começado a baixar.

## Variáveis de ambiente

Todas opcionais. Sem `NEXT_PUBLIC_ADSENSE_CLIENT` o site roda como antes: nenhuma requisição externa, nenhum banner, e `/ads.txt` responde 404.

| Variável                              | Formato        | Onde achar no painel do AdSense             |
| ------------------------------------- | -------------- | ------------------------------------------- |
| `NEXT_PUBLIC_ADSENSE_CLIENT`          | `ca-pub-<16d>` | Conta → Informações da conta → ID do editor |
| `NEXT_PUBLIC_ADSENSE_SLOT_RAIL_LEFT`  | `<10 dígitos>` | Anúncios → Por unidade → `data-ad-slot`     |
| `NEXT_PUBLIC_ADSENSE_SLOT_RAIL_RIGHT` | `<10 dígitos>` | idem                                        |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER`     | `<10 dígitos>` | idem                                        |

Cada slot é independente: um slot ausente apaga só o anúncio correspondente. Dá para ligar o rodapé primeiro e os trilhos depois.

`getAdsenseClient()` valida o formato (`/^ca-pub-\d+$/`). Um valor digitado errado desliga os anúncios em silêncio em vez de injetar um script quebrado.

## Ligar os anúncios

1. **Defina `NEXT_PUBLIC_ADSENSE_CLIENT` na Vercel** (Production e Preview) e faça um deploy. Só isso já publica o `/ads.txt` e injeta a tag — é o que o AdSense precisa para revisar o site.
2. **Confirme o `ads.txt`**: `curl https://<seu-domínio>/ads.txt` deve devolver `google.com, pub-…, DIRECT, f08c47fec0942fa0`. A rota é gerada a partir da mesma variável, então ela nunca fica dessincronizada do ID em uso.
3. **Aguarde a aprovação da conta.** Antes dela os `<ins>` ficam vazios; isso é esperado e não é bug.
4. **Crie as três unidades** no painel: duas _display_ verticais (160×600) e uma _display_ responsiva horizontal.
5. **Cole os três IDs de slot** nas variáveis restantes e faça um novo deploy.

O `ads.txt` é um route handler (`app/ads.txt/route.ts`), e não um arquivo em `public/`, porque precisa ler a variável de ambiente.

## Por que os trilhos só aparecem em 1536px

O conteúdo da homepage é um `max-w-6xl` centralizado — 1152px. Alargar o container para abrir espaço mudaria a proporção editorial do site inteiro, então os trilhos ficam `fixed`, fora do fluxo do documento, e aparecem só no breakpoint `2xl` (1536px), onde sobram 192px de cada lado. O anúncio ocupa 160px e os 32px restantes viram respiro.

A âncora é `left-[calc(50%-36rem-11rem)]`: 36rem é metade do container, 11rem são os 160px do anúncio mais 16px de folga. Em exatamente 1536px o trilho encosta na margem da janela.

Ficar fora do fluxo tem um segundo motivo: a coluna de prévia do gerador é `lg:sticky`, e um trilho no fluxo brigaria com ela.

A condição completa é `(min-width: 1536px) and (min-height: 701px)` — a altura mínima existe porque um bloco de 600px apareceria cortado numa janela larga e baixa.

**A decisão é de JavaScript (`matchMedia`), não de CSS**, e isso é deliberado. Um `<ins>` escondido com `display: none` continua sendo enviado ao AdSense, que responde `TagError: No slot size for availableWidth=0` e contabiliza uma requisição inválida. Fora da faixa, os trilhos simplesmente não são montados. Se algum dia esta regra voltar para o CSS, o erro volta junto.

Abaixo de 1536px não há anúncio lateral algum. O bloco do rodapé, esse sim, é responsivo e aparece em qualquer largura.

## Testar localmente

```bash
# Desligado (o padrão): a home deve ficar idêntica à de antes.
pnpm dev

# Ligado, com um ID de teste.
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000 \
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=0000000000 pnpm dev
```

O que verificar com o DevTools aberto:

- **Antes de decidir**, nenhuma requisição a `googlesyndication.com`.
- **Depois de aceitar**, o `adsbygoogle.js` aparece no Network. Os blocos ficam vazios com um ID falso — o esperado.
- **Em `/w`**, com o ID definido: zero requisições ao Google e nenhum `<ins>` no DOM. É a garantia de isolamento que mais importa.
- **Larguras**: os trilhos aparecem em 1920px e somem em 1440px.

Um bloqueador de anúncios não quebra nada: o `push` na fila está dentro de um `try`.

Os testes automatizados cobrem a validação do ID, as condições de renderização do slot e o ciclo do banner:

```bash
pnpm test lib/ads.test.ts components/ads
```

## Arquivos

```
lib/ads.ts                        ID do publisher + IDs dos slots
components/ads/
  consent.tsx                     ConsentProvider e useConsent
  ConsentBanner.tsx               a barra de escolha
  ConsentReset.tsx                botão de refazer a escolha (/privacidade)
  AdSenseScript.tsx               Consent Mode v2 + carga do adsbygoogle.js
  AdSlot.tsx                      um <ins>, com todas as guardas
  AdRails.tsx                     os dois trilhos laterais
app/ads.txt/route.ts              ads.txt gerado da env var
app/privacidade/page.tsx          página exigida pelas políticas do AdSense
types/ads.d.ts                    globais de window.adsbygoogle e dataLayer
```

Não foram tocados, de propósito: `app/layout.tsx`, `app/w/**`, `next.config.ts`, `app/robots.ts`.
