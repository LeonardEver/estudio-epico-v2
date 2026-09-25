/**
 * Client-callable server functions for Cakto in-app payments (PIX + card).
 *
 * The charge is created server-side; the browser only ever sends card TOKENS
 * produced by the Cakto SDK — raw card data never reaches this backend.
 *
 * Idempotency: the key is deterministic per order + attempt
 * (`{orderId}:pix:{n}` / `{orderId}:card`), so a client retry of the same
 * submission returns the original charge instead of creating a duplicate
 * (Cakto keeps the key for 24h). A NEW attempt (PIX expired) gets a new n.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { briefObjectSchema, briefRefine, briefSchema, type Extra } from "./brief";
import { COUPON_CODE, isKnownCoupon } from "./coupon";
import { isValidCpf } from "./cpf";
import {
  createOrder,
  markOrderPaid,
  markOrderRefused,
  persistTransactionId,
} from "./server/orders";
import {
  CaktoError,
  caktoMetadata,
  createCardCharge,
  createPixCharge,
  getCaktoOrder,
  normalizePhone,
  offerExists,
  offerIdForSelection,
  type CaktoCustomer,
} from "./server/cakto";
import { env } from "./server/env";

/** Safe message shown to the customer — never leak Cakto internals. */
const PAYMENT_START_ERROR_MESSAGE = "Não foi possível iniciar o pagamento agora. Tente novamente.";

const fingerprintSchema = z.string().min(8).max(64);

/**
 * CPF do titular da cobrança. A Cakto exige `docNumber` para pagamentos no
 * Brasil — sem ele a cobrança volta HTTP 400 ("O campo docNumber é obrigatório
 * para pagamentos no Brasil ou Argentina").
 *
 * Validamos os dígitos verificadores aqui também: a validação do frontend é
 * conveniência de UX, nunca a única barreira.
 */
const cpfSchema = z.string().refine(isValidCpf, "CPF inválido");

/**
 * Código de cupom vindo do navegador. Só o cupom CONHECIDO é repassado à
 * Cakto — qualquer outro valor é ignorado e a cobrança sai pelo preço cheio.
 * Assim um código aleatório nunca vira um 400 na criação da cobrança.
 *
 * O preço final continua sendo decidido pela oferta + cupom do lado da Cakto:
 * o cliente nunca manda valor.
 */
function safeCouponCode(raw: string | undefined): string | undefined {
  return isKnownCoupon(raw) ? COUPON_CODE : undefined;
}

function clientIp(): string | undefined {
  try {
    // IP real do comprador (resolvido pelo framework, ex. x-forwarded-for na Vercel).
    return getRequestIP() || undefined;
  } catch {
    return undefined;
  }
}

function buildCustomer(
  data: { name: string; email: string; whatsapp: string },
  fingerprint: string,
  doc: { docType: "cpf"; docNumber: string } | undefined,
): CaktoCustomer {
  const phone = normalizePhone(data.whatsapp);
  if (!phone) {
    // Briefing schema accepted it, but Cakto requires E.164 — fail safe.
    throw new Error(PAYMENT_START_ERROR_MESSAGE);
  }
  return {
    name: data.name,
    email: data.email,
    phone,
    fingerprint,
    ...(doc ? doc : {}),
    ...(clientIp() ? { ip: clientIp() } : {}),
  };
}

function logPaymentError(context: string, error: unknown): void {
  if (error instanceof CaktoError) {
    console.error(`${context} — Cakto status ${error.status}:`, error.message.slice(0, 500));
  } else {
    console.error(context, error);
  }
}

/**
 * Em dev, o erro chega ao frontend com passo + detalhe para diagnóstico;
 * em produção, sempre a mensagem segura (nunca vazar internals da Cakto).
 */
function paymentErrorMessage(step: string, error: unknown): string {
  if (import.meta.env.DEV) {
    const detail =
      error instanceof CaktoError
        ? `cakto_http_${error.status}: ${error.message.slice(0, 300)}`
        : error instanceof Error
          ? `${error.name}: ${error.message.slice(0, 300)}`
          : String(error);
    return `[CAKTO][step=${step}] ${detail}`;
  }
  return PAYMENT_START_ERROR_MESSAGE;
}

