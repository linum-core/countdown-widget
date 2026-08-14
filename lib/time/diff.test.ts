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

const ALL = { months: false, days: true, hours: true, minutes: true, seconds: true };

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
      ...ALL,
      days: false,
      hours: false,
      seconds: false,
    });

    expect(parts.minutes).toBe(24 * 60 + 30);
  });

  it('retorna zeros quando nenhuma unidade está ativa', () => {
    const parts = computeTimeParts(MS_DAY, 0, {
      months: false,
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

  it('deixa meses zerado enquanto a unidade está desligada', () => {
    const parts = computeTimeParts(
      Date.parse('2027-07-18T15:00:00Z'),
      Date.parse('2026-08-13T15:00:00Z'),
      ALL,
    );

    expect(parts.months).toBe(0);
    expect(parts.days).toBe(339);
  });

  it('conta meses pelo calendário, não por média de 30 dias', () => {
    const now = Date.parse('2026-08-13T15:00:00Z');
    const target = Date.parse('2027-07-18T15:00:00Z');
    const parts = computeTimeParts(target, now, { ...ALL, months: true }, 'UTC');

    // 13/08/2026 -> 13/07/2027 são 11 meses cheios; sobram 5 dias até o dia 18.
    expect(parts.months).toBe(11);
    expect(parts.days).toBe(5);
    expect(parts.hours).toBe(0);
  });

  it('respeita o tamanho real de cada mês', () => {
    const units = { ...ALL, months: true };

    // Fevereiro tem 28 dias em 2027: de 01/02 a 01/03 fecha um mês.
    const curto = computeTimeParts(
      Date.parse('2027-03-01T00:00:00Z'),
      Date.parse('2027-02-01T00:00:00Z'),
      units,
      'UTC',
    );
    expect(curto).toMatchObject({ months: 1, days: 0 });

    // Já de 01/03 a 01/04 são 31 dias, e continua sendo um mês.
    const longo = computeTimeParts(
      Date.parse('2027-04-01T00:00:00Z'),
      Date.parse('2027-03-01T00:00:00Z'),
      units,
      'UTC',
    );
    expect(longo).toMatchObject({ months: 1, days: 0 });
  });

  it('grampeia o dia ao fim do mês mais curto', () => {
    // 31/01 + 1 mês é 28/02, então de 31/01 a 28/02 fecha um mês exato.
    const parts = computeTimeParts(
      Date.parse('2027-02-28T00:00:00Z'),
      Date.parse('2027-01-31T00:00:00Z'),
      { ...ALL, months: true },
      'UTC',
    );

    expect(parts).toMatchObject({ months: 1, days: 0 });
  });

  it('não conta mês nenhum quando falta menos de um', () => {
    const parts = computeTimeParts(
      Date.parse('2027-03-30T00:00:00Z'),
      Date.parse('2027-03-01T00:00:00Z'),
      { ...ALL, months: true },
      'UTC',
    );

    expect(parts).toMatchObject({ months: 0, days: 29 });
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
