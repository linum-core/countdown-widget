'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MS_SECOND, computeTimeParts } from '@/lib/time/diff';
import type { TimeParts, UnitFlags } from '@/types/widget';

const ALL_UNITS: UnitFlags = { days: true, hours: true, minutes: true, seconds: true };

interface UseCountdownOptions {
  /** Instante alvo em epoch ms. `null` congela o contador em zero. */
  targetMs: number | null;
  units?: UnitFlags;
  /** Injeção de relógio para testes; default `Date.now`. */
  now?: () => number;
}

/**
 * Contador regressivo de um tick por segundo, sem drift.
 *
 * Três decisões sustentam a precisão exigida:
 *
 * 1. O valor exibido é sempre recalculado de `target - now()`. Nada é
 *    decrementado, então nenhum erro se acumula por mais tempo que fique aberto.
 * 2. O próximo tick é agendado com `setTimeout` para a próxima fronteira de
 *    segundo do relógio (`1000 - now() % 1000`), não a cada 1000ms fixos. Isso
 *    mantém a virada do número alinhada ao relógio real e corrige qualquer
 *    atraso de execução do timer anterior.
 * 3. `visibilitychange` força recomputo imediato ao voltar de uma aba em
 *    segundo plano. Navegadores estrangulam timers em abas ocultas; sem isso o
 *    widget apareceria congelado ao reabrir a página do Notion.
 */
export function useCountdown({ targetMs, units = ALL_UNITS, now }: UseCountdownOptions): TimeParts {
  // Mantido em ref para não recriar o efeito quando o chamador passa um inline.
  const nowRef = useRef(now ?? Date.now);
  nowRef.current = now ?? Date.now;

  const unitsRef = useRef(units);
  unitsRef.current = units;

  const read = useCallback((): TimeParts => {
    if (targetMs == null) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, remainingMs: 0, ended: false };
    }
    return computeTimeParts(targetMs, nowRef.current(), unitsRef.current);
  }, [targetMs]);

  // O primeiro valor também é calculado no servidor, o que evita um frame vazio
  // antes da hidratação.
  const [parts, setParts] = useState<TimeParts>(read);

  useEffect(() => {
    if (targetMs == null) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const tick = (): void => {
      if (cancelled) return;

      const next = read();
      setParts(next);
      if (next.ended) return; // Alvo alcançado: o timer se encerra sozinho.

      // Alinha o próximo disparo à próxima virada de segundo do relógio.
      const delay = MS_SECOND - (nowRef.current() % MS_SECOND);
      timeout = setTimeout(tick, delay);
    };

    tick();

    const onVisibilityChange = (): void => {
      if (document.visibilityState !== 'visible') return;
      if (timeout) clearTimeout(timeout);
      tick();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [targetMs, read]);

  return parts;
}
