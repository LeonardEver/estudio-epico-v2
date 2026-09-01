/**
 * Kiwify webhook processing. The webhook is the single source of truth for
 * payment approval — never trust the browser.
 *
 * Authentication: Kiwify's dashboard webhook URLs can carry query strings, so
 * the primary mechanism is `?token=<KIWIFY_WEBHOOK_SECRET>`. An HMAC-SHA1
 * signature in the `x-kiwify-signature` header (community convention, computed
 * over the raw body) is also accepted when present.
 *
 * Idempotency: rows are keyed by order_id; a repeated webhook for an order
 * that is already PAID with notification_status=SENT does nothing.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";
import { normalizeKiwifyWebhook, productMatches } from "./kiwify";
import { readOrderRows, updateOrderRow, type OrderRow } from "./google-sheets";
import { sendOwnerOrderEmail, type OrderForEmail } from "./email";

const MAX_BODY_BYTES = 1_000_000;

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

function authenticate(rawBody: string, secret: string, request: Request): boolean {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (token && safeEqual(token, secret)) return true;

  const signature = request.headers.get("x-kiwify-signature") ?? request.headers.get("x-signature");
  if (signature) {
    const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
    return safeEqual(signature.toLowerCase(), expected);
  }
  return false;
}

export function findOrderForWebhook(
  rows: OrderRow[],
  src: string | undefined,
  customerEmail: string | undefined,
): OrderRow | undefined {
  // 1) Exact match on the `src` tracking param (carries our order_id).
  if (src) {
    const bySrc = rows.find((row) => row.orderId === src);
    if (bySrc) return bySrc;
  }
  // 2) Fallback: most recent AWAITING_PAYMENT order for this e-mail.
  if (customerEmail) {
    const email = customerEmail.toLowerCase();
    const candidates = rows.filter(
      (row) => row.values[3]?.toLowerCase() === email && row.values[11] === "AWAITING_PAYMENT",
    );
    if (candidates.length > 0) return candidates[candidates.length - 1]; // last appended = newest
  }
  return undefined;
}

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

export async function handleKiwifyWebhook(request: Request): Promise<Response> {
  const secret = env("KIWIFY_WEBHOOK_SECRET");
  if (!secret) {
    // Fail closed — an unauthenticated webhook must never mark orders PAID.
    console.error("[kiwify-webhook] KIWIFY_WEBHOOK_SECRET is not configured — rejecting webhook");
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

  if (!authenticate(rawBody, secret, request)) {
    console.error("[kiwify-webhook] Authentication failed — rejecting webhook");
    return json({ error: "unauthorized" }, 401);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[kiwify-webhook] Invalid JSON payload");
    return json({ error: "invalid_json" }, 400);
  }

  const event = normalizeKiwifyWebhook(payload);
  if (event.kind === "ignored") {
    console.log(`[kiwify-webhook] Ignored event: ${event.reason}`);
    return json({ ok: true, ignored: event.reason });
  }
  if (!productMatches(event)) {
    console.log("[kiwify-webhook] Ignored event: foreign_product");
    return json({ ok: true, ignored: "foreign_product" });
  }

  let rows: OrderRow[];
  try {
    rows = await readOrderRows();
  } catch (error) {
    console.error("[kiwify-webhook] Failed to read Google Sheet:", error);
    return json({ error: "storage_unavailable" }, 503);
  }

  const order = findOrderForWebhook(rows, event.src, event.customerEmail);
  if (!order) {
    // Not an order of ours (or already cleaned up). 200 stops Kiwify retries.
    console.log("[kiwify-webhook] No matching order found — event ignored");
    return json({ ok: true, ignored: "order_not_found" });
  }

  const currentStatus = order.values[11] ?? ""; // L = payment_status
  const notificationStatus = order.values[16] ?? ""; // Q = notification_status

  try {
    switch (event.kind) {
      case "approved": {
        // Idempotency: already PAID and notified → nothing to do.
        if (currentStatus === "PAID" && notificationStatus === "SENT") {
          return json({ ok: true, duplicate: true, orderId: order.orderId });
        }

        const txId = event.txId ?? "";
        const paidAt = new Date().toISOString();
        await updateOrderRow(order.rowNumber, [
          { column: "L", value: "PAID" },
          { column: "M", value: txId },
          { column: "N", value: paidAt },
        ]);

        // Email failure must NEVER affect payment status.
        try {
          await sendOwnerOrderEmail(rowToEmailOrder(order, txId));
          await updateOrderRow(order.rowNumber, [{ column: "Q", value: "SENT" }]);
        } catch (emailError) {
          console.error(
            `[kiwify-webhook] Owner email failed for order ${order.orderId} — will retry on next webhook delivery:`,
            emailError,
          );
          await updateOrderRow(order.rowNumber, [{ column: "Q", value: "FAILED" }]);
        }
        return json({ ok: true, orderId: order.orderId, status: "PAID" });
      }

      case "refused": {
        if (currentStatus === "AWAITING_PAYMENT") {
          await updateOrderRow(order.rowNumber, [{ column: "L", value: "REFUSED" }]);
        }
        return json({ ok: true, orderId: order.orderId, status: "REFUSED" });
      }

      case "refunded":
      case "chargedback": {
        // Don't delete anything — flag it so the owner knows not to produce/deliver.
        if (currentStatus === "PAID") {
          await updateOrderRow(order.rowNumber, [{ column: "L", value: "REFUNDED" }]);
        }
        return json({ ok: true, orderId: order.orderId, status: "REFUNDED" });
      }
    }
  } catch (error) {
    console.error(`[kiwify-webhook] Failed processing order ${order.orderId}:`, error);
    return json({ error: "processing_failed" }, 503);
  }
}
