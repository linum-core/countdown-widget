/**
 * Contrato público do widget.
 *
 * Tudo aqui é serializável (nenhum `Date`, nenhuma função), porque o objeto
 * atravessa a fronteira Server Component -> Client Component. Datas trafegam
 * como epoch em milissegundos.
 */

export type Layout = 'minimal' | 'horizontal' | 'cards' | 'circular';
export type Theme = 'light' | 'dark' | 'auto';
export type Size = 'small' | 'medium' | 'large';
export type FontKey = 'inter' | 'poppins' | 'manrope' | 'geist' | 'system';
export type Skin = 'flat' | 'glass' | 'neon';
export type Animation = 'fade' | 'slide' | 'flip' | 'none';

/** Chave de cada unidade de tempo, na ordem em que é exibida. */
export type UnitKey = 'days' | 'hours' | 'minutes' | 'seconds';

export type UnitFlags = Record<UnitKey, boolean>;
export type UnitLabels = Record<UnitKey, string>;

export interface WidgetConfig {
  /** Instante alvo em epoch ms. `null` quando ausente ou inválido. */
  targetMs: number | null;
  /** Timezone IANA usada para interpretar datas sem offset. `null` = timezone do visitante. */
  timezone: string | null;
  /** Início da barra de progresso, em epoch ms. `null` = progresso desativado por falta de origem. */
  fromMs: number | null;

  title: string;
  subtitle: string;
  emoji: string;

  layout: Layout;
  theme: Theme;
  size: Size;
  font: FontKey;
  skin: Skin;
  animation: Animation;

  /** Cor base de todo o texto, sempre normalizada para `#rrggbb`. `null` = segue o tema. */
  color: string | null;
  /** Cor só dos dígitos. Sobrescreve `color`. */
  numberColor: string | null;
  /** Cor só do título. Sobrescreve `color`. */
  titleColor: string | null;
  /** Cor dos rótulos das unidades e do subtítulo. Sobrescreve `color`. */
  labelColor: string | null;
  /** `'transparent'` ou `#rrggbb`. */
  background: string;
  /** Raio das caixas em px. */
  radius: number;

  units: UnitFlags;
  labels: UnitLabels;
  endedText: string;

  icons: boolean;
  progress: boolean;
}

/** Resultado do cálculo de tempo restante. */
export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milissegundos restantes, nunca negativo. */
  remainingMs: number;
  /** `true` quando o alvo já passou. */
  ended: boolean;
}
