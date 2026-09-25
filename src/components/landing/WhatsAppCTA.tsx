"use client";

import { MessageCircle } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Segunda rota de conversão da landing: tirar dúvidas com uma pessoa antes de
 * comprar. NUNCA substitui o CTA principal (QUERO MINHA MÚSICA), que continua
 * levando ao fluxo da página de pedido — a hierarquia aqui é sempre menor.
 *
 * Não renderiza nada quando VITE_WHATSAPP_NUMBER não está configurado.
 */
export function WhatsAppCTA({
  label = "Tenho dúvidas — falar no WhatsApp",
  hint,
  variant = "outline",
  className,
}: {
  label?: string;
  /** Linha de apoio abaixo do botão (ex.: "Sem compromisso"). */
  hint?: string;
  variant?: "outline" | "link";
  className?: string;
}) {
  const href = whatsappLink();
  if (!href) return null;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => analytics.whatsappClick()}
        className={cn(
          "group inline-flex w-full cursor-pointer items-center justify-center gap-2 transition-colors duration-200 sm:w-auto",
          variant === "outline" &&
            "min-h-12 rounded-xl border border-border bg-surface/60 px-6 text-sm font-medium text-foreground backdrop-blur hover:border-accent/70 hover:text-accent",
          variant === "link" && "text-sm text-muted-foreground hover:text-accent",
        )}
      >
        <MessageCircle
          className={cn("size-4 shrink-0 text-accent", variant === "link" && "size-3.5")}
        />
        {label}
      </a>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