function toCreateOrderInput(data: z.infer<typeof briefSchema>) {
  return {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    lyricsPreference: data.lyricsPreference,
    lyrics: data.lyrics.trim(),
    description: data.description,
    genre: data.genre,
    genreOther: data.genreOther,
    mood: data.mood ?? [],
    recipient: data.recipient,
    occasion: data.occasion,
    references: data.references,
    extras: data.extras,
    bundle: data.bundle,
    paymentMethod: data.paymentMethod,
  };
}

// ---------------------------------------------------------------------------
// PIX
// ---------------------------------------------------------------------------

export type PixChargeResult = {
  orderId: string;
  chargeId: string;
  status: string;
  /** BR Code copia-e-cola (a imagem do QR é gerada no cliente). */
  qrCode: string;
  /** Expiração do QR Code (ISO 8601) — referência final da Cakto. */
  expirationDate: string | null;
  /**
   * Valor REAL cobrado, devolvido pela Cakto ("56.95"). É a única fonte de
   * verdade do preço — a tela mostra este número, não uma conta do navegador.
   */
  amount: string;
  /** Valor da oferta antes do desconto ("67.00"). */
  baseAmount: string;
  /** Desconto aplicado pela Cakto ("10.05"); "0.00" quando não houve cupom. */
  discount: string;
};

export const startPixPaymentFn = createServerFn({ method: "POST" })
  .validator(
    // ZodEffects (resultado de .superRefine) NÃO tem .extend — compor a partir
    // do objeto base e reaplicar o refine.
    briefObjectSchema
      .extend({
        fingerprint: fingerprintSchema,
        /** 1 na primeira tentativa; incrementa ao gerar um novo PIX (expirado). */
        pixAttempt: z.number().int().min(1).max(5).optional(),
        /** Obrigatório: sem docNumber a Cakto recusa o PIX (HTTP 400). */
        cpf: cpfSchema,
        /** Cupom digitado; só o código conhecido é repassado à Cakto. */
        coupon: z.string().trim().max(255).optional(),
      })
      .superRefine(briefRefine),
  )
  .handler(async ({ data }): Promise<PixChargeResult> => {
    let step = "init";
    try {
      // Diagnóstico: ambiente + flags de configuração (nunca valores).
      console.log("[CAKTO PIX] Environment: production (https://api.cakto.com.br/public_api)");
      console.log("[CAKTO PIX] Env flags:", {
        hasClientId: Boolean(env("CAKTO_CLIENT_ID")),
        hasClientSecret: Boolean(env("CAKTO_CLIENT_SECRET")),
        hasOfferBase: Boolean(env("CAKTO_OFFER_ID_BASE")),
        hasOfferCapa: Boolean(env("CAKTO_OFFER_ID_BASE_CAPA")),
        hasOfferPagina: Boolean(env("CAKTO_OFFER_ID_BASE_PAGINA")),
        hasOfferCapaPagina: Boolean(env("CAKTO_OFFER_ID_BASE_CAPA_PAGINA")),
        hasOfferBundle: Boolean(env("CAKTO_OFFER_ID_BUNDLE")),
        hasSheetsId: Boolean(env("GOOGLE_SPREADSHEET_ID")),
      });

      step = "create_order";
      const { orderId } = await createOrder(toCreateOrderInput(data));
      console.log(`[CAKTO PIX] Order created: ${orderId}`);

      step = "offer";
      const offerId = offerIdForSelection(data.bundle, data.extras as Extra[] | undefined);
      console.log(`[CAKTO PIX] Using offerId: ${offerId}`);
      console.log(`[CAKTO PIX] Offer found: ${await offerExists(offerId)}`);

      step = "create_pix";
      const coupon = safeCouponCode(data.coupon);
      console.log(`[CAKTO PIX] Coupon applied: ${coupon ? "yes" : "no"}`);
      const charge = await createPixCharge({
        offerId,
        customer: buildCustomer(data, data.fingerprint, {
          docType: "cpf",
          docNumber: data.cpf,
        }),
        coupon,
        idempotencyKey: `${orderId}:pix:${data.pixAttempt ?? 1}`,
        metadata: caktoMetadata(data.utm),
        pixExpiresIn: 1800, // 30 min; a expiração real vem na resposta
      });

      step = "persist";
      await persistTransactionId(orderId, charge.id);
      return {
        orderId,
        chargeId: charge.id,
        status: charge.status,
        qrCode: charge.pix?.qrCode ?? "",
        expirationDate: charge.pix?.expirationDate ?? null,
        // Preço final vem da Cakto (fonte de verdade), não de uma conta local.
        amount: charge.amount,
        baseAmount: charge.baseAmount ?? charge.amount,
        discount: charge.discount ?? "0.00",
      };
    } catch (error) {
      logPaymentError(`[CAKTO PIX] FAILED at step=${step}`, error);
      throw new Error(paymentErrorMessage(step, error));
    }
  });

