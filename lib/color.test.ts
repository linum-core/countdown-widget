import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  DARK_HOST,
  hexToRgb,
  hexToRgbChannels,
  isDarkColor,
  isDualToneSafe,
  LIGHT_HOST,
  normalizeHex,
  toDualToneSafe,
} from './color';

describe('normalizeHex', () => {
  it('aceita com e sem #', () => {
    expect(normalizeHex('ffffff')).toBe('#ffffff');
    expect(normalizeHex('#FFFFFF')).toBe('#ffffff');
  });

  it('expande a forma de 3 dígitos', () => {
    expect(normalizeHex('f0a')).toBe('#ff00aa');
  });

  it('ignora espaços em volta', () => {
    expect(normalizeHex('  #111111  ')).toBe('#111111');
  });

  it('rejeita valores inválidos', () => {
    expect(normalizeHex('gggggg')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex('transparent')).toBeNull();
    expect(normalizeHex('')).toBeNull();
  });
});

describe('hexToRgb', () => {
  it('converte para canais numéricos', () => {
    expect(hexToRgb('#ff8000')).toEqual({ r: 255, g: 128, b: 0 });
  });

  it('devolve null para hex inválido', () => {
    expect(hexToRgb('nope')).toBeNull();
  });
});

describe('hexToRgbChannels', () => {
  it('devolve canais separados por espaço', () => {
    expect(hexToRgbChannels('#ff8000')).toBe('255 128 0');
  });
});

describe('contrastRatio', () => {
  it('calcula o contraste máximo entre preto e branco', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('é simétrico', () => {
    expect(contrastRatio('#123456', '#ffffff')).toBe(contrastRatio('#ffffff', '#123456'));
  });

  it('devolve 1 para cores iguais', () => {
    expect(contrastRatio('#808080', '#808080')).toBeCloseTo(1, 5);
  });

  it('devolve null quando alguma cor é inválida', () => {
    expect(contrastRatio('transparent', '#ffffff')).toBeNull();
  });
});

describe('isDarkColor', () => {
  it('classifica cores escuras e claras', () => {
    expect(isDarkColor('#111111')).toBe(true);
    expect(isDarkColor('#ffffff')).toBe(false);
  });
});

describe('isDualToneSafe', () => {
  it('reprova cor que serve só a um dos fundos', () => {
    // 9.3:1 no branco, 1.9:1 no escuro — o vermelho que sumia no Notion escuro.
    expect(isDualToneSafe('#852323')).toBe(false);
    expect(isDualToneSafe('#f5f5f5')).toBe(false);
  });

  it('aprova cor de meio-termo', () => {
    expect(isDualToneSafe('#469155')).toBe(true);
    expect(isDualToneSafe('#7a7a7a')).toBe(true);
  });

  it('devolve false para hex inválido', () => {
    expect(isDualToneSafe('transparent')).toBe(false);
  });
});

describe('toDualToneSafe', () => {
  const hue = (hex: string): number => {
    const { r, g, b } = hexToRgb(hex)!;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;
    const delta = max - min;
    const raw =
      max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return ((raw * 60) % 360 + 360) % 360;
  };

  it('torna legível nos dois fundos uma cor que só servia a um', () => {
    const fixed = toDualToneSafe('#852323')!;

    expect(contrastRatio(fixed, LIGHT_HOST)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(fixed, DARK_HOST)).toBeGreaterThanOrEqual(3);
    expect(isDualToneSafe(fixed)).toBe(true);
  });

  it('preserva a matiz — a cor escolhida continua sendo aquela cor', () => {
    // Tolerância de 1 grau absorve o arredondamento para inteiro em cada canal.
    expect(hue(toDualToneSafe('#852323')!)).toBeCloseTo(hue('#852323'), 0);
    expect(hue(toDualToneSafe('#0b2f6b')!)).toBeCloseTo(hue('#0b2f6b'), 0);
  });

  it('resolve tanto o lado escuro demais quanto o claro demais', () => {
    expect(isDualToneSafe(toDualToneSafe('#000000')!)).toBe(true);
    expect(isDualToneSafe(toDualToneSafe('#ffffff')!)).toBe(true);
    expect(isDualToneSafe(toDualToneSafe('#ffff00')!)).toBe(true);
  });

  it('devolve intacta a cor que já está na faixa', () => {
    expect(toDualToneSafe('#469155')).toBe('#469155');
    expect(toDualToneSafe('469155')).toBe('#469155');
  });

  it('devolve null para hex inválido', () => {
    expect(toDualToneSafe('transparent')).toBeNull();
  });
});
