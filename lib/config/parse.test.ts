import { describe, expect, it } from 'vitest';
import { hasAnyParam, parseConfig } from './parse';
import { DEFAULT_CONFIG } from './schema';

const parse = (query: string) => parseConfig(new URLSearchParams(query));

describe('hasAnyParam', () => {
  const has = (query: string) => hasAnyParam(new URLSearchParams(query));

  it('reconhece um parâmetro pelo nome canônico e pelo alias curto', () => {
    expect(has('target=2027-05-15T16:00:00')).toBe(true);
    expect(has('t=2027-05-15T16:00:00')).toBe(true);
    expect(has('bg=%23111111')).toBe(true);
  });

  it('ignora parâmetro que não é do widget', () => {
    expect(has('utm_source=twitter&ref=email')).toBe(false);
  });

  it('trata URL vazia como primeira visita', () => {
    expect(has('')).toBe(false);
  });

  it('lê também o formato de searchParams do Next', () => {
    expect(hasAnyParam({ layout: 'cards' })).toBe(true);
    expect(hasAnyParam({})).toBe(false);
  });
});

describe('parseConfig', () => {
  it('devolve os defaults para uma URL vazia', () => {
    expect(parse('')).toEqual(DEFAULT_CONFIG);
  });

  it('lê o alvo com timezone', () => {
    const config = parse('target=2027-05-15T16:00:00&timezone=America/Sao_Paulo');
    expect(config.timezone).toBe('America/Sao_Paulo');
    expect(new Date(config.targetMs!).toISOString()).toBe('2027-05-15T19:00:00.000Z');
  });

  it('devolve targetMs null quando o alvo é inválido ou ausente', () => {
    expect(parse('').targetMs).toBeNull();
    expect(parse('target=lixo').targetMs).toBeNull();
  });

  it('descarta timezone inválida sem quebrar o parse', () => {
    const config = parse('target=2027-05-15T16:00:00&timezone=Marte/Olimpo');
    expect(config.timezone).toBeNull();
    expect(config.targetMs).not.toBeNull();
  });

  it('aceita todos os enums e cai no default para valores desconhecidos', () => {
    expect(parse('layout=cards').layout).toBe('cards');
    expect(parse('layout=CARDS').layout).toBe('cards');
    expect(parse('layout=espiral').layout).toBe(DEFAULT_CONFIG.layout);

    expect(parse('theme=dark').theme).toBe('dark');
    expect(parse('theme=neutral').theme).toBe('neutral');
    expect(parse('size=large').size).toBe('large');
    expect(parse('font=poppins').font).toBe('poppins');
    expect(parse('font=playfair').font).toBe('playfair');
    expect(parse('skin=neon').skin).toBe('neon');
    expect(parse('animation=flip').animation).toBe('flip');
  });

  it('lê a fonte do título só quando informada', () => {
    expect(parse('').titleFont).toBeNull();
    expect(parse('titleFont=greatvibes').titleFont).toBe('greatvibes');
    expect(parse('tf=playfair').titleFont).toBe('playfair');
    expect(parse('titleFont=comic').titleFont).toBeNull();
  });

  it('normaliza a cor principal', () => {
    expect(parse('color=ffffff').color).toBe('#ffffff');
    expect(parse('color=%23FFF').color).toBe('#ffffff');
    expect(parse('color=nope').color).toBeNull();
  });

  it('normaliza as cores por papel de forma independente', () => {
    const config = parse('numberColor=111111&titleColor=%23FFF&labelColor=6b6b6b');
    expect(config.numberColor).toBe('#111111');
    expect(config.titleColor).toBe('#ffffff');
    expect(config.labelColor).toBe('#6b6b6b');
    expect(config.color).toBeNull();
  });

  it('aceita os aliases curtos das cores por papel e descarta hex inválido', () => {
    expect(parse('nc=000000').numberColor).toBe('#000000');
    expect(parse('tc=000000').titleColor).toBe('#000000');
    expect(parse('lc=000000').labelColor).toBe('#000000');
    expect(parse('nc=lixo').numberColor).toBeNull();
  });

  it('trata o fundo transparente como default e valida hex', () => {
    expect(parse('').background).toBe('transparent');
    expect(parse('background=transparent').background).toBe('transparent');
    expect(parse('background=111111').background).toBe('#111111');
    expect(parse('background=lixo').background).toBe('transparent');
  });

  it('limita o raio ao intervalo permitido', () => {
    expect(parse('radius=20').radius).toBe(20);
    expect(parse('radius=-10').radius).toBe(0);
    expect(parse('radius=999').radius).toBe(48);
    expect(parse('radius=abc').radius).toBe(DEFAULT_CONFIG.radius);
  });

  it('lê os flags de unidade em várias grafias', () => {
    expect(parse('seconds=false').units.seconds).toBe(false);
    expect(parse('seconds=0').units.seconds).toBe(false);
    expect(parse('days=nao').units.days).toBe(false);
    expect(parse('days=talvez').units.days).toBe(true);
  });

  it('aceita rótulos customizados e seus aliases curtos', () => {
    expect(parse('labelDays=Days').labels.days).toBe('Days');
    expect(parse('ld=Days').labels.days).toBe('Days');
    expect(parse('lh=Hours&lm=Min&ls=Sec').labels).toMatchObject({
      hours: 'Hours',
      minutes: 'Min',
      seconds: 'Sec',
    });
  });

  it('aceita texto de encerramento customizado', () => {
    expect(parse('endedText=Chegou!').endedText).toBe('Chegou!');
    expect(parse('ended=Chegou!').endedText).toBe('Chegou!');
    expect(parse('').endedText).toBe(DEFAULT_CONFIG.endedText);
  });

  it('trunca textos muito longos', () => {
    const long = 'a'.repeat(500);
    expect(parse(`title=${long}`).title).toHaveLength(120);
  });

  it('aceita aliases dos parâmetros principais', () => {
    expect(parse('t=2027-05-15&tz=UTC').targetMs).not.toBeNull();
    expect(parse('sub=Oi').subtitle).toBe('Oi');
    expect(parse('bg=111111').background).toBe('#111111');
    expect(parse('anim=fade').animation).toBe('fade');
  });

  it('aceita searchParams no formato de objeto do Next', () => {
    const config = parseConfig({ layout: 'cards', title: ['Primeiro', 'Segundo'] });
    expect(config.layout).toBe('cards');
    expect(config.title).toBe('Primeiro');
  });

  it('nunca lança, mesmo com entradas hostis', () => {
    expect(() => parse('target=%%%&radius=NaN&color=&theme=')).not.toThrow();
  });
});
