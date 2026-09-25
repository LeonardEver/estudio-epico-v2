// Oferta do funil — preços definidos pelo produto.
// Os CTAs levam à página /pedido, onde o pagamento acontece in-app (Cakto):
// a cobrança usa a oferta correspondente à seleção (bundle/extras), mapeada
// no servidor via CAKTO_OFFER_ID_*.
//
// IMPORTANTE: o valor COBRADO vem da oferta cadastrada na Cakto — mudar um
// número aqui muda o que a página mostra, nunca o que o cliente paga. Os
// dois lados precisam ser atualizados juntos (ver SETUP.md).
import { formatBRL } from "@/lib/format";

/**
 * Produto principal — Sua Música Personalizada.
 * `PRICE` é a manchete (sem centavos, por decisão de copy); `PRICE_VALUE` é o
 * número usado em toda a aritmética da oferta.
 */
export const PRICE_VALUE = 67;
export const PRICE = "R$67";

/**
 * Produto principal — valor cheio percebido, exibido riscado no Hero.
 * A economia abaixo é DERIVADA da âncora menos o preço.
 */
export const PRICE_ANCHOR_VALUE = 147.9;
export const PRICE_ANCHOR = formatBRL(PRICE_ANCHOR_VALUE);
export const PRICE_SAVINGS_VALUE = PRICE_ANCHOR_VALUE - PRICE_VALUE;
export const PRICE_SAVINGS = formatBRL(PRICE_SAVINGS_VALUE);

/**
 * Plataformas onde o serviço realmente distribui — a MESMA lista do FAQ.
 * Só nomes: não usamos logos nem cores de marca, para não sugerir endosso.
 */
export const DISTRIBUTION_PLATFORMS = [
  "Spotify",
  "YouTube Music",
  "Apple Music",
  "Deezer",
] as const;

/** Order bump — Capa Personalizada (extra opcional). */
export const BUMP_PRICE_VALUE = 19.9;
export const BUMP_PRICE = formatBRL(BUMP_PRICE_VALUE);

/** Upsell 1 — Página Exclusiva para Ouvir e Compartilhar. */
export const EXCLUSIVE_PAGE_PRICE_VALUE = 59.9;
export const EXCLUSIVE_PAGE_PRICE = formatBRL(EXCLUSIVE_PAGE_PRICE_VALUE);

/** Upsell pós-compra — Lançamento nas plataformas digitais. */
export const STREAMING_PRICE_VALUE = 287;
export const STREAMING_PRICE = formatBRL(STREAMING_PRICE_VALUE);

/**
 * Pacote Completo — âncora DERIVADA: soma dos quatro itens comprados
 * separadamente (música + capa + página + lançamento).
 *
 * Nunca digitar à mão: foi assim que a âncora antiga descolou dos preços
 * reais depois que a música mudou de valor. Derivar mantém a economia exibida
 * sempre igual à diferença verdadeira.
 */
export const BUNDLE_ANCHOR_VALUE =
  PRICE_VALUE + BUMP_PRICE_VALUE + EXCLUSIVE_PAGE_PRICE_VALUE + STREAMING_PRICE_VALUE;

/** Pacote Completo — preço oficial. */
export const BUNDLE_PRICE_VALUE = 347;

/** Pacote Completo — economia (âncora − preço), também derivada. */
export const BUNDLE_SAVINGS_VALUE = BUNDLE_ANCHOR_VALUE - BUNDLE_PRICE_VALUE;

export const BUNDLE_ANCHOR = formatBRL(BUNDLE_ANCHOR_VALUE);
export const BUNDLE_PRICE = formatBRL(BUNDLE_PRICE_VALUE);
export const BUNDLE_SAVINGS = formatBRL(BUNDLE_SAVINGS_VALUE);

export const CTA_LABEL = "QUERO MINHA MÚSICA";
