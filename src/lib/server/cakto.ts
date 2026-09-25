/**
 * Cakto payments API client — server-only.
 *
 * Docs: https://docs.cakto.com.br
 *
 * - OAuth2 client_credentials: POST /public_api/token/ → Bearer token
 *   (cacheado até expirar; renovado com 1 min de folga).
 * - Cobranças: POST /public_api/payments/ — sempre com X-Idempotency-Key
 *   (retenção de 24h; reuso com payload idêntico retorna a mesma cobrança).
 * - O valor cobrado vem da OFERTA (offerId) — nunca enviamos amount.
 *
 * NEVER import this module from client code.
 */
import type { Extra } from "../brief";
import { requireEnv } from "./env";

const API_BASE = "https://api.cakto.com.br/public_api";

// ---------------------------------------------------------------------------
// OAuth2 access token (cached)
// ---------------------------------------------------------------------------

let cachedToken: { token: string; expiresAt: number } | undefined;

async function fetchToken(): Promise<{ token: string; expiresInSeconds: number }> {
  const response = await fetch(`${API_BASE}/token/`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("CAKTO_CLIENT_ID"),
      client_secret: requireEnv("CAKTO_CLIENT_SECRET"),
    }),
  });
  if (!response.ok) {
    // Debug: status + body (o corpo de erro do token não contém segredos).
    const body = await response.text().catch(() => "");
    console.error(
      `[CAKTO AUTH] FAILED — HTTP STATUS: ${response.status} — BODY: ${body.slice(0, 500)}`,
    );
    throw new Error(`Cakto token request failed with status ${response.status}`);
  }
  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
  };
  if (!data.access_token) {
    console.error("[CAKTO AUTH] FAILED — response missing access_token");
    throw new Error("Cakto token response missing access_token");
  }
  console.log(
    `[CAKTO AUTH] OK — token obtained — expires_in: ${data.expires_in ?? "n/d"} — scope: ${data.scope ?? "n/d"}`,
  );
  return { token: data.access_token, expiresInSeconds: data.expires_in ?? 36000 };
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const { token, expiresInSeconds } = await fetchToken();
  cachedToken = {
    token,
    expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000,
  };
  return token;
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

/** Error thrown for any non-2xx Cakto response. Never shown raw to customers. */
export class CaktoError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CaktoError";
  }
}

