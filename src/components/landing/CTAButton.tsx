"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CTA_LABEL } from "./offer";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * CTA principal de conversão da landing: leva à PÁGINA DE PEDIDO (/pedido),
 * onde o visitante configura a música, os extras e o pagamento.
 * A landing vende; a página de pedido converte.
 */
export function CTAButton({
  className,
  label = CTA_LABEL,
  size = "lg",
}: {
  className?: string;
  label?: string;
  size?: "lg" | "md";
}) {
  return (
    <Link
      to="/pedido"
      onClick={() => analytics.ctaClick()}
      className={cn(
        "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] sm:w-auto",
        size === "lg" ? "min-h-14 px-8 text-base sm:text-lg" : "min-h-12 px-6 text-sm",
        className,
      )}
      style={{ boxShadow: "var(--shadow-offer)" }}
    >
      {label}
      <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
