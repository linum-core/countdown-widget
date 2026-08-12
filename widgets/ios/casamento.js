// Variables used by Scriptable.
// These must be at the very top of the file. Comments below are ignored.
// icon-color: pink; icon-glyph: heart;

/**
 * Countdown de tela de início para iOS, via app Scriptable.
 *
 * Nada de rede: a data alvo é constante, então a conta é local e o widget
 * continua certo com o aparelho offline ou em modo avião. A Apple não permite
 * webview dentro de uma extensão de widget, então a página do site não pode ser
 * desenhada aqui — este script redesenha o mesmo conteúdo com componentes
 * nativos, e o toque abre a página de verdade.
 *
 * Instalação em README deste diretório.
 */

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

/*
  Offset fixo de -03:00 em vez de nome de fuso: São Paulo não tem horário de
  verão desde 2019, e o JS do Scriptable não aceita IANA em `new Date()`. Se o
  horário de verão voltar, este é o único ponto a mudar.
*/
const ALVO = new Date('2027-07-18T15:00:00-03:00');

const TITULO = 'Casamento Marcela e Gabriel';
const SUBTITULO = 'Villagio São Bento';
const EMOJI = '💍';

/*
  `notion://` abre direto no app do Notion; sem o app instalado o iOS cai no
  https. A página é a "👰🏼‍♀️ Casamento".
*/
const URL_AO_TOCAR = 'notion://www.notion.so/2b7e450a135380fa8dd3e06aa69f7eb9';

/*
  As mesmas cores do embed (veja o README da raiz). Aqui o fundo é nosso, então
  dá para seguir claro/escuro — ao contrário do embed, onde o fundo é do Notion.
*/
const COR_NUMERO = Color.dynamic(new Color('#111111'), new Color('#f5f0ec'));
const COR_TITULO = Color.dynamic(new Color('#2b2121'), new Color('#e8d9cf'));
const COR_ROTULO = Color.dynamic(new Color('#3a3a3a'), new Color('#a89b93'));
const COR_FUNDO = Color.dynamic(new Color('#ffffff'), new Color('#191919'));

/*
  Fontes que já vêm no iOS e chegam perto das do site: Snell Roundhand no lugar
  da Great Vibes, Palatino no lugar da Playfair. Nome PostScript, não o nome de
  exibição — `new Font('Snell Roundhand', 20)` não resolve.
*/
const FONTE_TITULO = (tamanho) => new Font('SnellRoundhand-Bold', tamanho);
const FONTE_NUMERO = (tamanho) => new Font('Palatino-Bold', tamanho);
const FONTE_ROTULO = (tamanho) => new Font('Palatino-Roman', tamanho);

// ---------------------------------------------------------------------------
// Contagem
// ---------------------------------------------------------------------------

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Parte a distância até o alvo em dias, horas e minutos cheios.
 *
 * Trunca em vez de arredondar: com 9 dias e 23 horas restando, "faltam 10 dias"
 * seria mentira por uma hora, e a unidade seguinte já mostra as 23 horas.
 */
function restante(agora) {
  const ms = Math.max(0, ALVO.getTime() - agora.getTime());
  return {
    acabou: ms === 0,
    dias: Math.floor(ms / DIA),
    horas: Math.floor((ms % DIA) / HORA),
    minutos: Math.floor((ms % HORA) / MINUTO),
  };
}

function plural(valor, singular, pluralForma) {
  return valor === 1 ? singular : pluralForma;
}

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------

function texto(pai, conteudo, fonte, cor) {
  const t = pai.addText(conteudo);
  t.font = fonte;
  t.textColor = cor;
  t.centerAlignText();
  return t;
}

/** Widget de tela de início: pequeno, médio ou grande. */
function telaDeInicio(familia, tempo) {
  const w = new ListWidget();
  w.backgroundColor = COR_FUNDO;
  w.url = URL_AO_TOCAR;
  w.setPadding(12, 12, 12, 12);

  const grande = familia === 'large';
  const compacto = familia === 'small';

  w.addSpacer();

  if (compacto) {
    // No pequeno o título inteiro vira duas linhas ilegíveis; só o emoji cabe.
    texto(w, EMOJI, Font.systemFont(18), COR_TITULO);
  } else {
    const t = texto(w, `${EMOJI} ${TITULO}`, FONTE_TITULO(grande ? 30 : 22), COR_TITULO);
    t.minimumScaleFactor = 0.7;
    t.lineLimit = 2;
  }

  w.addSpacer(compacto ? 4 : 8);

  if (tempo.acabou) {
    texto(w, 'É hoje!', FONTE_NUMERO(grande ? 44 : 32), COR_NUMERO);
  } else {
    texto(w, String(tempo.dias), FONTE_NUMERO(grande ? 64 : compacto ? 44 : 52), COR_NUMERO);
    texto(w, plural(tempo.dias, 'dia', 'dias'), FONTE_ROTULO(compacto ? 11 : 13), COR_ROTULO);

    if (!compacto) {
      w.addSpacer(6);
      const detalhe = `${tempo.horas}h ${tempo.minutos}min`;
      texto(w, detalhe, FONTE_ROTULO(grande ? 16 : 13), COR_ROTULO);
    }
  }

  if (grande && !tempo.acabou) {
    w.addSpacer(10);
    texto(w, SUBTITULO, FONTE_ROTULO(15), COR_ROTULO);
  }

  w.addSpacer();
  return w;
}

/** Widget de tela de bloqueio: monocromático e minúsculo, sem cor própria. */
function telaDeBloqueio(familia, tempo) {
  const w = new ListWidget();
  w.url = URL_AO_TOCAR;
  w.addAccessoryWidgetBackground = familia === 'accessoryCircular';

  const rotulo = tempo.acabou
    ? 'É hoje!'
    : `${tempo.dias} ${plural(tempo.dias, 'dia', 'dias')}`;

  w.addSpacer();
  if (familia === 'accessoryInline') {
    // A inline é uma linha só, ao lado do relógio — nada de layout aqui.
    w.addText(`${EMOJI} ${rotulo}`);
  } else if (familia === 'accessoryCircular') {
    texto(w, tempo.acabou ? '💍' : String(tempo.dias), Font.boldSystemFont(20), Color.white());
    if (!tempo.acabou) texto(w, 'dias', Font.systemFont(9), Color.white());
  } else {
    texto(w, EMOJI + ' ' + TITULO, Font.semiboldSystemFont(12), Color.white()).lineLimit = 1;
    texto(w, rotulo, Font.boldSystemFont(18), Color.white());
  }
  w.addSpacer();

  return w;
}

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

const familia = config.widgetFamily ?? 'medium';
const tempo = restante(new Date());

const widget = familia.startsWith('accessory')
  ? telaDeBloqueio(familia, tempo)
  : telaDeInicio(familia, tempo);

/*
  Pedido de atualização em 15 min. O iOS trata como sugestão e decide sozinho
  pelo orçamento de energia, então o minuto exibido pode ficar velho — o número
  de dias, que é o que interessa, não.
*/
widget.refreshAfterDate = new Date(Date.now() + 15 * MINUTO);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Prévia ao rodar dentro do app, para conferir antes de fixar na tela.
  await widget.presentMedium();
}

Script.complete();
