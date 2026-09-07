"use client";

import { ArrowDown } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * CTA de navegação do funil: avança o visitante para a próxima seção.
 * NÃO abre o checkout — o objetivo é fazer a pessoa percorrer a página.
 */
export function ScrollCTA({
  target,
  label,
  variant = "outline",
  className,
  size = "lg",
}: {
  /** ID da seção destino (sem "#"). */
  target: string;
  label: string;
  variant?: "primary" | "outline";
  className?: string;
  size?: "lg" | "md";
}) {
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
          "border-2 border-foreground/15 bg-surface/60 text-foreground backdrop-blur transition-colors hover:border-accent/70 hover:text-accent",
        size === "lg" ? "min-h-14 px-8 text-base sm:text-lg" : "min-h-12 px-6 text-sm",
        className,
      )}
    >
      {label}
      <ArrowDown
        className={cn(
          "size-5 transition-transform duration-200 group-hover:translate-y-0.5",
          variant === "outline" && "text-accent",
        )}
      />
    </button>
  );
}
