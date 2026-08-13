'use client';

import Script from 'next/script';
import { getAdsenseClient } from '@/lib/ads';
import { useConsent, type ConsentState } from './consent';

const DENIED_ALL = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const;

const GRANTED_ALL = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
} as const;

function gtag(...args: unknown[]) {
  (window.dataLayer ??= []).push(args);
}

/**
 * Enfileira os sinais do Consent Mode v2 e, quando o visitante recusa, liga o
 * modo não-personalizado do AdSense.
 *
 * Roda no corpo do componente, e não num efeito, porque os efeitos só disparam
 * depois que o React insere o DOM — o `<Script>` abaixo já teria começado a
 * baixar. Todas as escritas são idempotentes.
 */
function applyConsent(state: ConsentState) {
  if (typeof window === 'undefined') return;

  if (!window.__cwConsentDefaults) {
    gtag('consent', 'default', DENIED_ALL);
    window.__cwConsentDefaults = true;
  }

  if (state === 'granted') {
    gtag('consent', 'update', GRANTED_ALL);
  } else if (state === 'denied') {
    gtag('consent', 'update', DENIED_ALL);
    (window.adsbygoogle ??= [] as AdsByGoogleQueue).requestNonPersonalizedAds = 1;
  }
}

/**
 * Carrega o `adsbygoogle.js` — e só depois de haver uma decisão sobre cookies.
 *
 * Enquanto o banner está aberto nenhuma requisição sai do navegador. Recusar
 * não apaga os anúncios: eles voltam sem cookies de perfil.
 */
export function AdSenseScript() {
  const client = getAdsenseClient();
  const { state } = useConsent();

  if (!client) return null;

  applyConsent(state);

  if (state === 'unknown') return null;

  return (
    <Script
      id="adsbygoogle"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
