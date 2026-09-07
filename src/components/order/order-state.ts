import type { Extra, OrderFormValues } from "@/lib/brief";

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
};

export const PRICE_MUSICA = 79.9;
export const PRICE_CAPA = 19.9;
export const PRICE_PAGINA = 59.9;
export const PRICE_BUNDLE = 479;

export function orderTotal(bundle: boolean, extras: Extra[]): number {
  if (bundle) return PRICE_BUNDLE;
  let total = PRICE_MUSICA;
  if (extras.includes("COVER")) total += PRICE_CAPA;
  if (extras.includes("EXCLUSIVE_PAGE")) total += PRICE_PAGINA;
  return total;
}

/** "R$ 159,70" -> "R$159,70" (padrão do produto). */
export function formatBRL(value: number): string {
  return `R$${value.toFixed(2).replace(".", ",")}`;
}
