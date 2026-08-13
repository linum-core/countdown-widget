import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsentProvider, CONSENT_STORAGE_KEY } from './consent';
import { AdSlot } from './AdSlot';

const SLOT = '1234567890';

function renderSlot() {
  return render(
    <ConsentProvider>
      <AdSlot slot={SLOT} format="auto" responsive label="Anúncio" />
    </ConsentProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
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

  it('não renderiza nada enquanto o consentimento é desconhecido', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    const { container } = renderSlot();
    expect(container).toBeEmptyDOMElement();
  });

  it('não renderiza nada quando o slot não foi configurado', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
    const { container } = render(
      <ConsentProvider>
        <AdSlot slot={undefined} format="auto" label="Anúncio" />
      </ConsentProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza o <ins> com os atributos do AdSense após o consentimento', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');

    renderSlot();

    const ins = screen.getByLabelText('Anúncio');
    expect(ins).toHaveClass('adsbygoogle');
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-1234567890123456');
    expect(ins).toHaveAttribute('data-ad-slot', SLOT);
    expect(ins).toHaveAttribute('data-ad-format', 'auto');
    expect(ins).toHaveAttribute('data-full-width-responsive', 'true');
  });

  it('renderiza mesmo com o consentimento recusado — sem cookies de perfil', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');

    renderSlot();

    expect(screen.getByLabelText('Anúncio')).toBeInTheDocument();
  });

  it('empurra a unidade para a fila do AdSense uma única vez', () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');

    const { rerender } = renderSlot();
    rerender(
      <ConsentProvider>
        <AdSlot slot={SLOT} format="auto" responsive label="Anúncio" />
      </ConsentProvider>,
    );

    expect(window.adsbygoogle).toHaveLength(1);
  });
});
