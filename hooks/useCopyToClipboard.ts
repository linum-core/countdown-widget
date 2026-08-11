'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copia texto para a área de transferência e expõe um estado efêmero de sucesso.
 *
 * O timeout é limpo no unmount e a cada nova cópia, evitando que o rótulo
 * "Copiado!" volte a piscar depois que o componente já saiu da tela.
 */
export function useCopyToClipboard(resetAfterMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
