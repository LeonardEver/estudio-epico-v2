/**
 * Order book: persist the briefing to Google Sheets and manage payment status
 * transitions. Charging itself lives in ./cakto — if anything fails before a
 * charge is created the client MUST NOT be sent to payment.
 */
import { appendOrderRow, readOrderRows, updateOrderRow, type OrderRow } from "./google-sheets";
import { generateOrderId } from "./order-id";
import { env, missingOrderEnvVars } from "./env";
import { sendOwnerOrderEmail, type OrderForEmail } from "./email";

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
        "", // cakto_transaction_id (payment id)
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

  return { orderId };
}

// ---------------------------------------------------------------------------
// Payment status transitions (shared by card charge response and webhook)
// ---------------------------------------------------------------------------

function rowToEmailOrder(row: OrderRow, txId: string | undefined): OrderForEmail {
  const [
    orderId = "",
    createdAt = "",
    name = "",
    email = "",
    whatsapp = "",
    lyricsPreference = "",
    lyrics = "",
    description = "",
    genre = "",
    genreOther = "",
    mood = "",
  ] = row.values;
  return {
    orderId,
    createdAt,
    name,
    email,
    whatsapp,
    lyricsPreference,
    lyrics,
    description,
    genre,
    genreOther,
    mood: mood ? mood.split(" · ") : [],
    txId,
  };
}

/** Writes the Cakto payment id to col M — the webhook correlation key. */
export async function persistTransactionId(orderId: string, transactionId: string): Promise<void> {
  const rows = await readOrderRows();
  const row = rows.find((r) => r.orderId === orderId);
  if (!row) return;
  await updateOrderRow(row.rowNumber, [{ column: "M", value: transactionId }]);
}

/** Row whose col M (cakto_transaction_id) holds the given Cakto payment id. */
export function findRowByTransactionId(
  rows: OrderRow[],
  txId: string | undefined,
): OrderRow | undefined {
  if (!txId) return undefined;
  return rows.find((row) => row.values[12] === txId);
}

/** Fallback correlation: most recent AWAITING_PAYMENT order for this e-mail. */
export function findRowByEmail(rows: OrderRow[], email: string | undefined): OrderRow | undefined {
  if (!email) return undefined;
  const normalized = email.toLowerCase();
  const candidates = rows.filter(
    (row) => row.values[3]?.toLowerCase() === normalized && row.values[11] === "AWAITING_PAYMENT",
  );
  return candidates.length > 0 ? candidates[candidates.length - 1] : undefined;
}

/**
 * Marks an order PAID (L/M/N). Owner email notifications are opt-in; when
 * disabled, Q records DISABLED. Repeated confirmations are a no-op once the
 * payment is recorded and no automatic notification is pending.
 */
export async function markOrderPaid(
  orderId: string,
  txId: string,
): Promise<"paid" | "duplicate" | "not_found"> {
  let rows: OrderRow[];
  try {
    rows = await readOrderRows();
  } catch (error) {
    console.error(`[orders] Failed to read sheet for order ${orderId}:`, error);
    throw error;
  }
  const row = rows.find((r) => r.orderId === orderId);
  if (!row) return "not_found";

  const currentStatus = row.values[11] ?? ""; // L = payment_status
  const notificationStatus = row.values[16] ?? ""; // Q = notification_status
  const emailNotificationsEnabled = env("ORDER_EMAIL_NOTIFICATIONS") === "true";
  if (currentStatus === "PAID" && (!emailNotificationsEnabled || notificationStatus === "SENT")) {
    return "duplicate";
  }

  const paidAt =
    currentStatus === "PAID" && row.values[13] ? row.values[13] : new Date().toISOString();
  await updateOrderRow(row.rowNumber, [
    { column: "L", value: "PAID" },
    { column: "M", value: txId },
    { column: "N", value: paidAt },
    ...(!emailNotificationsEnabled ? [{ column: "Q", value: "DISABLED" }] : []),
  ]);

  if (!emailNotificationsEnabled) return "paid";

  try {
    await sendOwnerOrderEmail(rowToEmailOrder(row, txId));
    await updateOrderRow(row.rowNumber, [{ column: "Q", value: "SENT" }]);
  } catch (emailError) {
    console.error(
      `[orders] Owner email failed for order ${orderId} — will retry on next webhook delivery:`,
      emailError,
    );
    await updateOrderRow(row.rowNumber, [{ column: "Q", value: "FAILED" }]);
  }
  return "paid";
}

/** L=REFUSED only when the order is still AWAITING_PAYMENT. */
export async function markOrderRefused(orderId: string): Promise<void> {
  const rows = await readOrderRows();
  const row = rows.find((r) => r.orderId === orderId);
  if (!row) return;
  if ((row.values[11] ?? "") === "AWAITING_PAYMENT") {
    await updateOrderRow(row.rowNumber, [{ column: "L", value: "REFUSED" }]);
  }
}

/** L=REFUNDED only when the order was PAID (keeps the row for auditing). */
export async function markOrderRefunded(orderId: string): Promise<void> {
  const rows = await readOrderRows();
  const row = rows.find((r) => r.orderId === orderId);
  if (!row) return;
  if ((row.values[11] ?? "") === "PAID") {
    await updateOrderRow(row.rowNumber, [{ column: "L", value: "REFUNDED" }]);
  }
}
