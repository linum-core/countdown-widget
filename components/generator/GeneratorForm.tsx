'use client';

import { useMemo, useState } from 'react';
import { LivePreview } from '@/components/generator/LivePreview';
import { UrlOutput } from '@/components/generator/UrlOutput';
import { ColorInput, Select, TextInput, Toggle } from '@/components/generator/fields/controls';
import { Field } from '@/components/ui/Field';
import { contrastRatio } from '@/lib/color';
import { createInitialDraft, draftToConfig, type ConfigDraft } from '@/lib/config/draft';
import {
  ANIMATIONS,
  FONTS,
  LAYOUTS,
  RADIUS_MAX,
  RADIUS_MIN,
  SIZES,
  SKINS,
  THEMES,
} from '@/lib/config/schema';
import { buildEmbedCode, buildWidgetUrl } from '@/lib/config/serialize';
import { UNIT_ORDER } from '@/lib/time/diff';
import type { UnitKey } from '@/types/widget';
import { COMMON_TIMEZONES } from './timezones';

const LAYOUT_LABELS = {
  minimal: 'Minimalista',
  horizontal: 'Horizontal',
  cards: 'Cards',
  circular: 'Circular',
} as const;

const THEME_LABELS = { light: 'Claro', dark: 'Escuro', auto: 'Automático' } as const;
const SIZE_LABELS = { small: 'Pequeno', medium: 'Médio', large: 'Grande' } as const;
const SKIN_LABELS = { flat: 'Plano', glass: 'Glass', neon: 'Neon' } as const;
const ANIMATION_LABELS = {
  fade: 'Fade',
  slide: 'Slide',
  flip: 'Flip',
  none: 'Sem animação',
} as const;
const FONT_LABELS = {
  inter: 'Inter',
  poppins: 'Poppins',
  manrope: 'Manrope',
  geist: 'Geist',
  system: 'Sistema',
} as const;
const UNIT_LABELS: Record<UnitKey, string> = {
  days: 'Dias',
  hours: 'Horas',
  minutes: 'Minutos',
  seconds: 'Segundos',
};

interface GeneratorFormProps {
  /** Origem calculada no servidor; mantém a URL correta já no primeiro render. */
  siteUrl: string;
}

/**
 * Gerador visual.
 *
 * Há uma única fonte de verdade — o rascunho — da qual derivam a configuração,
 * a prévia, a URL e o snippet de embed. Nada é sincronizado manualmente entre
 * esses quatro, então eles não têm como divergir.
 */
