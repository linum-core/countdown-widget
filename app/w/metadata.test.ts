import { describe, expect, it } from 'vitest';
import { GET } from './manifest/route';
import { generateMetadata } from './page';

const WEDDING = {
  target: '2027-07-18T15:00:00',
  tz: 'America/Sao_Paulo',
  title: 'Casamento Marcela e Gabriel',
  layout: 'cards',
};

const metadataFor = (params: Record<string, string>) =>
  generateMetadata({ searchParams: Promise.resolve(params) });

const manifestFor = (params: Record<string, string>) =>
  GET(new Request(`https://exemplo.com/w/manifest?${new URLSearchParams(params)}`)).json();

describe('generateMetadata do widget', () => {
  it('usa o título da URL, sem o sufixo do template do site', async () => {
    const metadata = await metadataFor(WEDDING);
    expect(metadata.title).toEqual({ absolute: 'Casamento Marcela e Gabriel' });
  });

  it('nomeia a contagem sem título de forma genérica', async () => {
    const metadata = await metadataFor({});
    expect(metadata.title).toEqual({ absolute: 'Contagem regressiva' });
  });

  it('aponta o manifest para a rota do widget preservando a configuração', async () => {
    const metadata = await metadataFor(WEDDING);
    // Herdar o manifest da raiz faria o atalho abrir a homepage do gerador.
    expect(metadata.manifest).toContain('/w/manifest?');
    expect(metadata.manifest).toContain('layout=cards');
  });

  it('declara o app de tela cheia do iOS', async () => {
    const metadata = await metadataFor(WEDDING);
    expect(metadata.appleWebApp).toMatchObject({
      capable: true,
      title: 'Casamento Marcela e Gabriel',
    });
  });

  it('mantém a página do widget fora dos buscadores', async () => {
    const metadata = await metadataFor(WEDDING);
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe('manifest do widget', () => {
  it('volta para a contagem configurada, não para a raiz', async () => {
    const manifest = await manifestFor(WEDDING);
    expect(manifest.start_url).toContain('/w?');
    expect(manifest.start_url).toContain('target=2027-07-18T15%3A00%3A00');
    expect(manifest.display).toBe('standalone');
    expect(manifest.name).toBe('Casamento Marcela e Gabriel');
  });

  it('encurta o rótulo do ícone, que a tela de início cortaria', async () => {
    const manifest = await manifestFor(WEDDING);
    expect(manifest.short_name).toBe('Casamento');
  });

  it('mantém títulos curtos inteiros', async () => {
    const manifest = await manifestFor({ ...WEDDING, title: 'Ano novo' });
    expect(manifest.short_name).toBe('Ano novo');
  });

  it('ignora parâmetros inválidos em vez de propagá-los', async () => {
    const manifest = await manifestFor({ ...WEDDING, layout: 'inexistente' });
    expect(manifest.start_url).not.toContain('inexistente');
  });

  it('deixa a splash sem cor quando o fundo é transparente', async () => {
    const manifest = await manifestFor(WEDDING);
    expect(manifest.background_color).toBeUndefined();
  });

  it('usa o fundo sólido como cor da splash', async () => {
    const manifest = await manifestFor({ ...WEDDING, bg: '#111111' });
    expect(manifest.background_color).toBe('#111111');
  });
});
