import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site';
import { FAQ } from './faq-content';

interface StructuredDataProps {
  siteUrl: string;
}

/**
 * Dados estruturados em JSON-LD.
 *
 * Um `@graph` único em vez de três blocos soltos: assim `WebSite`, `WebPage` e
 * `SoftwareApplication` se referenciam por `@id`, e o buscador entende que são
 * facetas da mesma coisa em vez de três entidades sem relação.
 *
 * `FAQPage` deriva da mesma constante que a seção visível renderiza — a
 * marcação precisa descrever o que está na página, e conteúdo estruturado que
 * não aparece para o leitor é motivo de penalização.
 */
export function StructuredData({ siteUrl }: StructuredDataProps) {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: siteUrl,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        isPartOf: { '@id': `${siteUrl}/#website` },
        inLanguage: 'pt-BR',
        primaryTopic: { '@id': `${siteUrl}/#app` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#app`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        applicationCategory: 'UtilitiesApplication',
        // Roda em qualquer navegador; não há binário a instalar.
        operatingSystem: 'Web',
        browserRequirements: 'Requer JavaScript',
        inLanguage: 'pt-BR',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'BRL',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          'Contagem regressiva configurável por URL',
          'Embed no Notion com fundo transparente',
          'Meses de calendário, dias, horas, minutos e segundos',
          'Quatro layouts e temas claro, escuro, automático e neutro',
          'Instalação na tela de início do iPhone e no Dock do macOS',
        ],
        isAccessibleForFree: true,
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        isPartOf: { '@id': `${siteUrl}/#webpage` },
        mainEntity: FAQ.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // O conteúdo é constante e não vem de entrada de usuário; ainda assim, `<`
      // é escapado porque um `</script>` dentro da string encerraria a tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  );
}
