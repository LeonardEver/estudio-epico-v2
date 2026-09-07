/**
 * Order creation: persist the briefing to Google Sheets and build the Kiwify
 * checkout URL. If anything fails here the client MUST NOT be redirected to
 * payment — the error is thrown and the checkout never happens.
 */
import { buildKiwifyCheckoutUrl, type CheckoutInput } from "./kiwify";
import { appendOrderRow, readOrderRows } from "./google-sheets";
import { generateOrderId } from "./order-id";
import { missingOrderEnvVars } from "./env";

/** Safe message shown to the customer — never leak internals. */
export const ORDER_CREATION_ERROR_MESSAGE =
  "Não conseguimos preparar seu pedido agora. Tente novamente.";

export type CreateOrderInput = {
  name: string;
  email: string;
  whatsapp: string;
  lyricsPreference: "HAS_LYRICS" | "CREATE_LYRICS";
  lyrics: string;
  description: string;
  genre: string;
  genreOther: string;
  mood: string[];
  /** Para quem é a música (ex.: "Alice"). */
  recipient: string | undefined;
  /** Qual é a ocasião (ex.: "Aniversário"). */
  occasion: string | undefined;
  /** Referências / observações opcionais. */
  references: string | undefined;
  /** Extras selecionados na página de pedido. */
  extras: string[] | undefined;
  /** Pacote completo selecionado. */
  bundle: boolean | undefined;
  /** Método de pagamento escolhido (PIX ou cartão). */
  paymentMethod: string | undefined;
  utm?: Record<string, string>;
};

export type CreateOrderResult = {
  orderId: string;
  checkoutUrl: string;
};

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  // Only block on what THIS step needs. Resend/webhook vars are checked by
  // their own flows (after payment) — they must never block a briefing.
  const missing = missingOrderEnvVars();
  if (missing.length > 0) {
    console.error(`[orders] Order creation blocked — missing env vars: ${missing.join(", ")}`);
    throw new Error(ORDER_CREATION_ERROR_MESSAGE);
  }

  let orderId: string;
  try {
    // Read first so we can both avoid duplicate order IDs and skip an append
    // if this exact order was already persisted.
    const existing = await readOrderRows();
    const duplicate = existing.find(
      (row) =>
        row.orderId &&
        row.values[3] === input.email && // col D = email
        row.values[7] === input.description, // col H = description
    );
    if (duplicate) {
      // Same email + same brief: a retry of the same submission — reuse the
      // order instead of creating a duplicate row.
      orderId = duplicate.orderId;
    } else {
      orderId = generateOrderId();
      while (existing.some((row) => row.orderId === orderId)) orderId = generateOrderId();
      await appendOrderRow([
        orderId,
        new Date().toISOString(),
        input.name,
        input.email,
        input.whatsapp,
        input.lyricsPreference === "HAS_LYRICS"
          ? "Eu já tenho a letra"
          : "Quero que vocês criem a letra",
        input.lyrics,
        input.description,
        input.genre,
        input.genreOther,
        input.mood.join(" · "),
        "AWAITING_PAYMENT",
        "", // kiwify_transaction_id
        "", // paid_at
        "PENDING",
        "", // download_url
        "", // notification_status
        input.recipient ?? "",
        input.occasion ?? "",
        input.references ?? "",
        (input.extras ?? []).join(" · "),
        input.bundle ? "SIM" : "NÃO",
        input.paymentMethod ?? "",
      ]);
    }
  } catch (error) {
    console.error("[orders] Failed to persist order to Google Sheets:", error);
    throw new Error(ORDER_CREATION_ERROR_MESSAGE);
  }

  try {
    const checkoutUrl = buildKiwifyCheckoutUrl({
      orderId,
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp || undefined,
      utm: input.utm,
    } satisfies CheckoutInput);
    return { orderId, checkoutUrl };
  } catch (error) {
    console.error("[orders] Failed to build Kiwify checkout URL:", error);
    throw new Error(ORDER_CREATION_ERROR_MESSAGE);
  }
}
