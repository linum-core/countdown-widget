import { afterEach, describe, expect, it, vi } from 'vitest';

/*
  `process.env.NEXT_PUBLIC_*` é substituído no build do Next, mas sob o Vitest o
  módulo lê o objeto de verdade — então dá para reimportá-lo com valores
  diferentes usando `vi.resetModules()`.
*/
async function loadWithClient(value: string | undefined) {
  vi.resetModules();
  if (value === undefined) {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  } else {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = value;
  }
  const { getAdsenseClient } = await import('./ads');
  return getAdsenseClient();
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  vi.resetModules();
});

describe('getAdsenseClient', () => {
  it('aceita um ID de publisher válido', async () => {
    expect(await loadWithClient('ca-pub-1234567890123456')).toBe('ca-pub-1234567890123456');
  });

  it('ignora espaços em volta do ID', async () => {
    expect(await loadWithClient('  ca-pub-42  ')).toBe('ca-pub-42');
  });

  it('devolve null quando a variável não está definida', async () => {
    expect(await loadWithClient(undefined)).toBeNull();
  });

  it('devolve null para string vazia', async () => {
    expect(await loadWithClient('   ')).toBeNull();
  });

  it('devolve null para um valor malformado', async () => {
    expect(await loadWithClient('pub-1234')).toBeNull();
    expect(await loadWithClient('ca-pub-')).toBeNull();
    expect(await loadWithClient('ca-pub-abc')).toBeNull();
  });
});
