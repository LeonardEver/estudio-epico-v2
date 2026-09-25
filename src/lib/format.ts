/**
 * Formatação de dinheiro no padrão do produto ("R$ 159,70" → "R$159,70").
 *
 * Módulo compartilhado (client + server) — vive aqui, e não em
 * components/order, para que a tabela de preços (components/landing/offer.ts)
 * possa derivar seus valores sem inverter a dependência entre as pastas.
 */
export function formatBRL(value: number): string {
  return `R$${value.toFixed(2).replace(".", ",")}`;
}
