"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CTA_LABEL, PRICE } from "./offer";
import { analytics } from "@/lib/analytics";

/**
 * Sticky CTA de mobile — discreto. Só aparece quando o visitante já chegou
 * na seção da oferta (já demonstrou intenção), nunca no topo da página.
 * Leva à página de pedido, não abre modal.
 */
export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const offer = document.getElementById("oferta");
      if (!offer) return;
      // Visível quando o topo da oferta já passou da metade da tela.
      setVisible(offer.getBoundingClientRect().top < window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-2.5 backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="leading-tight">
          <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
            Música personalizada
          </p>
          <p className="offer-gradient-text font-display text-xl font-extrabold">{PRICE}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            analytics.ctaClick();
            void navigate({ to: "/pedido" });
          }}
          className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-sm font-bold text-primary-foreground"
          style={{ boxShadow: "var(--shadow-offer)" }}
        >
          {CTA_LABEL}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
