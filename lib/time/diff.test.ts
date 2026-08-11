import { describe, expect, it } from 'vitest';
import {
  MS_DAY,
  MS_HOUR,
  MS_MINUTE,
  MS_SECOND,
  computeProgress,
  computeTimeParts,
  padValue,
} from './diff';

const ALL = { days: true, hours: true, minutes: true, seconds: true };

describe('computeTimeParts', () => {
  it('quebra o intervalo em dias, horas, minutos e segundos', () => {
    const now = 0;
    const target = 458 * MS_DAY + 12 * MS_HOUR + 35 * MS_MINUTE + 41 * MS_SECOND;

    expect(computeTimeParts(target, now, ALL)).toMatchObject({
      days: 458,
      hours: 12,
      minutes: 35,
      seconds: 41,
      ended: false,
    });
  });

  it('zera tudo e marca ended quando o alvo já passou', () => {
    const parts = computeTimeParts(1_000, 5_000, ALL);
    expect(parts).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
    expect(parts.remainingMs).toBe(0);
  });

  it('nunca produz valores negativos', () => {
    const parts = computeTimeParts(0, 10 * MS_DAY, ALL);
    for (const value of [
      parts.days,
      parts.hours,
      parts.minutes,
      parts.seconds,
      parts.remainingMs,
    ]) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it('marca ended exatamente no instante do alvo', () => {
    expect(computeTimeParts(1_000, 1_000, ALL).ended).toBe(true);
    expect(computeTimeParts(1_001, 1_000, ALL).ended).toBe(false);
  });

  it('redistribui dias para horas quando dias está desativado', () => {
    const target = 2 * MS_DAY + 3 * MS_HOUR;
    const parts = computeTimeParts(target, 0, { ...ALL, days: false });

    expect(parts.days).toBe(0);
    expect(parts.hours).toBe(51);
  });

  it('acumula tudo em minutos quando só minutos está ativo', () => {
    const target = MS_DAY + 30 * MS_MINUTE;
    const parts = computeTimeParts(target, 0, {
      days: false,
      hours: false,
      minutes: true,
      seconds: false,
    });

    expect(parts.minutes).toBe(24 * 60 + 30);
  });

  it('retorna zeros quando nenhuma unidade está ativa', () => {
    const parts = computeTimeParts(MS_DAY, 0, {
      days: false,
      hours: false,
      minutes: false,
      seconds: false,
    });

    expect(parts).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(parts.remainingMs).toBe(MS_DAY);
  });

  it('usa todas as unidades quando o flag não é informado', () => {
    expect(computeTimeParts(MS_DAY, 0).days).toBe(1);
  });
});

describe('computeProgress', () => {
  it('devolve a fração decorrida', () => {
    expect(computeProgress(0, 100, 25)).toBe(0.25);
  });

  it('limita a fração ao intervalo [0, 1]', () => {
    expect(computeProgress(0, 100, -50)).toBe(0);
    expect(computeProgress(0, 100, 500)).toBe(1);
  });

  it('devolve null para intervalos inválidos', () => {
    expect(computeProgress(100, 100, 100)).toBeNull();
    expect(computeProgress(200, 100, 150)).toBeNull();
  });
});

describe('padValue', () => {
  it('preenche com zeros à esquerda', () => {
    expect(padValue(5)).toBe('05');
    expect(padValue(41)).toBe('41');
    expect(padValue(7, 3)).toBe('007');
  });

  it('não trunca números maiores que o padding', () => {
    expect(padValue(1234)).toBe('1234');
  });
});
