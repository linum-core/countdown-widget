import { buildWidgetUrl } from '@/lib/config/serialize';
import { DEFAULT_CONFIG } from '@/lib/config/schema';
import type { WidgetConfig } from '@/types/widget';

/** Exemplos prontos, gerados a partir do mesmo serializador usado pelo formulário. */
const EXAMPLES: ReadonlyArray<{ name: string; description: string; config: WidgetConfig }> = [
  {
    name: 'Casamento',
    description: 'Cards, tema escuro, fundo transparente.',
    config: {
      ...DEFAULT_CONFIG,
      targetMs: Date.UTC(2027, 4, 15, 19, 0, 0),
      title: 'Casamento',
      subtitle: 'Nos vemos no altar',
      emoji: '💍',
      layout: 'cards',
      theme: 'dark',
      radius: 18,
    },
  },
  {
    name: 'Lançamento',
    description: 'Horizontal e compacto, cabe numa linha do Notion.',
    config: {
      ...DEFAULT_CONFIG,
      targetMs: Date.UTC(2027, 0, 10, 12, 0, 0),
      title: 'Lançamento',
      emoji: '🚀',
      layout: 'horizontal',
      size: 'small',
    },
  },
  {
    name: 'Ano Novo',
    description: 'Anéis circulares com progresso e brilho neon.',
    config: {
      ...DEFAULT_CONFIG,
      targetMs: Date.UTC(2027, 0, 1, 3, 0, 0),
      fromMs: Date.UTC(2026, 0, 1, 3, 0, 0),
      title: 'Ano Novo',
      emoji: '🎆',
      layout: 'circular',
      skin: 'neon',
      color: '#38bdf8',
      progress: true,
    },
  },
];

export function ExampleGallery({ siteUrl }: { siteUrl: string }) {
  return (
    <section aria-labelledby="exemplos">
      <div className="flex flex-col gap-3">
        <h2 id="exemplos" className="text-3xl font-semibold tracking-tight">
          Exemplos
        </h2>
        <p className="text-ink-soft max-w-xl text-sm leading-relaxed">
          Abra qualquer um para ver o widget isolado, exatamente como o Notion o carrega.
        </p>
      </div>

      <ul className="border-rule bg-rule mt-8 grid gap-px overflow-hidden rounded-xl border sm:grid-cols-3">
        {EXAMPLES.map((example) => (
          <li key={example.name} className="bg-paper p-6">
            <h3 className="font-medium">{example.name}</h3>
            <p className="text-ink-soft mt-2 text-sm leading-relaxed">{example.description}</p>
            <a
              href={buildWidgetUrl(example.config, siteUrl)}
              target="_blank"
              rel="noreferrer"
              className="text-accent mt-4 inline-block text-sm underline underline-offset-4"
            >
              Abrir exemplo
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
