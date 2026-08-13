'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getAdsenseClient } from '@/lib/ads';
import { useConsent } from './consent';

/**
 * Barra de consentimento da homepage.
 *
 * Só existe quando há anúncios configurados e ainda não houve decisão. As duas
 * saídas são igualmente válidas: aceitar libera anúncios personalizados, recusar
 * mantém os anúncios sem cookies de perfil.
 */
export function ConsentBanner() {
  const { state, accept, deny } = useConsent();

  if (!getAdsenseClient() || state !== 'unknown') return null;

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
    >
      <div className="bg-paper border-rule mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border px-5 py-4 shadow-[0_8px_32px_rgba(22,19,15,0.12)] sm:flex-row sm:items-center sm:gap-6">
        <p className="text-ink-soft text-sm leading-relaxed">
          Esta página exibe anúncios do Google, que podem usar cookies para personalizá&#8209;los. O
          widget gerado não carrega nada disso.{' '}
          <Link href="/privacidade" className="text-ink underline underline-offset-4">
            Saiba mais
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={deny}>
            Só o essencial
          </Button>
          <Button onClick={accept}>Aceitar</Button>
        </div>
      </div>
    </div>
  );
}
