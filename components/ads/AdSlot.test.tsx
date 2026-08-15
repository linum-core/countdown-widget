import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdSlot } from './AdSlot';

const SLOT = '1234567890';

function renderSlot() {
  return render(<AdSlot slot={SLOT} format="auto" responsive label="Anúncio" />);
}

beforeEach(() => {
  window.adsbygoogle = [];
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  delete window.adsbygoogle;
  vi.resetModules();
});

describe('AdSlot', () => {
  it('não renderiza nada sem o ID do publisher', () => {
    const { container } = renderSlot();
    expect(container).toBeEmptyDOMElement();
  });

  it('não renderiza nada quando o slot não foi configurado', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    const { container } = render(<AdSlot slot={undefined} format="auto" label="Anúncio" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza o <ins> com os atributos do AdSense', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';

    renderSlot();

    const ins = screen.getByLabelText('Anúncio');
    expect(ins).toHaveClass('adsbygoogle');
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-1234567890123456');
    expect(ins).toHaveAttribute('data-ad-slot', SLOT);
    expect(ins).toHaveAttribute('data-ad-format', 'auto');
    expect(ins).toHaveAttribute('data-full-width-responsive', 'true');
  });

  it('empurra a unidade para a fila do AdSense uma única vez', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';

    const { rerender } = renderSlot();
    rerender(<AdSlot slot={SLOT} format="auto" responsive label="Anúncio" />);

    expect(window.adsbygoogle).toHaveLength(1);
  });
});
