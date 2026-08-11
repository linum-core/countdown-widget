import { describe, expect, it } from 'vitest';
import { formatNaiveInTimeZone, isValidTimezone, parseTargetDate } from './timezone';

describe('isValidTimezone', () => {
  it('aceita timezones IANA', () => {
    expect(isValidTimezone('America/Sao_Paulo')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    expect(isValidTimezone('UTC')).toBe(true);
  });

  it('rejeita valores inválidos', () => {
    expect(isValidTimezone('Marte/Olimpo')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });
});

describe('parseTargetDate', () => {
  it('interpreta data ingênua na timezone informada', () => {
    // 2027-05-15 16:00 em São Paulo (UTC-3) === 19:00 UTC.
    const ms = parseTargetDate('2027-05-15T16:00:00', 'America/Sao_Paulo');
    expect(new Date(ms!).toISOString()).toBe('2027-05-15T19:00:00.000Z');
  });

  it('produz instantes diferentes para timezones diferentes', () => {
    const sp = parseTargetDate('2027-05-15T16:00:00', 'America/Sao_Paulo');
    const tokyo = parseTargetDate('2027-05-15T16:00:00', 'Asia/Tokyo');
    expect(sp).not.toBe(tokyo);
    // Tóquio (UTC+9) chega ao mesmo horário de parede 12h antes de São Paulo (UTC-3).
    expect(sp! - tokyo!).toBe(12 * 60 * 60 * 1000);
  });

  it('resolve corretamente na borda de horário de verão', () => {
    // Nova York entra no DST em 08/03/2026 às 02:00; 12:00 desse dia é UTC-4.
    const ms = parseTargetDate('2026-03-08T12:00:00', 'America/New_York');
    expect(new Date(ms!).toISOString()).toBe('2026-03-08T16:00:00.000Z');

    // Um dia antes ainda é UTC-5.
    const before = parseTargetDate('2026-03-07T12:00:00', 'America/New_York');
    expect(new Date(before!).toISOString()).toBe('2026-03-07T17:00:00.000Z');
  });

  it('ignora a timezone quando a string traz offset explícito', () => {
    const withZ = parseTargetDate('2027-05-15T16:00:00Z', 'Asia/Tokyo');
    expect(new Date(withZ!).toISOString()).toBe('2027-05-15T16:00:00.000Z');

    const withOffset = parseTargetDate('2027-05-15T16:00:00+02:00', 'Asia/Tokyo');
    expect(new Date(withOffset!).toISOString()).toBe('2027-05-15T14:00:00.000Z');
  });

  it('cai na timezone do ambiente quando a informada é inválida', () => {
    const invalid = parseTargetDate('2027-05-15T16:00:00', 'Marte/Olimpo');
    const none = parseTargetDate('2027-05-15T16:00:00', null);
    expect(invalid).toBe(none);
  });

  it('aceita data sem horário', () => {
    const ms = parseTargetDate('2027-05-15', 'UTC');
    expect(new Date(ms!).toISOString()).toBe('2027-05-15T00:00:00.000Z');
  });

  it('aceita espaço no lugar do T', () => {
    const withSpace = parseTargetDate('2027-05-15 16:00', 'UTC');
    const withT = parseTargetDate('2027-05-15T16:00:00', 'UTC');
    expect(withSpace).toBe(withT);
  });

  it('rejeita entradas inválidas', () => {
    expect(parseTargetDate('', 'UTC')).toBeNull();
    expect(parseTargetDate('lixo', 'UTC')).toBeNull();
    expect(parseTargetDate('2027-13-01T00:00:00', 'UTC')).toBeNull();
    expect(parseTargetDate('2027-02-31T00:00:00', 'UTC')).toBeNull();
    expect(parseTargetDate('2027-05-15T25:00:00', 'UTC')).toBeNull();
  });

  it('aceita 29 de fevereiro em ano bissexto', () => {
    expect(parseTargetDate('2028-02-29T00:00:00', 'UTC')).not.toBeNull();
    expect(parseTargetDate('2027-02-29T00:00:00', 'UTC')).toBeNull();
  });
});

describe('formatNaiveInTimeZone', () => {
  it('é o inverso de parseTargetDate', () => {
    const original = '2027-05-15T16:00:00';
    const ms = parseTargetDate(original, 'America/Sao_Paulo')!;
    expect(formatNaiveInTimeZone(ms, 'America/Sao_Paulo')).toBe(original);
  });

  it('normaliza a meia-noite para 00 em vez de 24', () => {
    const ms = parseTargetDate('2027-05-15T00:00:00', 'Europe/Lisbon')!;
    expect(formatNaiveInTimeZone(ms, 'Europe/Lisbon')).toBe('2027-05-15T00:00:00');
  });
});
