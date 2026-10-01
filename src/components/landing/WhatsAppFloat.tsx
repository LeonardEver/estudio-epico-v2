"use client";

import whatsappIcon from "@/assets/WhatsApp.svg.webp";
import { analytics } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Botão flutuante de WhatsApp — canto inferior direito, fixo na viewport.
 *
 * Rota secundária no desktop. Mobile uses the inline FAQ/footer links so
 * a floating support icon cannot cover the audio or video controls.
 *
 * Não renderiza nada quando VITE_WHATSAPP_NUMBER não está configurada.
 */
export function WhatsAppFloat() {
  const href = whatsappLink();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.whatsappClick()}
      aria-label="Fale conosco no WhatsApp"
      className="group fixed right-6 bottom-6 z-50 hidden size-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform duration-200 hover:scale-105 active:scale-95 lg:flex"
      style={{ boxShadow: "var(--shadow-offer)" }}
    >
      <img
        src={whatsappIcon}
        alt=""
        aria-hidden
        width={962}
        height={962}
        className="size-7 object-contain lg:size-8"
      />

      {/* Tooltip — só no hover do desktop, nunca fixo. */}
      <span className="pointer-events-none absolute right-full mr-3 hidden rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium whitespace-nowrap text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block">
        Fale conosco no WhatsApp
      </span>
    </a>
  );
}
