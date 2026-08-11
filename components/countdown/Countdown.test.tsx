import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
      units: { days: false, hours: true, minutes: true, seconds: true },
    });

    expect(screen.getByText('51')).toBeInTheDocument();
    expect(screen.queryByText('Dias')).not.toBeInTheDocument();
  });

  it('usa os rótulos vindos da configuração', () => {
    renderWidget({ labels: { days: 'Days', hours: 'Hrs', minutes: 'Min', seconds: 'Sec' } });

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

  it('marca o tema escolhido no elemento raiz', () => {
    const { container } = renderWidget({ theme: 'dark' });
    expect(container.querySelector('.cd-root')).toHaveAttribute('data-theme', 'dark');
  });
});
