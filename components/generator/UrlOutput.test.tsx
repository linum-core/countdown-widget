import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '@/lib/config/schema';
import type { WidgetConfig } from '@/types/widget';
import { UrlOutput } from './UrlOutput';

const URL_WIDGET = 'https://exemplo.com/w?layout=cards';
const EMBED_CODE = '<iframe src="https://exemplo.com/w?layout=cards"></iframe>';
const URL_EDICAO = 'https://exemplo.com/?layout=cards';

function renderOutput(
  overrides: Partial<WidgetConfig> = {},
  onPinDarkColors = vi.fn(),
  onFixContrast = vi.fn(),
) {
  const config: WidgetConfig = { ...DEFAULT_CONFIG, title: 'Casamento', ...overrides };
  render(
    <UrlOutput
      url={URL_WIDGET}
      embedCode={EMBED_CODE}
      editUrl={URL_EDICAO}
      config={config}
      onPinDarkColors={onPinDarkColors}
      onFixContrast={onFixContrast}
    />,
  );
  return { onPinDarkColors, onFixContrast };
}

const AJUSTAR = 'Ajustar cores para claro e escuro';

describe('UrlOutput', () => {
  it('abre no Notion mostrando a URL, nunca o código', () => {
    renderOutput();

    expect(screen.getByText(URL_WIDGET)).toBeInTheDocument();
    expect(screen.queryByText(EMBED_CODE)).not.toBeInTheDocument();
  });

  it('só entrega o iframe na aba de outros sites', async () => {
    renderOutput();

    await userEvent.click(screen.getByRole('tab', { name: 'Outros sites' }));

    expect(screen.getByText(EMBED_CODE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Baixar .html' })).toBeInTheDocument();
  });

  it('mantém a URL na aba de iPhone e Mac, que instala e não embute', async () => {
    renderOutput();

    await userEvent.click(screen.getByRole('tab', { name: 'iPhone e Mac' }));

    expect(screen.getByText(URL_WIDGET)).toBeInTheDocument();
    expect(screen.queryByText(EMBED_CODE)).not.toBeInTheDocument();
  });

  it('avisa que o tema automático pode sumir dentro do Notion', () => {
    renderOutput({ theme: 'auto' });
    expect(screen.getByRole('button', { name: 'Fixar cores escuras' })).toBeInTheDocument();
  });

  it('cala o aviso quando já existe cor fixa', () => {
    renderOutput({ theme: 'auto', numberColor: '#111111' });
    expect(screen.queryByRole('button', { name: 'Fixar cores escuras' })).not.toBeInTheDocument();
  });

  it('cala o aviso quando o tema não é automático', () => {
    renderOutput({ theme: 'light' });
    expect(screen.queryByRole('button', { name: 'Fixar cores escuras' })).not.toBeInTheDocument();
  });

  it('não repete o aviso nas abas onde o tema segue o próprio aparelho', async () => {
    renderOutput({ theme: 'auto' });

    await userEvent.click(screen.getByRole('tab', { name: 'iPhone e Mac' }));

    expect(screen.queryByRole('button', { name: 'Fixar cores escuras' })).not.toBeInTheDocument();
  });

  it('oferece o link de edição fora das abas, em qualquer uma delas', async () => {
    renderOutput();

    expect(screen.getByText(URL_EDICAO)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Outros sites' }));
    // Publicar e retomar a edição são coisas diferentes: o link não muda de aba.
    expect(screen.getByText(URL_EDICAO)).toBeInTheDocument();
  });

  it('delega a correção de contraste ao formulário', async () => {
    const { onPinDarkColors } = renderOutput({ theme: 'auto' });

    await userEvent.click(screen.getByRole('button', { name: 'Fixar cores escuras' }));

    expect(onPinDarkColors).toHaveBeenCalledOnce();
  });

  it('avisa quando a cor fixa só serve a um dos fundos', () => {
    renderOutput({ theme: 'dark', numberColor: '#852323' });
    expect(screen.getByRole('button', { name: AJUSTAR })).toBeInTheDocument();
  });

  it('cala o aviso quando toda cor fixa lê nos dois', () => {
    renderOutput({ theme: 'neutral', numberColor: '#469155' });
    expect(screen.queryByRole('button', { name: AJUSTAR })).not.toBeInTheDocument();
  });

  it('cala o aviso com fundo sólido, onde o host não aparece', () => {
    renderOutput({ theme: 'dark', numberColor: '#852323', background: '#191919' });
    expect(screen.queryByRole('button', { name: AJUSTAR })).not.toBeInTheDocument();
  });

  it('não repete o aviso de contraste fora da aba do Notion', async () => {
    renderOutput({ theme: 'dark', numberColor: '#852323' });

    await userEvent.click(screen.getByRole('tab', { name: 'iPhone e Mac' }));

    expect(screen.queryByRole('button', { name: AJUSTAR })).not.toBeInTheDocument();
  });

  it('delega o ajuste de cores ao formulário', async () => {
    const { onFixContrast } = renderOutput({ theme: 'dark', numberColor: '#852323' });

    await userEvent.click(screen.getByRole('button', { name: AJUSTAR }));

    expect(onFixContrast).toHaveBeenCalledOnce();
  });
});
