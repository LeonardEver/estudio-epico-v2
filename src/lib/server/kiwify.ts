/**
 * Kiwify integration helpers.
 *
 * Checkout prefill uses only the parameters officially documented by Kiwify:
 * `name`, `email`, `phone` (+ `src` for tracking). See:
 * https://ajuda.kiwify.com.br/pt-br/article/como-preencher-os-campos-do-checkout-pela-url-de7ezo/
 *
 * Webhook payloads are parsed defensively: Kiwify does not publish a stable
 * schema, so several field aliases observed in the wild are accepted.
 */
import { requireEnv } from "./env";

export type CheckoutInput = {
  orderId: string;
  name: string;
  email: string;
  whatsapp?: string | undefined;
  utm?: Record<string, string> | undefined;
};

export function buildKiwifyCheckoutUrl(input: CheckoutInput): string {
  const url = new URL(requireEnv("KIWIFY_CHECKOUT_URL"));

  // Customer prefill (documented parameters only).
  url.searchParams.set("name", input.name);
  url.searchParams.set("email", input.email);
  const phone = normalizePhone(input.whatsapp);
  if (phone) url.searchParams.set("phone", phone);

  // Order identity: `src` is Kiwify's documented tracking parameter. The webhook
  // echoes it back when the checkout preserves it — the primary correlation key.
  url.searchParams.set("src", input.orderId);

  // Preserve the visitor's own tracking parameters (UTM etc.).
  for (const [key, value] of Object.entries(input.utm ?? {})) {
    if (!value || key === "src") continue; // src is reserved for order identity
    url.searchParams.set(key, value.slice(0, 200));
  }

  return url.toString();
}

/** Normalizes a Brazilian-style WhatsApp number to E.164-ish digits ("5511999999999"). */
export function normalizePhone(raw?: string): string | undefined {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length >= 12 && digits.length <= 13) return digits; // already has country code
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return undefined;
}

// ---------------------------------------------------------------------------
// Webhook payload normalization
// ---------------------------------------------------------------------------

export type WebhookEvent =
  | {
      kind: "approved" | "refused" | "refunded" | "chargedback";
      txId?: string | undefined;
      customerEmail?: string | undefined;
      src?: string | undefined;
      productId?: string | undefined;
    }
  | { kind: "ignored"; reason: "test_event" | "unknown_event" | "foreign_product" };

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function lookup(body: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(body[key]);
    if (value) return value;
  }
  return undefined;
}

export function normalizeKiwifyWebhook(body: unknown): WebhookEvent {
  const record = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const isTest =
    record["is_test"] === true || record["test"] === true || record["test_mode"] === true;
  if (isTest) return { kind: "ignored", reason: "test_event" };

  const eventType = lookup(record, [
    "webhook_event_type",
    "event_type",
    "event",
    "type",
  ])?.toLowerCase();
  const orderStatus = lookup(record, ["order_status", "status", "payment_status"])?.toLowerCase();

  const customer = (record["customer"] ?? record["client"] ?? record["buyer"] ?? {}) as Record<
    string,
    unknown
  >;
  const customerEmail =
    lookup(customer, ["email", "mail"]) ?? lookup(record, ["customer_email", "email"]);

  const tracking = (record["tracking"] ??
    record["tracking_parameters"] ??
    record["url_parameters"] ??
    record["url_params"] ??
    {}) as Record<string, unknown>;
  const src = lookup(tracking, ["src"]) ?? lookup(record, ["src"]);

  const txId = lookup(record, [
    "order_id",
    "transaction_id",
    "payment_id",
    "external_id",
    "kiwify_order_id",
  ]);
  const productId = lookup(record, ["product_id", "product", "product_ref"]);

  const event = eventType ?? "";
  const status = orderStatus ?? "";

  const isApproved =
    /approved|aprovada|aprovado|paid|pago|compra_aprovada/.test(event) || status === "paid";
  const isRefused = /refused|recusad|rejected|rejeitad/.test(event) || status === "refused";
  const isChargeback = /chargeback|contestad/.test(event) || status === "chargedback";
  const isRefunded = /refunded|refund|reembolsad|estornad/.test(event) || status === "refunded";

  if (isChargeback) return { kind: "chargedback", txId, customerEmail, src, productId };
  if (isRefunded) return { kind: "refunded", txId, customerEmail, src, productId };
  if (isRefused) return { kind: "refused", txId, customerEmail, src, productId };
  if (isApproved) return { kind: "approved", txId, customerEmail, src, productId };

  return { kind: "ignored", reason: "unknown_event" };
}

/** Fails closed: if KIWIFY_PRODUCT_ID is configured, events for other products are ignored. */
export function productMatches(event: WebhookEvent): boolean {
  if (event.kind === "ignored") return false;
  const expected = process.env["KIWIFY_PRODUCT_ID"];
  if (!expected) return true; // not configured — cannot verify, let it through
  return event.productId === undefined || event.productId === expected;
}
