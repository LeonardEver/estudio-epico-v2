/**
 * Cakto webhook processing — the webhook is the single source of truth for
 * payment approval; the browser is never trusted.
 *
 * Delivery (see https://docs.cakto.com.br/conceitos/webhooks):
 *   POST { "secret": "...", "event": "purchase_approved", "data": { ... } }
 *   Headers: X-Cakto-Timestamp (unix seconds), X-Cakto-Signature ("v1=<hex>").
 *
 * Authentication: the body `secret` must match CAKTO_WEBHOOK_SECRET (always
 * present in deliveries). When the signature header is present it must ALSO
 * verify — HMAC-SHA256 over "{timestamp}.{rawBody}", timing-safe, with a
 * 5-minute replay window. Respond 2xx immediately; Cakto retries only when
 * the connection fails (up to 5x) and offers manual resend otherwise.
 *
 * Correlation: the payment id (data.id) was persisted in col M when the
 * charge was created; fallback is the most recent AWAITING_PAYMENT order for
 * the customer e-mail.
 *
 * Idempotency: markOrderPaid is a no-op for orders already PAID + notified.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";
import { readOrderRows, type OrderRow } from "./google-sheets";
import {
  findRowByEmail,
  findRowByTransactionId,
  markOrderPaid,
  markOrderRefunded,
  markOrderRefused,
} from "./orders";

const MAX_BODY_BYTES = 1_000_000;
const REPLAY_WINDOW_SECONDS = 300;

const HANDLED_EVENTS = new Set(["purchase_approved", "purchase_refused", "refund", "chargeback"]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the optional HMAC signature. Returns false only when the header is
 * present but invalid (fail closed); without the header, the body secret is
 * the sole auth mechanism (documented alternative).
 */
function verifySignature(rawBody: string, secret: string, request: Request): boolean {
  const timestamp = request.headers.get("x-cakto-timestamp");
  const signature = request.headers.get("x-cakto-signature");
  if (!timestamp || !signature) return true;

  const match = /^v1=([a-f0-9]+)$/i.exec(signature.trim());
  if (!match?.[1]) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > REPLAY_WINDOW_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEqual(match[1].toLowerCase(), expected);
}

type WebhookData = Record<string, unknown>;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function handleCaktoWebhook(request: Request): Promise<Response> {
  const secret = env("CAKTO_WEBHOOK_SECRET");
  if (!secret) {
    // Fail closed — an unauthenticated webhook must never mark orders PAID.
    console.error("[cakto-webhook] CAKTO_WEBHOOK_SECRET is not configured — rejecting webhook");
    return json({ error: "webhook_not_configured" }, 503);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: "unreadable_body" }, 400);
  }
  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
    return json({ error: "body_too_large" }, 413);
  }

  let payload: WebhookData;
  try {
    payload = JSON.parse(rawBody) as WebhookData;
  } catch {
    console.error("[cakto-webhook] Invalid JSON payload");
    return json({ error: "invalid_json" }, 400);
  }

  const bodySecret = asString(payload["secret"]) ?? "";
  if (!safeEqual(bodySecret, secret) || !verifySignature(rawBody, secret, request)) {
    console.error("[cakto-webhook] Authentication failed — rejecting webhook");
    return json({ error: "unauthorized" }, 401);
  }

  const event = asString(payload["event"]) ?? "";
  if (!HANDLED_EVENTS.has(event)) {
    console.log(`[cakto-webhook] Ignored event: ${event || "missing"}`);
    return json({ ok: true, ignored: event || "missing" });
  }

  // V2 webhooks (criados pelo Painel) entregam data como array.
  const dataItems: WebhookData[] = Array.isArray(payload["data"])
    ? (payload["data"] as WebhookData[])
    : [payload["data"] as WebhookData];

  let rows: OrderRow[];
  try {
    rows = await readOrderRows();
  } catch (error) {
    console.error("[cakto-webhook] Failed to read Google Sheet:", error);
    return json({ error: "storage_unavailable" }, 503);
  }

  try {
    for (const data of dataItems) {
      if (!data || typeof data !== "object") continue;

      const txId = asString(data["id"]);
      const email = asString((data["customer"] as WebhookData | undefined)?.["email"]);

      const order = findRowByTransactionId(rows, txId) ?? findRowByEmail(rows, email);
      if (!order) {
        // Not an order of ours (or already cleaned up). 2xx stops Cakto retries.
        console.log("[cakto-webhook] No matching order found — event ignored");
        continue;
      }

      switch (event) {
        case "purchase_approved": {
          const result = await markOrderPaid(order.orderId, txId ?? "");
          console.log(`[cakto-webhook] purchase_approved for ${order.orderId}: ${result}`);
          break;
        }
        case "purchase_refused": {
          await markOrderRefused(order.orderId);
          break;
        }
        case "refund":
        case "chargeback": {
          await markOrderRefunded(order.orderId);
          break;
        }
      }
    }
    return json({ ok: true, event });
  } catch (error) {
    console.error("[cakto-webhook] Failed processing event:", error);
    return json({ error: "processing_failed" }, 503);
  }
}
