'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Botão da página de privacidade para refazer a escolha sobre cookies.
 *
 * Quem guarda a decisão é a CMP do Google, não este site — então o botão pede a
 * ela que reexiba a mensagem, via `googlefc.showRevocationMessage`. A API só
 * existe onde a mensagem se aplica (EEE, Reino Unido e Suíça): em qualquer outro
 * lugar não há escolha registrada para rever, e o botão não é renderizado.
 *
 * `googlefc` chega junto com o `adsbygoogle.js`, depois da hidratação; por isso
 * a verificação vive num efeito, e não no corpo do componente.
 */
export function ConsentReset() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window.googlefc?.showRevocationMessage === 'function') {
        setAvailable(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    // A CMP pode demorar a se instalar; desistir depois de ~5s evita um timer eterno.
    const timer = window.setInterval(() => {
      if (check()) window.clearInterval(timer);
    }, 500);
    const stop = window.setTimeout(() => window.clearInterval(timer), 5000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, []);

  if (!available) return null;

  return (
    <Button variant="outline" onClick={() => window.googlefc?.showRevocationMessage?.()}>
      Rever minha escolha
    </Button>
  );
}
