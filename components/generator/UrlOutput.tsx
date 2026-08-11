'use client';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/Button';

interface UrlOutputProps {
  url: string;
  embedCode: string;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink-soft text-xs font-medium tracking-wide uppercase">{label}</span>
        <Button
          variant="outline"
          onClick={() => void copy(value)}
          aria-label={`Copiar ${label.toLowerCase()}`}
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      <code className="border-rule text-ink-soft block max-h-24 overflow-auto rounded-lg border bg-white/70 p-3 font-mono text-xs leading-relaxed break-all">
        {value}
      </code>
    </div>
  );
}

/** Saída do gerador: a URL do widget e o snippet de embed, cada um com seu botão. */
export function UrlOutput({ url, embedCode }: UrlOutputProps) {
  return (
    <div className="flex flex-col gap-5">
      <CopyRow label="URL do widget" value={url} />
      <CopyRow label="Código embed" value={embedCode} />
    </div>
  );
}
