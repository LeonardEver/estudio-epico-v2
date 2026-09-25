/**
 * Cupom de boas-vindas — PRIMEIRA15 (15% OFF).
 *
 * Mecanismo: a API da Cakto aceita um campo `coupon` no POST /payments/
 * (documentado no schema público da API). O desconto é aplicado PELA CAKTO
 * sobre a oferta cobrada — não criamos ofertas promocionais paralelas nem
 * mandamos preço pelo navegador.
 *
 * Pré-requisito manual: o cupom PRIMEIRA15 precisa existir no painel da Cakto
 * (Cupons → Adicionar cupom), vinculado ao produto, com 15% de desconto. Sem
 * isso a Cakto não tem o que aplicar.
 *
 * LIMITE DE "PRIMEIRA COMPRA": o schema público da Cakto expõe apenas
 * `code`, `discount`, `applyOnBumps`, `startTime` e `endTime` — NÃO existe
 * regra de uma-vez-por-CPF/cliente. Portanto "primeira compra" é apenas o
 * NOME/CONCEITO da campanha; não há trava técnica e nada na interface promete
 * uma.
 */

/** Código do cupom. Este é o ÚNICO valor que o servidor encaminha à Cakto. */
export const COUPON_CODE = "PRIMEIRA15";

/** Desconto do cupom (15%). */
export const COUPON_DISCOUNT = 0.15;

/** Normaliza o que o cliente digitou (trim, maiúsculas, sem espaços). */
export function normalizeCouponCode(raw: string | undefined): string {
  return (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

/** true quando o código digitado é o cupom conhecido. */
export function isKnownCoupon(raw: string | undefined): boolean {
  const code = normalizeCouponCode(raw);
  return code.length > 0 && code === COUPON_CODE;
}

/**
 * Preço com desconto — usado APENAS para exibir. O valor cobrado é sempre o
 * que a Cakto devolve na cobrança (`amount`), nunca este cálculo.
 */
export function couponPrice(base: number): number {
  return Math.round(base * (1 - COUPON_DISCOUNT) * 100) / 100;
}

/** Valor do desconto em reais (exibição). */
export function couponSavings(base: number): number {
  return Math.round(base * COUPON_DISCOUNT * 100) / 100;
}
