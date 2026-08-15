/*
  Globais criados pelo script do AdSense e pela CMP do Google. O arquivo não tem
  import nem export de propósito: assim vale como augmentação global.
*/

/** Fila do AdSense: cada `push` pede o preenchimento de um `<ins>` já no DOM. */
type AdsByGoogleQueue = Array<Record<string, unknown>>;

interface Window {
  adsbygoogle?: AdsByGoogleQueue;
  /**
   * CMP do Google (Funding Choices), instalada pelo `adsbygoogle.js` apenas onde
   * a mensagem de consentimento se aplica.
   */
  googlefc?: {
    /** Reabre a mensagem para o visitante trocar a decisão já registrada. */
    showRevocationMessage?: () => void;
  };
}
