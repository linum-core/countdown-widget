import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MS_HOUR, MS_SECOND } from '@/lib/time/diff';
import { useCountdown } from './useCountdown';

const START = Date.parse('2027-05-15T12:00:00.000Z');

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calcula o valor inicial sem esperar o primeiro tick', () => {
    const { result } = renderHook(() => useCountdown({ targetMs: START + 2 * MS_HOUR }));
    expect(result.current.hours).toBe(2);
    expect(result.current.ended).toBe(false);
  });

  it('avança exatamente um segundo por tick', () => {
    const { result } = renderHook(() => useCountdown({ targetMs: START + 10 * MS_SECOND }));
    expect(result.current.seconds).toBe(10);

    act(() => {
      vi.advanceTimersByTime(MS_SECOND);
    });
    expect(result.current.seconds).toBe(9);

    act(() => {
      vi.advanceTimersByTime(3 * MS_SECOND);
    });
    expect(result.current.seconds).toBe(6);
  });

  it('não acumula drift ao longo de uma hora de ticks', () => {
    const { result } = renderHook(() => useCountdown({ targetMs: START + 2 * MS_HOUR }));

    act(() => {
      vi.advanceTimersByTime(MS_HOUR);
    });

    expect(result.current.hours).toBe(1);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
    expect(result.current.remainingMs).toBe(MS_HOUR);
  });

  it('para em zero e marca ended, sem valores negativos', () => {
    const { result } = renderHook(() => useCountdown({ targetMs: START + 2 * MS_SECOND }));

    act(() => {
      vi.advanceTimersByTime(10 * MS_SECOND);
    });

    expect(result.current.ended).toBe(true);
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.seconds).toBe(0);
    // Sem timers pendentes: o contador se encerrou sozinho.
    expect(vi.getTimerCount()).toBe(0);
  });

  it('recalcula imediatamente ao voltar de uma aba em segundo plano', () => {
    const { result } = renderHook(() => useCountdown({ targetMs: START + MS_HOUR }));

    // Simula o estrangulamento de timers: o relógio anda, o timer não dispara.
    act(() => {
      vi.setSystemTime(START + 30 * 60 * MS_SECOND);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.minutes).toBe(30);
  });

  it('permanece em zero quando não há alvo', () => {
    const { result } = renderHook(() => useCountdown({ targetMs: null }));

    act(() => {
      vi.advanceTimersByTime(5 * MS_SECOND);
    });

    expect(result.current).toMatchObject({ seconds: 0, ended: false, remainingMs: 0 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('respeita as unidades ativas', () => {
    const { result } = renderHook(() =>
      useCountdown({
        targetMs: START + 26 * MS_HOUR,
        units: { months: false, days: false, hours: true, minutes: true, seconds: true },
      }),
    );

    expect(result.current.days).toBe(0);
    expect(result.current.hours).toBe(26);
  });

  it('limpa os timers ao desmontar', () => {
    const { unmount } = renderHook(() => useCountdown({ targetMs: START + MS_HOUR }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