export function GeneratorForm({ siteUrl }: GeneratorFormProps) {
  const [draft, setDraft] = useState<ConfigDraft>(() =>
    createInitialDraft(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone ?? null),
  );

  const update = <K extends keyof ConfigDraft>(key: K, value: ConfigDraft[K]): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const config = useMemo(() => draftToConfig(draft), [draft]);
  const url = useMemo(() => buildWidgetUrl(config, siteUrl), [config, siteUrl]);
  const embedCode = useMemo(() => buildEmbedCode(url), [url]);

  // Aviso de contraste: só faz sentido quando ambas as cores são sólidas.
  const contrast =
    config.color && config.background !== 'transparent'
      ? contrastRatio(config.color, config.background)
      : null;
  const lowContrast = contrast != null && contrast < 4.5;

  const timezones = useMemo(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const all = new Set(COMMON_TIMEZONES);
    if (local) all.add(local);
    return [...all].sort();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
      <form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="flex flex-col gap-4">
          <legend className="text-ink mb-2 font-medium">Evento</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data e hora">
              {(id) => (
                <TextInput
                  id={id}
                  type="datetime-local"
                  step={1}
                  value={draft.targetInput}
                  onChange={(event) => update('targetInput', event.target.value)}
                />
              )}
            </Field>

            <Field label="Fuso horário" hint="Usado para interpretar a data acima.">
              {(id) => (
                <Select
                  id={id}
                  value={draft.timezone ?? ''}
                  options={['', ...timezones]}
                  labels={{ '': 'Fuso de quem abrir' }}
                  onValueChange={(value) => update('timezone', value || null)}
                />
              )}
            </Field>

            <Field label="Título">
              {(id) => (
                <TextInput
                  id={id}
                  value={draft.title}
                  placeholder="Casamento"
                  onChange={(event) => update('title', event.target.value)}
                />
              )}
            </Field>

            <Field label="Subtítulo">
              {(id) => (
                <TextInput
                  id={id}
                  value={draft.subtitle}
                  placeholder="Nos vemos no altar"
                  onChange={(event) => update('subtitle', event.target.value)}
                />
              )}
            </Field>

            <Field label="Emoji">
              {(id) => (
                <TextInput
                  id={id}
                  value={draft.emoji}
                  placeholder="💍"
                  onChange={(event) => update('emoji', event.target.value)}
                />
              )}
            </Field>

            <Field label="Texto ao encerrar">
              {(id) => (
                <TextInput
                  id={id}
                  value={draft.endedText}
                  onChange={(event) => update('endedText', event.target.value)}
                />
              )}
            </Field>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="text-ink mb-2 font-medium">Aparência</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Layout">
              {(id) => (
                <Select
                  id={id}
                  value={draft.layout}
                  options={LAYOUTS}
                  labels={LAYOUT_LABELS}
                  onValueChange={(value) => update('layout', value)}
                />
              )}
            </Field>

            <Field label="Tema">
              {(id) => (
                <Select
                  id={id}
                  value={draft.theme}
                  options={THEMES}
                  labels={THEME_LABELS}
                  onValueChange={(value) => update('theme', value)}
                />
              )}
            </Field>

            <Field label="Tamanho">
              {(id) => (
                <Select
                  id={id}
                  value={draft.size}
                  options={SIZES}
                  labels={SIZE_LABELS}
                  onValueChange={(value) => update('size', value)}
                />
              )}
            </Field>

            <Field label="Fonte">
              {(id) => (
                <Select
                  id={id}
                  value={draft.font}
                  options={FONTS}
                  labels={FONT_LABELS}
                  onValueChange={(value) => update('font', value)}
                />
              )}
            </Field>

            <Field label="Estilo">
              {(id) => (
                <Select
                  id={id}
                  value={draft.skin}
                  options={SKINS}
                  labels={SKIN_LABELS}
                  onValueChange={(value) => update('skin', value)}
                />
              )}
            </Field>

            <Field label="Animação">
              {(id) => (
                <Select
                  id={id}
                  value={draft.animation}
                  options={ANIMATIONS}
                  labels={ANIMATION_LABELS}
                  onValueChange={(value) => update('animation', value)}
                />
              )}
            </Field>

            <Field
              label="Cor do texto"
              hint={
                lowContrast
                  ? 'Contraste abaixo de 4.5:1 — difícil de ler.'
                  : draft.color == null
                    ? 'Seguindo o tema.'
                    : undefined
              }
            >
              {(id) =>
                draft.color == null ? (
                  <button
                    id={id}
                    type="button"
                    onClick={() => update('color', '#111111')}
                    className="border-rule text-ink-soft hover:border-ink/40 hover:text-ink w-full rounded-lg border bg-white/70 px-3 py-2 text-left text-sm transition-colors"
                  >
                    Definir cor personalizada
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <ColorInput
                      id={id}
                      value={draft.color}
                      onValueChange={(value) => update('color', value)}
                    />
                    <button
                      type="button"
                      onClick={() => update('color', null)}
                      className="text-ink-faint hover:text-ink self-start text-xs underline underline-offset-4"
                    >
                      Voltar à cor do tema
                    </button>
                  </div>
                )
              }
            </Field>

            <Field label={`Cantos arredondados — ${draft.radius}px`}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={RADIUS_MIN}
                  max={RADIUS_MAX}
                  value={draft.radius}
                  onChange={(event) => update('radius', Number(event.target.value))}
                  className="accent-accent w-full"
                />
              )}
            </Field>
          </div>

          <div className="border-rule flex flex-col gap-3 rounded-xl border p-4">
            <Toggle
              checked={draft.background === 'transparent'}
              onCheckedChange={(checked) =>
                update('background', checked ? 'transparent' : '#111111')
              }
              label="Fundo transparente (recomendado no Notion)"
            />
            {draft.background !== 'transparent' ? (
              <Field label="Cor do fundo">
                {(id) => (
                  <ColorInput
                    id={id}
                    value={draft.background}
                    onValueChange={(value) => update('background', value)}
                  />
                )}
              </Field>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="text-ink mb-2 font-medium">Unidades e extras</legend>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {UNIT_ORDER.map((unit) => (
              <Toggle
                key={unit}
                checked={draft.units[unit]}
                onCheckedChange={(checked) => update('units', { ...draft.units, [unit]: checked })}
                label={UNIT_LABELS[unit]}
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {UNIT_ORDER.filter((unit) => draft.units[unit]).map((unit) => (
              <Field key={unit} label={`Rótulo de ${UNIT_LABELS[unit].toLowerCase()}`}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.labels[unit]}
                    onChange={(event) =>
                      update('labels', { ...draft.labels, [unit]: event.target.value })
                    }
                  />
                )}
              </Field>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle
              checked={draft.icons}
              onCheckedChange={(checked) => update('icons', checked)}
              label="Mostrar ícones"
            />
            <Toggle
              checked={draft.progress}
              onCheckedChange={(checked) => {
                update('progress', checked);
                // A barra precisa de uma origem; sem ela não há fração a exibir.
                if (checked && !draft.fromInput) {
                  update('fromInput', new Date().toISOString().slice(0, 16));
                }
              }}
              label="Barra de progresso"
            />
          </div>

          {draft.progress ? (
            <Field label="Início do progresso" hint="Ponto a partir do qual a barra é medida.">
              {(id) => (
                <TextInput
                  id={id}
                  type="datetime-local"
                  value={draft.fromInput}
                  onChange={(event) => update('fromInput', event.target.value)}
                />
              )}
            </Field>
          ) : null}
        </fieldset>
      </form>

      <aside className="flex flex-col gap-8 lg:sticky lg:top-8">
        <LivePreview config={config} url={url} />
        <UrlOutput url={url} embedCode={embedCode} />
      </aside>
    </div>
  );
}
