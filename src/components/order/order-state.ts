import type { Extra, OrderFormValues } from "@/lib/brief";
import {
  BUNDLE_PRICE_VALUE,
  BUMP_PRICE_VALUE,
  EXCLUSIVE_PAGE_PRICE_VALUE,
  PRICE_VALUE,
} from "@/components/landing/offer";

export type Step = "MUSICA" | "EXTRAS" | "PAGAMENTO";

export const STEPS: { id: Step; n: string; label: string }[] = [
  { id: "MUSICA", n: "01", label: "Música" },
  { id: "EXTRAS", n: "02", label: "Extras" },
  { id: "PAGAMENTO", n: "03", label: "Pagamento" },
];

export const INITIAL_ORDER: OrderFormValues = {
  name: "",
  email: "",
  whatsapp: "",
  /** CPF do titular (mascarado na UI, só dígitos na cobrança). */
  cpf: "",
  lyricsPreference: "CREATE_LYRICS",
  lyrics: "",
  description: "",
  genre: "Sertanejo",
  genreOther: "",
  mood: [],
  recipient: "",
  occasion: "",
  references: "",
  extras: [],
  bundle: false,
  paymentMethod: "PIX",
  /** Código de cupom digitado (a validade é decidida no servidor). */
  coupon: "",
};

// Preços vêm da tabela única da oferta — nunca duplicar um número aqui.
export const PRICE_MUSICA = PRICE_VALUE;
export const PRICE_CAPA = BUMP_PRICE_VALUE;
export const PRICE_PAGINA = EXCLUSIVE_PAGE_PRICE_VALUE;
export const PRICE_BUNDLE = BUNDLE_PRICE_VALUE;

export { formatBRL } from "@/lib/format";

export function orderTotal(bundle: boolean, extras: Extra[]): number {
  if (bundle) return PRICE_BUNDLE;
  let total = PRICE_MUSICA;
  if (extras.includes("COVER")) total += PRICE_CAPA;
  if (extras.includes("EXCLUSIVE_PAGE")) total += PRICE_PAGINA;
  return total;
}
