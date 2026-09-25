"use client";

import { useState } from "react";
import { ChevronDown, Globe, Music, Palette, Rocket, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Extra } from "@/lib/brief";
import { BUNDLE_SAVINGS } from "@/components/landing/offer";
import { couponPrice } from "@/lib/coupon";
import { formatBRL, orderTotal, PRICE_CAPA, PRICE_MUSICA, PRICE_PAGINA } from "./order-state";

type SummaryItemsProps = {
  bundle: boolean;
  extras: Extra[];
};

type SummaryProps = SummaryItemsProps & {
  /** Cupom válido aplicado — o resumo precisa refletir o mesmo total do passo. */
  couponApplied: boolean;
};

function SummaryItems({ bundle, extras }: SummaryItemsProps) {
  if (bundle) {
    return (
      <ul className="space-y-3 text-sm">
        {[
          { icon: Music, label: "Música personalizada" },
          { icon: Palette, label: "Capa personalizada" },
          { icon: Globe, label: "Página exclusiva" },
          { icon: Rocket, label: "Lançamento nas plataformas" },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon className="size-4 shrink-0 text-accent" />
            <span className="flex-1">{label}</span>
            <span className="text-xs text-muted-foreground">incluído</span>
          </li>
        ))}
        <li className="flex items-center gap-2.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <Star className="size-4 text-accent" />
          <span>Pacote completo — economize {BUNDLE_SAVINGS}</span>
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-3 text-sm">
      <li className="flex items-center gap-2.5">
        <Music className="size-4 shrink-0 text-accent" />
        <span className="flex-1">Música personalizada</span>
        <span className="font-semibold">{formatBRL(PRICE_MUSICA)}</span>
      </li>
      {extras.includes("COVER") && (
        <li className="flex items-center gap-2.5">
          <Palette className="size-4 shrink-0 text-accent" />
          <span className="flex-1">Capa personalizada</span>
          <span className="font-semibold">+{formatBRL(PRICE_CAPA)}</span>
        </li>
      )}
      {extras.includes("EXCLUSIVE_PAGE") && (
        <li className="flex items-center gap-2.5">
          <Globe className="size-4 shrink-0 text-accent" />
          <span className="flex-1">Página exclusiva</span>
          <span className="font-semibold">+{formatBRL(PRICE_PAGINA)}</span>
        </li>
      )}
    </ul>
  );
}

/**
 * Resumo do pedido com total dinâmico.
 * Desktop: card fixo (sticky). Mobile: compacto e expansível.
 */
export function OrderSummary({ bundle, extras, couponApplied }: SummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const total = orderTotal(bundle, extras);
  // Exibição apenas: a Cakto é quem aplica o desconto na hora da cobrança.
  const finalTotal = couponApplied ? couponPrice(total) : total;

  return (
    <div
      className="rounded-2xl border border-border bg-surface/80 backdrop-blur"
      style={{ boxShadow: "var(--shadow-frame)" }}
    >
      {/* Cabeçalho (sempre visível) */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 lg:cursor-default"
      >
        <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Seu pedido
        </span>
        <span className="flex items-center gap-2">
          <span className="offer-gradient-text font-display text-xl font-extrabold">
            {formatBRL(finalTotal)}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 lg:hidden",
              expanded && "rotate-180",
            )}
          />
        </span>
      </button>

      {/* Itens: mobile expandível, desktop sempre visível */}
      <div className={cn("px-5 pb-5", expanded ? "block" : "hidden", "lg:block")}>
        <div className="border-t border-border pt-4">
          <SummaryItems bundle={bundle} extras={extras} />
        </div>
        {couponApplied && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Preço normal</span>
            <span className="text-muted-foreground line-through decoration-primary/50">
              {formatBRL(total)}
            </span>
          </div>
        )}
        <div
          className={cn(
            "flex items-center justify-between border-t border-border pt-4",
            couponApplied ? "mt-2" : "mt-4",
          )}
        >
          <span className="text-sm font-bold">{couponApplied ? "Com 15% OFF" : "Total"}</span>
          <span className="offer-gradient-text font-display text-2xl font-extrabold">
            {formatBRL(finalTotal)}
          </span>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Pagamento único · Sem assinatura
        </p>
      </div>
    </div>
  );
}
