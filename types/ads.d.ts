/*
  Globais criados pelo script do AdSense e pelo Consent Mode. O arquivo não tem
  import nem export de propósito: assim vale como augmentação global.
*/

/** Fila do AdSense: cada `push` pede o preenchimento de um `<ins>` já no DOM. */
interface AdsByGoogleQueue extends Array<Record<string, unknown>> {
  /** `1` força anúncios não-personalizados — usado quando o visitante recusa. */
  requestNonPersonalizedAds?: number;
}

interface Window {
  adsbygoogle?: AdsByGoogleQueue;
  dataLayer?: unknown[];
  /** Marca que o `consent default` do Consent Mode v2 já foi enfileirado. */
  __cwConsentDefaults?: boolean;
}
