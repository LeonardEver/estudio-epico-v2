"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * CTA de NAVEGAÇÃO do funil — o ÚNICO componente de navegação da Landing.
 *
 * NUNCA abre checkout nem dispara InitiateCheckout: a conversão acontece só
 * nos CTAs finais da oferta (CTAButton, no /pedido).
 *
 * Hierarquia visual da página:
 *   1. CTAButton            → gradiente cheio + glow forte  (comprar)
 *   2. ScrollCTA primary    → gradiente cheio              (topo do Hero)
 *   3. ScrollCTA outline    → preenchimento tonal da marca + borda viva + glow
 *   4. Info / accordions    → contraste alto, sem cara de botão
 *
 * O nível 3 antes usava `bg-surface` (quase igual ao fundo preto da página) e
 * parecia desabilitado. Agora tem preenchimento na cor da marca, borda de
 * acento em destaque e glow — clicável de relance, sem competir com a compra.
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
  const isNavigation = variant === "outline";

  return (
    <button
      type="button"
      onClick={() => {
        analytics.scrollCtaClick(target);
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      style={{ boxShadow: isNavigation ? "var(--shadow-nav)" : "var(--shadow-offer)" }}
      className={cn(
        "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl font-display font-bold tracking-wide transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.98] sm:w-auto",
        variant === "primary" &&
          "bg-[image:var(--gradient-price)] text-primary-foreground hover:scale-[1.02]",
        isNavigation &&
          "border-2 border-accent/70 bg-primary/60 text-foreground hover:-translate-y-0.5 hover:border-accent hover:bg-primary/75 active:translate-y-0",
        size === "lg" ? "min-h-14 px-8 text-base sm:text-lg" : "min-h-12 px-6 text-sm",
        className,
      )}
    >
      {label}
      <Arrow
        className={cn(
          "size-5 transition-transform duration-200",
          arrow === "down" ? "group-hover:translate-y-0.5" : "group-hover:translate-x-1",
        )}
      />
    </button>
  );
}
