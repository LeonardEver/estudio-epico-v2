"use client";

import { useEffect, useState } from "react";
import { Check, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { analytics } from "@/lib/analytics";
import {
  COUPON_CODE,
  COUPON_DISCOUNT,
  couponPrice,
  couponSavings,
  isKnownCoupon,
} from "@/lib/coupon";
import { formatBRL } from "@/lib/format";

type CouponCardProps = {
  /** Total do pedido SEM desconto (com extras/pacote). */
  total: number;
  /** Código digitado — vive no estado do wizard. */
  value: string;
  onChange: (value: string) => void;
};

const PERCENT = `${Math.round(COUPON_DISCOUNT * 100)}%`;

/**
 * Campanha de boas-vindas PRIMEIRA15.
 *
 * Aparece só no passo de pagamento — depois de o visitante percorrer a landing
 * e preencher o briefing, nunca como popup na entrada. O desconto exibido é
 * uma PREVISÃO: quem aplica de fato é a Cakto, e o valor final cobrado chega
 * na resposta da cobrança (`amount`).
 *
 * "Primeira compra" é o nome da campanha: a Cakto não expõe trava de uma-vez-
 * por-CPF, então nada aqui promete esse limite.
 */
export function CouponCard({ total, value, onChange }: CouponCardProps) {
  const [error, setError] = useState<string | null>(null);
  const applied = isKnownCoupon(value);

  useEffect(() => {
    analytics.couponViewed();
  }, []);

  const handleApply = () => {
    if (isKnownCoupon(value)) {
      setError(null);
      analytics.couponApplied();
      return;
    }
    setError("Cupom inválido ou expirado.");
  };

  const finalPrice = couponPrice(total);
  const savings = couponSavings(total);

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5 text-left">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
        <Gift className="size-3.5" /> Primeira compra
      </p>
      <p className="mt-2 text-sm font-medium">Ganhe {PERCENT} OFF na sua primeira compra.</p>

      {applied ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Check className="size-4" /> {PERCENT} OFF aplicado!
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Preço normal</span>
              <span className="text-muted-foreground line-through decoration-primary/50">
                {formatBRL(total)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Desconto ({PERCENT})</span>
              <span className="font-medium text-accent">−{formatBRL(savings)}</span>
            </li>
            <li className="flex items-center justify-between gap-3 border-t border-border pt-1.5">
              <span className="font-semibold">Você paga</span>
              <span className="offer-gradient-text font-display text-xl font-extrabold">
                {formatBRL(finalPrice)}
              </span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setError(null);
            }}
            className="mt-3 cursor-pointer text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Remover cupom
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex gap-2">
            <Input
              aria-label="Código do cupom"
              placeholder="Cupom"
              autoComplete="off"
              autoCapitalize="characters"
              value={value}
              onChange={(e) => {
                onChange(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
              className="h-11 flex-1 rounded-xl bg-background uppercase"
            />
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:border-accent/70 hover:text-accent"
            >
              Aplicar
            </button>
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-xs font-medium text-destructive">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Cupom: <span className="font-semibold text-foreground">{COUPON_CODE}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
