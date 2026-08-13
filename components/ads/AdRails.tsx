'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { AD_SLOTS } from '@/lib/ads';
import { AdSlot } from './AdSlot';

/*
  O conteúdo da homepage é um `max-w-6xl` centralizado (1152px). Em vez de
  estreitá-lo para abrir espaço, os trilhos ficam `fixed`, fora do fluxo, e só
  existem a partir de 1536px — onde sobram 192px de cada lado. A altura mínima
  evita um bloco de 600px cortado nas duas pontas numa janela larga e baixa.
*/
const RAIL_QUERY = '(min-width: 1536px) and (min-height: 701px)';

/*
  36rem é metade do container; 11rem são os 160px do anúncio mais 16px de
  respiro. A 1536px o trilho encosta exatamente na margem da janela.
*/
const RAIL_BASE = 'ad-rail fixed top-1/2 -translate-y-1/2';

const RAIL_STYLE = { width: 160, height: 600 } as const;

/**
 * `true` quando a janela comporta os trilhos.
 *
 * A decisão precisa ser de JavaScript, e não de CSS: um `<ins>` escondido com
 * `display: none` ainda seria enviado ao AdSense, que responderia
 * `No slot size for availableWidth=0` e registraria uma requisição inválida.
 */
function useRailsFit(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const list = window.matchMedia(RAIL_QUERY);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(RAIL_QUERY).matches,
    () => false, // No servidor não há janela; os trilhos entram na hidratação.
  );
}

/**
 * Skyscrapers laterais da homepage.
 *
 * Ficam fora do fluxo do documento de propósito: assim não interferem no
 * `lg:sticky` da coluna de prévia do gerador nem no scroll da página.
 */
export function AdRails() {
  const fits = useRailsFit();
  if (!fits) return null;

  return (
    <>
      <div className={`${RAIL_BASE} left-[calc(50%-36rem-11rem)]`}>
        <AdSlot
          slot={AD_SLOTS.railLeft}
          format="vertical"
          style={RAIL_STYLE}
          label="Anúncio (lateral esquerda)"
        />
      </div>
      <div className={`${RAIL_BASE} right-[calc(50%-36rem-11rem)]`}>
        <AdSlot
          slot={AD_SLOTS.railRight}
          format="vertical"
          style={RAIL_STYLE}
          label="Anúncio (lateral direita)"
        />
      </div>
    </>
  );
}
