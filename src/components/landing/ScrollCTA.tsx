"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * CTA de NAVEGAÇÃO do funil: avança o visitante para a próxima seção.
 *
 * NUNCA abre checkout nem dispara InitiateCheckout — a conversão acontece só
 * nos CTAs finais da oferta (CTAButton, no /pedido).
 *
 * `variant="primary"` existe para o topo da landing: mesma força visual do
 * botão de compra, mas ainda é navegação (por isso a seta para baixo).
 * `variant="outline"` é a navegação secundária — precisa parecer clicável,
 * nunca um botão desabilitado.
 */
export function ScrollCTA({
  target,
  label,
  variant = "outline",
  arrow = "down",
  className,
  size = "lg",
}: {
  /** ID da seção destino (sem "#"). */
  target: string;
  label: string;
  variant?: "primary" | "outline";
  /** "down" para rolar adiante; "right" quando o rótulo pede avanço. */
  arrow?: "down" | "right";
  className?: string;
  size?: "lg" | "md";
}) {
  const Arrow = arrow === "down" ? ArrowDown : ArrowRight;

  return (
    <button
      type="button"
      onClick={() => {
        analytics.scrollCtaClick(target);
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className={cn(
        "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl font-display font-bold tracking-wide transition-transform duration-200 active:scale-[0.99] sm:w-auto",
        variant === "primary" &&
          "bg-[image:var(--gradient-price)] text-primary-foreground shadow-[var(--shadow-offer)] hover:scale-[1.02]",
        variant === "outline" &&
          "border-2 border-accent/55 bg-surface text-foreground backdrop-blur transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent",
        size === "lg" ? "min-h-14 px-8 text-base sm:text-lg" : "min-h-12 px-6 text-sm",
        className,
      )}
    >
      {label}
      <Arrow
        className={cn(
          "size-5 transition-transform duration-200",
          arrow === "down" ? "group-hover:translate-y-0.5" : "group-hover:translate-x-1",
          variant === "outline" && "text-accent",
        )}
      />
    </button>
  );
}
