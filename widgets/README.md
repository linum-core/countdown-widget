# Widget de tela de início no celular

O countdown do site roda numa página web. Nenhuma das duas plataformas deixa uma página web virar widget de tela de início: o iOS proíbe webview dentro de extensão de widget, e o Android só desenha widget a partir de um app instalado. Então o widget nativo é **redesenhado** em cada plataforma, com a data alvo fixa no próprio aparelho.

Consequências disso, para não haver surpresa:

- **Funciona offline.** Nada é baixado; a conta é local.
- **A fonte não é idêntica** à do site. Great Vibes e Playfair não estão nos aparelhos; usamos as parecidas que já vêm instaladas.
- **A data mora em dois lugares.** Mudou a data do evento, mude aqui também — nos dois arquivos abaixo, não só na URL do Notion.
- **O minuto atrasa.** Os dois sistemas atualizam widget quando querem (iOS costuma dar ~15 min). O número de dias fica certo; o minuto exibido pode estar velho.

Tocar no widget abre a página "👰🏼‍♀️ Casamento" no app do Notion.

---

## iPhone e iPad

Precisa do **[Scriptable](https://apps.apple.com/app/scriptable/id1405459188)** (grátis, sem conta, sem anúncio).

1. Instale o Scriptable.
2. Abra `ios/casamento.js` deste repositório e copie o conteúdo inteiro.
3. No Scriptable, toque em **+**, cole, e no menu (⋯ no topo) use **Rename** para chamar de `Casamento`. O nome importa: é por ele que o widget acha o script.
4. Ainda no Scriptable, toque em ▶ para ver a prévia e conferir que os números aparecem.
5. Na tela de início, segure em um espaço vazio → **+** → procure **Scriptable** → escolha o tamanho → **Adicionar widget**.
6. Toque e segure o widget recém-criado → **Editar widget**:
   - **Script**: `Casamento`
   - **When Interacting**: `Run Script`

Tamanhos suportados:

| Tamanho | O que mostra |
| --- | --- |
| Pequeno | 💍, número de dias, rótulo |
| Médio | Título, dias, e `Xh Ymin` |
| Grande | Idem, com fonte maior e o local |
| Tela de bloqueio (retangular, circular, inline) | Versão monocromática, só os dias |

Para mudar data, título ou cores, edite o bloco `Configuração` no topo do arquivo — nada abaixo dele precisa ser tocado.

## Android

Não existe equivalente do Scriptable no Android (nenhum app roda JS e devolve um widget). O caminho é o **[KWGT](https://play.google.com/store/apps/details?id=org.kustom.widget)** — grátis; a versão Pro só é exigida para importar presets prontos, e criar do zero como abaixo não exige.

1. Instale o **KWGT**.
2. Tela de início → segure → **Widgets** → **KWGT** → arraste um tamanho para a tela.
3. Toque no widget vazio → escolha um preset em branco → **✏️ Editar**.
4. Aba **Items** → **+** → **Text**. No campo de texto, toque no ícone de fórmula (`fx`) e cole:

   ```
   $tf(2027y07M18d15h00m00s, D)$
   ```

   Esse é o número de dias restantes. `tf()` devolve o intervalo entre agora e a data; `D` formata em dias cheios. O formato da data é `AAAAyMMdDDdHHhMMmSSs` — ano, mês, dia, hora, minuto, segundo.

5. Repita o passo 4 para os outros textos que quiser:

   | Fórmula | Resultado |
   | --- | --- |
   | `$tf(2027y07M18d15h00m00s, D)$ dias` | `340 dias` |
   | `$tf(2027y07M18d15h00m00s, hh:mm:ss)$` | relógio até a hora |
   | `$tf(2027y07M18d15h00m00s, M)$` | total de minutos |
   | `💍 Casamento Marcela e Gabriel` | título, texto puro |

   `D` conta **dias cheios**: às 23h da véspera ele mostra `0`, não `1`. É a mesma regra do site.

6. Aparência, em cada item: **Font** (o KWGT lê fontes do aparelho e aceita `.ttf` importado — dá para usar a Great Vibes de verdade aqui, se quiser baixá-la), **Color** `#111111` nos números e `#3A3A3A` nos rótulos.
7. Para o toque abrir o Notion: **Touch** → **Tap** → **Open URL** → cole
   `https://www.notion.so/2b7e450a135380fa8dd3e06aa69f7eb9`
8. **✓** para salvar.

### Alternativa sem KWGT

Se não quiser montar layout, qualquer app de contagem regressiva da Play Store com widget resolve o básico (ex.: *Countdown Widget*, *Event Countdown*). Basta cadastrar `18/07/2027 15:00`. Perde-se o controle de tipografia e cor, e nenhum deles abre o Notion no toque.

---

## Manter a data em sincronia

A data do evento aparece em quatro lugares:

1. A URL do embed no Notion (parâmetro `target`).
2. `widgets/ios/casamento.js`, constante `ALVO`.
3. A fórmula do KWGT no Android.
4. A memória do projeto, se você usa o Claude Code aqui.

Só o item 1 é servido pelo site. Os outros são cópias locais — é o preço de não depender de rede.
