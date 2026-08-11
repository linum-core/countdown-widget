import type { NextConfig } from 'next';

/**
 * O widget é servido dentro de um iframe do Notion, portanto:
 * - `X-Frame-Options` nunca pode ser enviado (bloquearia o embed);
 * - o controle de enquadramento é feito por `frame-ancestors` no CSP.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/w',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.notion.so https://*.notion.site *",
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
