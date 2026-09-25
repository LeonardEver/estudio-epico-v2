/**
 * Cakto browser SDK singleton — tokenização, antifraude (Nethone) e 3DS.
 * Docs: https://docs.cakto.com.br/sdk/visao-geral
 *
 * O SDK roda SOMENTE no browser (nunca em SSR/Node). Os dados do cartão são
 * trocados por um token de uso único no próprio navegador — o backend nunca
 * vê número, CVV ou validade.
 *
 * client_id é exposto de propósito (VITE_CAKTO_SDK_CLIENT_ID): é o formato
 * documentado de inicialização; o client_secret permanece só no servidor.
 */

export type CaktoCardInput = {
  holderName: string;
  cardNumber: string; // somente dígitos
  cvv: string;
  expMonth: string; // "MM"
  expYear: string; // "AA" ou "AAAA"
};

export type CaktoSdk = {
  initAntifraud(): Promise<void>;
  completeAntifraudProfile(): Promise<void>;
  getAntifraudReference(): string;
  createToken(card: CaktoCardInput): Promise<{ cardToken: string }>;
  cleanupAntifraud(): void;
};

declare global {
  interface Window {
    Cakto?: {
      CaktoSDK: new (options: { client_id: string }) => CaktoSdk;
    };
  }
}

const SDK_URL = "https://cakto-sdk.pages.dev/cakto-sdk.min.js";

export const SDK_LOAD_ERROR_MESSAGE =
  "Não foi possível carregar o pagamento seguro. Recarregue a página e tente novamente.";

let sdkPromise: Promise<CaktoSdk> | undefined;

/** Carrega o script e retorna uma instância única por página. */
export function loadCaktoSdk(): Promise<CaktoSdk> {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      if (!window.Cakto?.CaktoSDK) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = SDK_URL;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(SDK_LOAD_ERROR_MESSAGE));
          document.head.appendChild(script);
        });
      }
      const clientId = (import.meta.env["VITE_CAKTO_SDK_CLIENT_ID"] as string | undefined)?.trim();
      if (!clientId) {
        throw new Error("Pagamento por cartão ainda não está configurado.");
      }
      const Ctor = window.Cakto?.CaktoSDK;
      if (!Ctor) throw new Error(SDK_LOAD_ERROR_MESSAGE);
      return new Ctor({ client_id: clientId });
    })().catch((error) => {
      sdkPromise = undefined; // permite tentar de novo após falha
      throw error;
    });
  }
  return sdkPromise;
}
