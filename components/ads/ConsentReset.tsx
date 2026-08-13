'use client';

import { Button } from '@/components/ui/Button';
import { CONSENT_STORAGE_KEY } from './consent';

/**
 * Botão da página de privacidade para refazer a escolha sobre cookies.
 *
 * Apaga a decisão e recarrega, em vez de conversar com o `ConsentProvider`:
 * o recarregamento também descarta o `adsbygoogle.js` que já estiver na página.
 */
export function ConsentReset() {
  function reset() {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // Storage indisponível: não havia decisão guardada para apagar.
    }
    window.location.assign('/');
  }

  return (
    <Button variant="outline" onClick={reset}>
      Rever minha escolha
    </Button>
  );
}
