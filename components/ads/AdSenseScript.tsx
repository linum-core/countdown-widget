'use client';

import Script from 'next/script';
import { getAdsenseClient } from '@/lib/ads';

/**
 * Carrega o `adsbygoogle.js`.
 *
 * O script não é gateado por consentimento porque é ele próprio quem entrega a
 * CMP do Google (Privacidade e mensagens): segurá-lo até haver uma decisão
 * impediria a mensagem de aparecer justamente em quem precisa dela — o visitante
 * do EEE, do Reino Unido e da Suíça. A CMP mostra a mensagem, grava a escolha e
 * repassa os sinais do Consent Mode v2 ao AdSense sozinha; fora dessas regiões
 * ela não aparece e os anúncios seguem normalmente.
 *
 * Sem `NEXT_PUBLIC_ADSENSE_CLIENT` nada é baixado.
 */
export function AdSenseScript() {
  const client = getAdsenseClient();

  if (!client) return null;

  return (
    <Script
      id="adsbygoogle"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
