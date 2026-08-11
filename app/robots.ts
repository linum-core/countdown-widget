import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // A rota do widget é uma superfície de embed: indexá-la só geraria
      // resultados de busca com contagens fora de contexto.
      disallow: '/w',
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
