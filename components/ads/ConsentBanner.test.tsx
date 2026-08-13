import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConsentProvider, CONSENT_STORAGE_KEY } from './consent';
import { ConsentBanner } from './ConsentBanner';

function renderBanner() {
  return render(
    <ConsentProvider>
      <ConsentBanner />
    </ConsentProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
});

describe('ConsentBanner', () => {
  it('não aparece quando não há anúncios configurados', () => {
    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });

  describe('com o publisher configurado', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-1234567890123456';
    });

    it('aparece enquanto não houver decisão', () => {
      renderBanner();
      expect(screen.getByRole('dialog', { name: 'Preferências de cookies' })).toBeInTheDocument();
    });

    it('não aparece se a decisão já estiver guardada', () => {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
      const { container } = renderBanner();
      expect(container).toBeEmptyDOMElement();
    });

    it('guarda "granted" e some ao aceitar', async () => {
      const user = userEvent.setup();
      renderBanner();

      await user.click(screen.getByRole('button', { name: 'Aceitar' }));

      expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('guarda "denied" e some ao recusar', async () => {
      const user = userEvent.setup();
      renderBanner();

      await user.click(screen.getByRole('button', { name: 'Só o essencial' }));

      expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