// ---------------------------------------------------------------------------
// Cartão
// ---------------------------------------------------------------------------

export type CardChargeResult = {
  orderId: string;
  chargeId: string;
  /** "paid" | "declined" | "refused" | "pending" (Cakto). */
  status: string;
};

export const startCardPaymentFn = createServerFn({ method: "POST" })
  .validator(
    briefObjectSchema
      .extend({
        fingerprint: fingerprintSchema,
        /** Token de uso único gerado pelo SDK Cakto no browser. */
        cardToken: z.string().min(1).max(255),
        installments: z.number().int().min(1).max(12).optional(),
        /** Referência da sessão de antifraude (Nethone) do SDK. */
        antifraudRef: z.string().min(1).max(255),
        cpf: cpfSchema,
        /** Cupom digitado; só o código conhecido é repassado à Cakto. */
        coupon: z.string().trim().max(255).optional(),
      })
      .superRefine(briefRefine),
  )
  .handler(async ({ data }): Promise<CardChargeResult> => {
    try {
      const { orderId } = await createOrder(toCreateOrderInput(data));
      const charge = await createCardCharge({
        offerId: offerIdForSelection(data.bundle, data.extras as Extra[] | undefined),
        customer: buildCustomer(data, data.fingerprint, { docType: "cpf", docNumber: data.cpf }),
        coupon: safeCouponCode(data.coupon),
        cardToken: data.cardToken,
        installments: data.installments,
        antifraudRef: data.antifraudRef,
        idempotencyKey: `${orderId}:card`,
        metadata: caktoMetadata(data.utm),
      });
      await persistTransactionId(orderId, charge.id);

      if (charge.status === "paid") {
        // A cobrança JÁ foi aprovada — uma falha aqui (Sheets/e-mail) nunca
        // pode virar erro para o cliente: o webhook reaplica a marcação.
        try {
          await markOrderPaid(orderId, charge.id);
        } catch (error) {
          logPaymentError("[cakto] markOrderPaid failed — webhook will retry", error);
        }
      } else if (charge.status === "declined") {
        // Recusa financeira (banco) — registra no histórico.
        await markOrderRefused(orderId);
      }
      // "refused" (falha técnica no adquirente) mantém AWAITING_PAYMENT:
      // o cliente pode tentar de novo e uma nova cobrança reusa o mesmo pedido.

      return { orderId, chargeId: charge.id, status: charge.status };
    } catch (error) {
      logPaymentError("[CAKTO CARD] FAILED", error);
      throw new Error(paymentErrorMessage("card", error));
    }
  });

// ---------------------------------------------------------------------------
// Status (polling do PIX)
// ---------------------------------------------------------------------------

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "unknown";

/** Mapeia os estados da Cakto para o domínio do checkout. */
export function mapCaktoStatus(status: string): PaymentStatus {
  switch (status) {
    case "paid":
    case "partially_paid":
      return "paid";
    case "refunded":
      return "refunded";
    case "refused":
    case "blocked":
    case "canceled":
    case "chargedback":
    case "acquirer_error":
    case "prechargeback":
    case "in_protest":
      return "failed";
    case "waiting_payment":
    case "processing":
    case "authorized":
    case "scheduled":
    case "retrying":
    case "in_settlement":
    case "refund_requested":
    default:
      return "pending";
  }
}

export const getChargeStatusFn = createServerFn({ method: "GET" })
  .validator(z.object({ chargeId: z.string().min(1).max(100) }))
  .handler(async ({ data }): Promise<{ status: PaymentStatus }> => {
    try {
      const order = await getCaktoOrder(data.chargeId);
      if (!order) return { status: "unknown" };
      return { status: mapCaktoStatus(order.status) };
    } catch (error) {
      logPaymentError(`[cakto] Status check failed for ${data.chargeId}`, error);
      // Polling tolera falhas transitórias — "pending" mantém o cliente esperando.
      return { status: "pending" };
    }
  });
