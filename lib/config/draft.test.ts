import { describe, expect, it } from 'vitest';
import { configToDraft, createInitialDraft, draftToConfig, type ConfigDraft } from './draft';
import { DEFAULT_CONFIG } from './schema';

// `ConfigDraft` troca os instantes por campos de texto; espalhar a config
// inteira deixaria `targetMs` e `fromMs` sobrando no objeto.
const CONFIG_BASE = configToDraft(DEFAULT_CONFIG);

const BASE: ConfigDraft = {
  ...CONFIG_BASE,
  targetInput: '2027-07-18T15:00',
  fromInput: '',
};

describe('configToDraft', () => {
  it('devolve o mesmo rascunho depois da ida e volta, com timezone', () => {
    const draft: ConfigDraft = {
      ...BASE,
      timezone: 'America/Sao_Paulo',
      title: 'Casamento',
      layout: 'cards',
    };

    expect(configToDraft(draftToConfig(draft))).toEqual(draft);
  });

  it('preserva a hora digitada, e não a tradução dela para outro fuso', () => {
    const draft: ConfigDraft = { ...BASE, timezone: 'Asia/Tokyo' };
    // O campo mostra 15h em Tóquio, que foi o que o autor da URL escolheu.
    expect(configToDraft(draftToConfig(draft)).targetInput).toBe('2027-07-18T15:00');
  });

  it('faz a volta sem timezone, no fuso do navegador', () => {
    const draft: ConfigDraft = { ...BASE, timezone: null };
    expect(configToDraft(draftToConfig(draft))).toEqual(draft);
  });

  it('mantém o campo vazio quando não há data', () => {
    const draft = configToDraft({ ...DEFAULT_CONFIG, targetMs: null, fromMs: null });

    expect(draft.targetInput).toBe('');
    expect(draft.fromInput).toBe('');
  });

  it('leva a origem do progresso junto', () => {
    const draft: ConfigDraft = {
      ...BASE,
      timezone: 'America/Sao_Paulo',
      fromInput: '2026-01-01T00:00',
      progress: true,
    };

    expect(configToDraft(draftToConfig(draft)).fromInput).toBe('2026-01-01T00:00');
  });

  it('carrega a aparência inteira, não só as datas', () => {
    const draft: ConfigDraft = {
      ...BASE,
      font: 'playfair',
      titleFont: 'greatvibes',
      numberColor: '#111111',
      labelColor: '#3a3a3a',
      theme: 'light',
    };

    expect(configToDraft(draftToConfig(draft))).toEqual(draft);
  });
});

describe('createInitialDraft', () => {
  it('sugere uma data 30 dias à frente', () => {
    const draft = createInitialDraft(new Date('2026-01-01T10:30:00'), 'America/Sao_Paulo');
    expect(draft.targetInput).toBe('2026-01-31T10:30');
  });
});
