/**
 * CPF: máscara, normalização e validação.
 *
 * Módulo compartilhado (client + server, sem dependências de servidor) — o
 * mesmo validador roda no formulário e no handler da server fn, para que a
 * validação do navegador nunca seja a única barreira.
 *
 * O CPF NUNCA deve ir para analytics, Meta Pixel ou Clarity. Ele só existe no
 * payload da cobrança enviada à Cakto.
 */

/** Mensagem única de erro do CPF no fluxo do PIX. */
export const CPF_ERROR_MESSAGE = "Informe um CPF válido para gerar o Pix.";

/** Somente os dígitos do CPF, no máximo 11 (para envio à Cakto). */
export function cpfDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Máscara brasileira: "000.000.000-00". */
export function formatCpf(value: string): string {
  const digits = cpfDigits(value);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

/**
 * Valida formato + dígitos verificadores (módulo 11).
 * Rejeita sequências repetidas ("111.111.111-11"), que passam no cálculo mas
 * não são CPFs reais.
 */
export function isValidCpf(value: string): boolean {
  const cpf = cpfDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // 1º dígito: pesos 10..2 sobre os 9 primeiros; 2º: pesos 11..2 sobre 10.
  for (const [length, position] of [
    [9, 10],
    [10, 11],
  ] as const) {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(cpf[position - 1])) return false;
  }
  return true;
}
