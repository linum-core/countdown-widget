import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { isDualToneSafe } from '@/lib/color';
import { DEFAULT_CONFIG } from '@/lib/config/schema';
import { MS_DAY, MS_HOUR, MS_MINUTE, MS_SECOND } from '@/lib/time/diff';
import type { WidgetConfig } from '@/types/widget';
import { Countdown } from './Countdown';

const NOW = Date.parse('2026-01-01T00:00:00.000Z');
const now = () => NOW;

function renderWidget(overrides: Partial<WidgetConfig> = {}) {
  const config: WidgetConfig = {
    ...DEFAULT_CONFIG,
    targetMs: NOW + 458 * MS_DAY + 12 * MS_HOUR + 35 * MS_MINUTE + 41 * MS_SECOND,
    title: 'Casamento',
    ...overrides,
  };

  const result = render(<Countdown config={config} now={now} />);
  return { ...result, config };
}

describe('Countdown', () => {
  it('exibe os quatro blocos de tempo com seus rótulos', () => {
    renderWidget();

    expect(screen.getByText('458')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('41')).toBeInTheDocument();
    expect(screen.getByText('Dias')).toBeInTheDocument();
  });

  it('descreve o tempo restante para leitores de tela', () => {
    renderWidget();

    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute(
      'aria-label',
      'Faltam 458 dias, 12 horas, 35 minutos e 41 segundos para Casamento',
    );
    // Um anúncio por segundo tornaria o widget inutilizável com leitor de tela.
    expect(timer).toHaveAttribute('aria-live', 'off');
  });

  it('mostra a mensagem de encerramento quando a data chegou', () => {
    renderWidget({ targetMs: NOW - MS_DAY, endedText: 'Evento iniciado!' });

    expect(screen.getByText('Evento iniciado!')).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('nunca exibe valores negativos', () => {
    const { container } = renderWidget({ targetMs: NOW - 10 * MS_DAY });
    expect(container.textContent).not.toMatch(/-\d/);
  });

  it('orienta a configuração quando não há data', () => {
    renderWidget({ targetMs: null });
    expect(screen.getByText('Nenhuma data definida')).toBeInTheDocument();
  });

  it('não aplica nenhum fundo quando o background é transparente', () => {
    const { container } = renderWidget({ background: 'transparent' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.backgroundColor).toBe('');
    expect(root.style.boxShadow).toBe('');
    expect(root.style.border).toBe('');
  });

  it('aplica o fundo sólido quando informado', () => {
    const { container } = renderWidget({ background: '#111111' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.backgroundColor).toBe('rgb(17, 17, 17)');
  });

  it('respeita as unidades desativadas e redistribui o tempo', () => {
    renderWidget({
      targetMs: NOW + 2 * MS_DAY + 3 * MS_HOUR,
      units: { months: false, days: false, hours: true, minutes: true, seconds: true },
    });

    expect(screen.getByText('51')).toBeInTheDocument();
    expect(screen.queryByText('Dias')).not.toBeInTheDocument();
  });

  it('mostra meses de calendário quando a unidade está ligada', () => {
    renderWidget({
      // 01/01/2026 -> 18/07/2027: 18 meses cheios e 17 dias.
      targetMs: Date.parse('2027-07-18T00:00:00.000Z'),
      timezone: 'UTC',
      units: { months: true, days: true, hours: true, minutes: true, seconds: true },
    });

    expect(screen.getByText('Meses')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('usa os rótulos vindos da configuração', () => {
    renderWidget({
      labels: { months: 'Mos', days: 'Days', hours: 'Hrs', minutes: 'Min', seconds: 'Sec' },
    });

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hrs')).toBeInTheDocument();
  });

  it('renderiza todos os layouts sem quebrar', () => {
    for (const layout of ['minimal', 'horizontal', 'cards', 'circular'] as const) {
      const { unmount } = renderWidget({ layout });
      expect(screen.getByRole('timer')).toBeInTheDocument();
      unmount();
    }
  });

  it('exibe a barra de progresso quando há origem definida', () => {
    renderWidget({
      targetMs: NOW + MS_DAY,
      fromMs: NOW - MS_DAY,
      progress: true,
    });

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('omite a barra de progresso sem origem', () => {
    renderWidget({ progress: true, fromMs: null });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('aplica a cor base em todo o texto', () => {
    const { container } = renderWidget({ color: '#ff0000' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.getPropertyValue('--cd-fg')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--cd-muted')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--cd-number')).toBe('');
  });

  it('aplica cada cor por papel na sua própria variável', () => {
    const { container } = renderWidget({
      numberColor: '#ff0000',
      titleColor: '#00ff00',
      labelColor: '#0000ff',
    });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.getPropertyValue('--cd-number')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--cd-title-color')).toBe('#00ff00');
    expect(root.style.getPropertyValue('--cd-label-color')).toBe('#0000ff');
    // Sem `color`, as variáveis base ficam livres para o tema resolver.
    expect(root.style.getPropertyValue('--cd-fg')).toBe('');
  });

  it('faz a cor dos números vencer a cor base sem contaminar os rótulos', () => {
    const { container } = renderWidget({ color: '#ff0000', numberColor: '#00ff00' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.getPropertyValue('--cd-number')).toBe('#00ff00');
    expect(root.style.getPropertyValue('--cd-label-color')).toBe('');
    expect(root.style.getPropertyValue('--cd-muted')).toBe('#ff0000');
  });

  it('aplica a pilha de fontes escolhida no elemento raiz', () => {
    const { container } = renderWidget({ font: 'playfair' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.fontFamily).toContain('--font-playfair');
    expect(root).toHaveAttribute('data-title-font', 'playfair');
    expect(root.style.getPropertyValue('--cd-title-font')).toBe('');
  });

  it('dá ao título uma fonte própria quando ela diverge do resto', () => {
    const { container } = renderWidget({ font: 'playfair', titleFont: 'greatvibes' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root.style.getPropertyValue('--cd-title-font')).toContain('--font-great-vibes');
    expect(root.style.fontFamily).toContain('--font-playfair');
    expect(root).toHaveAttribute('data-title-font', 'greatvibes');
  });

  it('marca o tema escolhido no elemento raiz', () => {
    const { container } = renderWidget({ theme: 'dark' });
    expect(container.querySelector('.cd-root')).toHaveAttribute('data-theme', 'dark');
  });

  it('pinta o tema neutro com tons que leem no claro e no escuro', () => {
    const { container } = renderWidget({ theme: 'neutral' });
    const root = container.querySelector('.cd-root') as HTMLElement;

    expect(root).toHaveAttribute('data-theme', 'neutral');
    // Inline, e não pela media query: o neutro não depende do sistema de ninguém.
    expect(isDualToneSafe(root.style.getPropertyValue('--cd-fg'))).toBe(true);
    expect(isDualToneSafe(root.style.getPropertyValue('--cd-muted'))).toBe(true);
  });
});
