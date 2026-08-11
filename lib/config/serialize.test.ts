import { describe, expect, it } from 'vitest';
import type { WidgetConfig } from '@/types/widget';
import { parseConfig } from './parse';
import { DEFAULT_CONFIG } from './schema';
import { buildEmbedCode, buildWidgetUrl, serializeConfig } from './serialize';

const roundTrip = (config: WidgetConfig): WidgetConfig =>
  parseConfig(new URLSearchParams(serializeConfig(config)));

describe('serializeConfig', () => {
  it('produz query vazia para a configuração default', () => {
    expect(serializeConfig(DEFAULT_CONFIG)).toBe('');
  });

  it('omite valores iguais ao default', () => {
    const query = serializeConfig({ ...DEFAULT_CONFIG, layout: 'cards' });
    expect(query).toBe('layout=cards');
  });

  it('faz round-trip completo de uma configuração rica', () => {
    const config: WidgetConfig = {
      ...DEFAULT_CONFIG,
      targetMs: Date.parse('2027-05-15T19:00:00.000Z'),
      timezone: 'America/Sao_Paulo',
      fromMs: Date.parse('2026-01-01T03:00:00.000Z'),
      title: 'Casamento',
      subtitle: 'Nos vemos no altar',
      emoji: '💍',
      layout: 'cards',
      theme: 'dark',
      size: 'large',
      font: 'poppins',
      titleFont: 'greatvibes',
      skin: 'glass',
      animation: 'flip',
      color: '#ffffff',
      numberColor: '#ff0000',
      titleColor: '#00ff00',
      labelColor: '#0000ff',
      background: '#111111',
      radius: 18,
      units: { days: true, hours: true, minutes: true, seconds: false },
      labels: { days: 'Days', hours: 'Hours', minutes: 'Min', seconds: 'Sec' },
      endedText: 'Chegou!',
      icons: true,
      progress: true,
    };

    expect(roundTrip(config)).toEqual(config);
  });

  it('faz round-trip de um alvo sem timezone', () => {
    const config: WidgetConfig = {
      ...DEFAULT_CONFIG,
      targetMs: Date.parse('2027-05-15T19:00:00.000Z'),
    };

    expect(roundTrip(config).targetMs).toBe(config.targetMs);
  });

  it('mantém a data legível quando há timezone', () => {
    const query = serializeConfig({
      ...DEFAULT_CONFIG,
      timezone: 'America/Sao_Paulo',
      targetMs: Date.parse('2027-05-15T19:00:00.000Z'),
    });

    expect(query).toContain('target=2027-05-15T16%3A00%3A00');
  });

  it('faz round-trip dos flags booleanos desligados', () => {
    const config: WidgetConfig = {
      ...DEFAULT_CONFIG,
      units: { days: false, hours: false, minutes: true, seconds: true },
    };

    expect(roundTrip(config).units).toEqual(config.units);
  });
});

describe('buildWidgetUrl', () => {
  it('monta a URL do widget', () => {
    const url = buildWidgetUrl({ ...DEFAULT_CONFIG, layout: 'cards' }, 'https://exemplo.com');
    expect(url).toBe('https://exemplo.com/w?layout=cards');
  });

  it('remove barra final duplicada da origem', () => {
    expect(buildWidgetUrl(DEFAULT_CONFIG, 'https://exemplo.com/')).toBe('https://exemplo.com/w');
  });
});

describe('buildEmbedCode', () => {
  it('gera um iframe com fundo transparente', () => {
    const code = buildEmbedCode('https://exemplo.com/w?layout=cards', 200);
    expect(code).toContain('src="https://exemplo.com/w?layout=cards"');
    expect(code).toContain('height="200"');
    expect(code).toContain('background:transparent');
  });
});
