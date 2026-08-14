import type { NextConfig } from 'next';

/**
 * O widget é servido dentro de um iframe do Notion, então nenhum dos dois
 * cabeçalhos de enquadramento é enviado — nem `X-Frame-Options`, nem
 * `frame-ancestors` no CSP. É de propósito.
 *
 * O `frame-ancestors` já esteve aqui, terminando em `*`, e mesmo assim quebrava
 * o app do Notion no iPhone: `*` numa source-list de CSP casa só com esquemas de
 * rede (http/https/ws/wss), nunca com a origem `null` que um WKWebView ou um
 * iframe com `sandbox` apresenta. O bloco ficava vazio antes de renderizar
 * qualquer coisa, enquanto a mesma URL abria normalmente no Safari do mesmo
 * aparelho. Não existe source-list capaz de nomear essa origem — a única forma
 * de permitir é não mandar a diretiva.
 *
 * O custo é nulo: `/w` é público, somente leitura, sem autenticação, sem cookie
 * e sem ação destrutiva. Não há o que sequestrar com clickjacking; o pior caso é
 * alguém exibir uma contagem regressiva alheia, que é o uso pretendido.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  /*
   * A raiz lê `searchParams` — é o link de edição — e por isso é rota
   * dinâmica. Em rota dinâmica o Next transmite a metadata depois do shell, e
   * as tags acabam dentro do `<body>`: o Google as encontra, porque executa
   * JavaScript, mas só na segunda passada, e todo auditor de SEO relata
   * "sem meta description".
   *
   * `htmlLimitedBots` é a lista de agentes que recebem a metadata bloqueante,
   * no `<head>`. Casar com qualquer agente desliga o streaming para todo mundo.
   * O custo é nulo aqui: a metadata deste site é um objeto constante, sem
   * `await` nenhum, então não há espera a bloquear.
   */
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      {
        source: '/w',
        headers: [
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
