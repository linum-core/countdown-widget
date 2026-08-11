import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, hexToRgbChannels, isDarkColor, normalizeHex } from './color';

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
