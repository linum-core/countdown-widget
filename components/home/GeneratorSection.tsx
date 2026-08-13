import { GeneratorForm } from '@/components/generator/GeneratorForm';
import { configToDraft } from '@/lib/config/draft';
import { hasAnyParam, parseConfig, type RawSearchParams } from '@/lib/config/parse';

interface GeneratorSectionProps {
  searchParams: Promise<RawSearchParams>;
  siteUrl: string;
}

/**
 * O único pedaço dinâmico da homepage.
 *
 * A leitura de `searchParams` fica aqui dentro, e não na página, de propósito:
 * quem espera pela query string vira rota dinâmica, e numa rota dinâmica o Next
 * transmite a metadata depois do shell — as tags acabam dentro do `<body>` em
 * vez do `<head>`. Isolado atrás de um `Suspense`, o casco da página continua
 * estático, a metadata sai no `<head>` para qualquer robô, e só este bloco
 * espera.
 */
export async function GeneratorSection({ searchParams, siteUrl }: GeneratorSectionProps) {
  const params = await searchParams;

  /*
    A raiz é também o link de edição: com configuração na URL, o formulário abre
    preenchido e quem recebeu o link continua de onde o outro parou. Sem nada na
    URL fica `null`, e o rascunho de demonstração nasce no cliente — só lá existe
    a timezone de quem está montando a contagem.
  */
  const initialDraft = hasAnyParam(params) ? configToDraft(parseConfig(params)) : null;

  return <GeneratorForm siteUrl={siteUrl} initialDraft={initialDraft} />;
}
