import type {
  Animation,
  FontKey,
  Layout,
  Size,
  Skin,
  Theme,
  UnitLabels,
  WidgetConfig,
} from '@/types/widget';

/**
 * Fonte única de verdade do contrato de configuração: valores aceitos,
 * defaults e nomes de parâmetro. `parse` e `serialize` derivam tudo daqui,
 * de modo que adicionar uma opção exige tocar em um único lugar.
 */

export const LAYOUTS = [
  'minimal',
  'horizontal',
  'cards',
  'circular',
] as const satisfies readonly Layout[];
export const THEMES = ['light', 'dark', 'auto', 'neutral'] as const satisfies readonly Theme[];
export const SIZES = ['small', 'medium', 'large'] as const satisfies readonly Size[];
export const FONTS = [
  'inter',
  'poppins',
  'manrope',
  'geist',
  'playfair',
  'greatvibes',
  'system',
] as const satisfies readonly FontKey[];
export const SKINS = ['flat', 'glass', 'neon'] as const satisfies readonly Skin[];
export const ANIMATIONS = ['fade', 'slide', 'flip', 'none'] as const satisfies readonly Animation[];

export const RADIUS_MIN = 0;
export const RADIUS_MAX = 48;

export const DEFAULT_LABELS: UnitLabels = {
  months: 'Meses',
  days: 'Dias',
  hours: 'Horas',
  minutes: 'Minutos',
  seconds: 'Segundos',
};

export const DEFAULT_ENDED_TEXT = 'Evento iniciado!';

/**
 * Configuração aplicada quando a URL não informa nada.
 * `background: 'transparent'` é intencional: é o que faz o widget parecer
 * nativo dentro do Notion sem qualquer ajuste do usuário.
 */
export const DEFAULT_CONFIG: WidgetConfig = {
  targetMs: null,
  timezone: null,
  fromMs: null,

  title: '',
  subtitle: '',
  emoji: '',

  layout: 'minimal',
  theme: 'auto',
  size: 'medium',
  font: 'inter',
  titleFont: null,
  skin: 'flat',
  animation: 'slide',

  color: null,
  numberColor: null,
  titleColor: null,
  labelColor: null,
  background: 'transparent',
  radius: 16,

  /*
    `months` nasce desligado: ligá-lo por padrão mudaria a contagem de toda URL
    já publicada por aí, que passaria a mostrar uma caixa a mais sem ninguém ter
    pedido.
  */
  units: { months: false, days: true, hours: true, minutes: true, seconds: true },
  labels: DEFAULT_LABELS,
  endedText: DEFAULT_ENDED_TEXT,

  icons: false,
  progress: false,
};

/** Nomes de parâmetro na URL. Cada entrada aceita aliases curtos. */
export const PARAM_ALIASES = {
  target: ['target', 'date', 't'],
  timezone: ['timezone', 'tz'],
  from: ['from'],
  title: ['title'],
  subtitle: ['subtitle', 'sub'],
  emoji: ['emoji'],
  layout: ['layout'],
  theme: ['theme'],
  size: ['size'],
  font: ['font'],
  titleFont: ['titleFont', 'titlefont', 'tf'],
  skin: ['skin', 'style'],
  animation: ['animation', 'anim'],
  color: ['color', 'colour'],
  numberColor: ['numberColor', 'numbercolor', 'nc'],
  titleColor: ['titleColor', 'titlecolor', 'tc'],
  labelColor: ['labelColor', 'labelcolor', 'lc'],
  background: ['background', 'bg'],
  radius: ['radius'],
  months: ['months'],
  days: ['days'],
  hours: ['hours'],
  minutes: ['minutes'],
  seconds: ['seconds'],
  // `lm` já é de `labelMinutes`, então o de meses fica `lmo`.
  labelMonths: ['labelMonths', 'lmo'],
  labelDays: ['labelDays', 'ld'],
  labelHours: ['labelHours', 'lh'],
  labelMinutes: ['labelMinutes', 'lm'],
  labelSeconds: ['labelSeconds', 'ls'],
  endedText: ['endedText', 'ended'],
  icons: ['icons'],
  progress: ['progress'],
} as const;

export type ParamName = keyof typeof PARAM_ALIASES;

/** Limite de caracteres para campos livres, evitando URLs abusivas e quebra de layout. */
export const TEXT_MAX_LENGTH = 120;
