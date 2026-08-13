'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { getAdsenseClient } from '@/lib/ads';
import { useConsent } from './consent';

interface AdSlotProps {
  /** ID da unidade criada no painel do AdSense. Ausente = slot não renderiza. */
  slot: string | undefined;
  /** `'auto'` para o bloco responsivo do rodapé, `'vertical'` para os trilhos. */
  format: 'auto' | 'vertical';
  /** Só faça `true` em blocos que ocupam a largura do container. */
  responsive?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Rótulo lido por leitores de tela; o `<ins>` em si não diz nada. */
  label: string;
}

/**
 * Uma unidade do AdSense.
 *
 * Some por completo — sem espaço reservado, sem borda — quando falta o ID do
 * publisher, falta o ID do slot, ou o visitante ainda não decidiu sobre
 * cookies. Nesses casos o script sequer foi baixado e um `<ins>` órfão nunca
 * seria preenchido.
 */
export function AdSlot({ slot, format, responsive, className, style, label }: AdSlotProps) {
  const client = getAdsenseClient();
  const { state } = useConsent();
  const pushed = useRef(false);
  const enabled = Boolean(client && slot) && state !== 'unknown';

  useEffect(() => {
    if (!enabled || pushed.current) return;
    /*
      O StrictMode do React 19 monta cada componente duas vezes em
      desenvolvimento, e um segundo `push` sobre o mesmo `<ins>` faz o AdSense
      lançar "All ins elements ... already have ads in them".
    */
    pushed.current = true;
    try {
      (window.adsbygoogle ??= [] as AdsByGoogleQueue).push({});
    } catch {
      // Bloqueador de anúncios ou rede indisponível: a página segue inteira.
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <ins
      className={['adsbygoogle', 'block', className].filter(Boolean).join(' ')}
      style={style}
      aria-label={label}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
