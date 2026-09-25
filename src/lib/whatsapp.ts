/**
 * Rota secundária de conversão: WhatsApp.
 *
 * O número vem de VITE_WHATSAPP_NUMBER (público por design — entra no bundle do
 * browser). Aceita com ou sem DDI: "5511999999999" ou "11958594370". A
 * normalização para o formato do wa.me fica em whatsappNumber().
 *
 * Nenhum componente deve hardcodar o número: use whatsappLink() para montar a
 * URL e hasWhatsApp() para saber se a rota está disponível.
 */
import { PRICE } from "@/components/landing/offer";

const RAW_NUMBER = (import.meta.env["VITE_WHATSAPP_NUMBER"] as string | undefined)?.trim() ?? "";

/**
 * Número normalizado para o formato que o wa.me exige: só dígitos, COM DDI.
 *
 * Aceita as duas formas que aparecem na prática:
 *   - "5511999999999"    → já tem DDI, devolve como está
 *   - "11958594370"      → DDD + número (11 dígitos), prefixa o DDI 55
 *   - "+55 (11) 99999-9999" → pontuação é descartada
 *
 * Mesma regra do `normalizePhone` do servidor (src/lib/server/cakto.ts), para
 * que o número do WhatsApp e o do checkout nunca divirjam.
 */
export function whatsappNumber(): string {
  const digits = RAW_NUMBER.replace(/\D/g, "");
  if (digits.length >= 12 && digits.length <= 13) return digits; // já tem DDI
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`; // DDD + número
  return "";
}

/**
 * true quando VITE_WHATSAPP_NUMBER tem um número utilizável. Sem isso a rota
 * de WhatsApp simplesmente não é renderizada — melhor esconder o CTA do que
 * publicar um link quebrado.
 */
export function hasWhatsApp(): boolean {
  return whatsappNumber().length > 0;
}

/** Mensagem pré-preenchida — o preço acompanha PRICE (fonte única da oferta). */
export const WHATSAPP_MESSAGE = `Olá! Vi o Estúdio Épico e quero saber mais sobre a música personalizada de ${PRICE}. 🎵`;

/** Link wa.me com mensagem pré-preenchida. String vazia quando não configurado. */
export function whatsappLink(message: string = WHATSAPP_MESSAGE): string {
  if (!hasWhatsApp()) return "";
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}
