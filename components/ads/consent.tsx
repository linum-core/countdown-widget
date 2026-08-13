'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ConsentState = 'unknown' | 'granted' | 'denied';

/** Chave única do `localStorage`; o valor é o próprio `ConsentState` decidido. */
export const CONSENT_STORAGE_KEY = 'cw-consent';

interface ConsentValue {
  state: ConsentState;
  accept: () => void;
  deny: () => void;
}

const ConsentContext = createContext<ConsentValue | null>(null);

function readStored(): ConsentState {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw === 'granted' || raw === 'denied' ? raw : 'unknown';
  } catch {
    // Modo privado ou storage bloqueado: tratamos como "ainda não decidiu".
    return 'unknown';
  }
}

function persist(state: ConsentState) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // Sem persistência a escolha vale só para esta visita — melhor do que quebrar.
  }
}

/**
 * Guarda a decisão de cookies da homepage.
 *
 * O estado nasce sempre `'unknown'` e só consulta o `localStorage` dentro de um
 * efeito: o servidor não tem acesso a ele, e ler durante o render faria o HTML
 * hidratado divergir do enviado.
 */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentState>('unknown');

  useEffect(() => {
    setState(readStored());
  }, []);

  const accept = useCallback(() => {
    setState('granted');
    persist('granted');
  }, []);

  const deny = useCallback(() => {
    setState('denied');
    persist('denied');
  }, []);

  const value = useMemo<ConsentValue>(() => ({ state, accept, deny }), [state, accept, deny]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

/**
 * Consentimento atual. Fora de um `ConsentProvider` devolve `'unknown'` com
 * ações inertes — assim um slot solto nunca dispara anúncio por engano.
 */
export function useConsent(): ConsentValue {
  return useContext(ConsentContext) ?? INERT;
}

const noop = () => {};
const INERT: ConsentValue = { state: 'unknown', accept: noop, deny: noop };