async function caktoFetch(path: string, init: RequestInit): Promise<Response> {
  const run = (token: string) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${token}`, ...init.headers },
    });

  let response = await run(await accessToken());
  if (response.status === 401) {
    // Token expired/revoked — fetch a fresh one and retry once.
    cachedToken = undefined;
    response = await run(await accessToken());
  }
  return response;
}

async function asJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new CaktoError(response.status, detail);
  }
  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CaktoCustomer = {
  name: string;
  email: string;
  /** E.164, ex.: 5511999999999 */
  phone: string;
  /** Identificador estável do dispositivo/sessão do comprador. */
  fingerprint: string;
  docType?: "cpf" | "cnpj";
  docNumber?: string;
  // `| undefined` explícito: o projeto usa exactOptionalPropertyTypes e os
  // campos opcionais são montados por spread condicional.
  ip?: string | undefined;
};

export type CaktoPayment = {
  id: string;
  refId: string;
  status: string;
  paymentMethod: string;
  /** Valor FINAL cobrado, em reais, como string decimal (ex.: "56.95"). */
  amount: string;
  /** Valor da oferta antes do desconto (ex.: "67.00"). */
  baseAmount?: string;
  /** Desconto aplicado pela Cakto (ex.: "10.05"). */
  discount?: string;
  checkoutUrl?: string;
  createdAt?: string;
  pix?: { qrCode: string; expirationDate: string };
};

type BaseChargeInput = {
  offerId: string;
  customer: CaktoCustomer;
  /** Chave de idempotência: reenviar a MESMA chave com o MESMO payload retorna a cobrança original. */
  idempotencyKey: string;
  /** Somente chaves de rastreio documentadas pela Cakto (utm_*, sck). */
  metadata?: Record<string, string>;
  /**
   * Código de cupom (mecanismo nativo da Cakto). A Cakto é quem aplica o
   * desconto sobre a oferta — o servidor nunca envia valor/amount.
   */
  coupon?: string | undefined;
};

/** Campos de cupom/desconto comuns às cobranças PIX e cartão. */
function couponFields(coupon: string | undefined): Record<string, string> {
  return coupon ? { coupon } : {};
}

async function createCharge(
  body: Record<string, unknown>,
  idempotencyKey: string,
  label: "PIX" | "CARD",
): Promise<CaktoPayment> {
  const customer = body["customer"] as Record<string, unknown> | undefined;
  const items = body["items"] as { offerId?: string }[] | undefined;
  // Payload mascarado: nunca logar segredos nem dados sensíveis do cliente.
  console.log(
    `[CAKTO ${label}] POST /payments/ — offerId: ${items?.[0]?.offerId ?? "?"} — idempotencyKey: ${idempotencyKey}`,
  );
  console.log(`[CAKTO ${label}] customer:`, {
    hasName: Boolean(customer?.["name"]),
    hasEmail: Boolean(customer?.["email"]),
    hasPhone: Boolean(customer?.["phone"]),
    hasFingerprint: Boolean(customer?.["fingerprint"]),
    hasDoc: Boolean(customer?.["docNumber"]),
    hasIp: Boolean(customer?.["ip"]),
  });

  const response = await caktoFetch("/payments/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-idempotency-key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(
      `[CAKTO ${label}] Create payment response: ${response.status} — BODY: ${detail.slice(0, 1000)}`,
    );
    throw new CaktoError(response.status, detail);
  }
  const data = (await response.json()) as CaktoPayment;
  console.log(
    `[CAKTO ${label}] OK — payment id: ${data.id} — refId: ${data.refId} — status: ${data.status}`,
  );
  return data;
}

// ---------------------------------------------------------------------------
// Charges
// ---------------------------------------------------------------------------

export type CreatePixChargeInput = BaseChargeInput & {
  /** Expiração do QR Code em segundos (mín. 60). A resposta é a referência final. */
  pixExpiresIn?: number;
};

export async function createPixCharge(input: CreatePixChargeInput): Promise<CaktoPayment> {
  return createCharge(
    {
      paymentMethod: "pix",
      customer: input.customer,
      items: [{ offerId: input.offerId }],
      ...couponFields(input.coupon),
      ...(input.metadata ? { metadata: input.metadata } : {}),
      ...(input.pixExpiresIn ? { pixExpiresIn: input.pixExpiresIn } : {}),
    },
    input.idempotencyKey,
    "PIX",
  );
}

export type CreateCardChargeInput = BaseChargeInput & {
  /** Token de uso único obtido pelo SDK Cakto no browser (nunca dados do cartão). */
  cardToken: string;
  /** Parcelas de 1 a 12 (default 1). */
  installments?: number | undefined;
  /** Referência da sessão de antifraude (Nethone) gerada pelo SDK no browser. */
  antifraudRef: string;
};

export async function createCardCharge(input: CreateCardChargeInput): Promise<CaktoPayment> {
  return createCharge(
    {
      paymentMethod: "credit_card",
      customer: input.customer,
      items: [{ offerId: input.offerId }],
      card: { token: input.cardToken },
      ...couponFields(input.coupon),
      ...(input.installments && input.installments > 1 ? { installments: input.installments } : {}),
      // Único campo de topo em snake_case — o nome camelCase é rejeitado (400).
      antifraud_profiling_attempt_reference: input.antifraudRef,
      ...(input.metadata ? { metadata: input.metadata } : {}),
    },
    input.idempotencyKey,
    "CARD",
  );
}

// ---------------------------------------------------------------------------
// Order status (PIX polling)
// ---------------------------------------------------------------------------

export type CaktoOrderStatus = {
  id: string;
  status: string;
  paymentMethod?: string;
};

/** null quando o pedido não existe (404). */
export async function getCaktoOrder(orderId: string): Promise<CaktoOrderStatus | null> {
  const response = await caktoFetch(`/orders/${encodeURIComponent(orderId)}/`, { method: "GET" });
  if (response.status === 404) return null;
  const data = await asJson<{ id: string; status: string; paymentMethod?: string }>(response);
  return data;
}

/** true quando a oferta existe na conta. Não bloqueia — a cobrança é a fonte de verdade. */
export async function offerExists(offerId: string): Promise<boolean> {
  const response = await caktoFetch(`/offers/${encodeURIComponent(offerId)}/`, { method: "GET" });
  return response.ok;
}

// ---------------------------------------------------------------------------
// Offer mapping (funil → offerId)
// ---------------------------------------------------------------------------

/**
 * Oferta cobrada conforme a seleção do funil. A Cakto cobra a partir de UMA
 * oferta por cobrança, então cada combinação tem a própria oferta (criadas na
 * conta "Estudio Epico"). Mapa: base jtpbi76 · base+capa 36w7tzm ·
 * base+página rwexmw6 · base+capa+página rzp7kx7 · pacote h2miw44.
 */
export function offerIdForSelection(
  bundle: boolean | undefined,
  extras: Extra[] | undefined,
): string {
  if (bundle) return requireEnv("CAKTO_OFFER_ID_BUNDLE");
  const hasCover = extras?.includes("COVER") ?? false;
  const hasPage = extras?.includes("EXCLUSIVE_PAGE") ?? false;
  if (hasCover && hasPage) return requireEnv("CAKTO_OFFER_ID_BASE_CAPA_PAGINA");
  if (hasPage) return requireEnv("CAKTO_OFFER_ID_BASE_PAGINA");
  if (hasCover) return requireEnv("CAKTO_OFFER_ID_BASE_CAPA");
  return requireEnv("CAKTO_OFFER_ID_BASE");
}

// ---------------------------------------------------------------------------
// Customer helpers
// ---------------------------------------------------------------------------

/** Normalizes a Brazilian-style WhatsApp number to E.164-ish digits ("5511999999999"). */
export function normalizePhone(raw?: string): string | undefined {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length >= 12 && digits.length <= 13) return digits; // already has country code
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return undefined;
}

/** Somente as chaves de rastreio documentadas pela Cakto (utm_*, sck). */
export function caktoMetadata(utm: Record<string, string> | undefined): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "sck",
  ]) {
    const value = utm?.[key];
    if (value) metadata[key] = value.slice(0, 200);
  }
  return metadata;
}
