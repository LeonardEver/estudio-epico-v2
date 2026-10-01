"use client";

import { useState } from "react";
import { CreditCard, Loader2, Lock, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CPF_ERROR_MESSAGE, formatCpf, isValidCpf } from "@/lib/cpf";
import type { PaymentMethod } from "@/lib/brief";
import { CouponCard } from "./CouponCard";
import { couponPrice, isKnownCoupon } from "@/lib/coupon";
import {
  PaymentCardPanel,
  PaymentPixPanel,
  type CardPayPayload,
  type CardPayResult,
  type PixChargeView,
} from "./payment-panels";

type PaymentStepProps = {
  paymentMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  /** Total do pedido (para o seletor de parcelas). */
  total: number;
  /** CPF do titular — um único campo serve PIX e cartão (não pedimos duas vezes). */
  cpf: string;
  onCpfChange: (value: string) => void;
  /** Cupom digitado (estado do wizard). */
  coupon: string;
  onCouponChange: (value: string) => void;
  /** Cobrança PIX ativa (null enquanto o cliente ainda não gerou). */
  pixCharge: PixChargeView | null;
  /** Gerando o PIX na Cakto. */
  charging: boolean;
  submitError: string | null;
  onStartPix: () => void;
  onPixPaid: (orderId: string) => void;
  /** Gera um novo PIX após expiração/falha. */
  onRetryPix: () => void;
  /** Submete o cartão tokenizado pelo SDK (nunca os dados brutos). */
  onPayCard: (payload: CardPayPayload) => Promise<CardPayResult>;
};

const METHODS: {
  id: PaymentMethod;
  icon: typeof QrCode;
  label: string;
  note: string;
  badge?: string;
}[] = [
  { id: "PIX", icon: QrCode, label: "PIX", note: "Aprovação na hora", badge: "Mais rápido" },
  { id: "CARD", icon: CreditCard, label: "Cartão de crédito", note: "Em até 12x" },
];

export function PaymentStep({
  paymentMethod,
  onSelectMethod,
  total,
  cpf,
  onCpfChange,
  coupon,
  onCouponChange,
  pixCharge,
  charging,
  submitError,
  onStartPix,
  onPixPaid,
  onRetryPix,
  onPayCard,
}: PaymentStepProps) {
  // O CPF é validado aqui para dar retorno imediato no campo; o servidor
  // revalida antes de qualquer cobrança (nunca confiamos só no navegador).
  const [cpfError, setCpfError] = useState<string | null>(null);

  const handleStartPix = () => {
    if (!isValidCpf(cpf)) {
      setCpfError(CPF_ERROR_MESSAGE);
      requestAnimationFrame(() => document.getElementById("pix-cpf")?.focus());
      return;
    }
    setCpfError(null);
    onStartPix();
  };

  return (
    <div className="space-y-7">
      {/* Campanha de boas-vindas: só aqui, depois do briefing preenchido. */}
      <CouponCard total={total} value={coupon} onChange={onCouponChange} />

      <div>
        <h2 className="font-display text-2xl leading-tight font-bold sm:text-3xl">
          Como você quer <span className="offer-gradient-text">pagar?</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pague direto aqui, com segurança — sem sair da página.
        </p>

        {/* Métodos de pagamento */}
        <div
          className="mt-6 grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-label="Método de pagamento"
        >
          {METHODS.map((method, index) => {
            const selected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectMethod(method.id)}
                onKeyDown={(event) => {
                  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
                    return;
                  event.preventDefault();
                  const nextIndex = index === 0 ? 1 : 0;
                  const nextMethod = METHODS[nextIndex];
                  if (nextMethod) onSelectMethod(nextMethod.id);
                  event.currentTarget.parentElement
                    ?.querySelectorAll<HTMLButtonElement>("button")
                    [nextIndex]?.focus();
                }}
                className={cn(
                  "relative cursor-pointer rounded-2xl border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-input",
                )}
              >
                {method.badge && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-[image:var(--gradient-price)] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
                    {method.badge}
                  </span>
                )}
                <method.icon
                  className={cn("size-6", selected ? "text-accent" : "text-muted-foreground")}
                />
                <p className="mt-3 font-display text-base font-bold">{method.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{method.note}</p>
              </button>
            );
          })}
        </div>

        {/* Painel do método selecionado */}
        {paymentMethod === "PIX" && (
          <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-5">
            {pixCharge ? (
              <PaymentPixPanel pix={pixCharge} onPaid={onPixPaid} onExpired={onRetryPix} />
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="pix-cpf" className="mb-1.5 block text-sm font-medium">
                    CPF
                  </label>
                  <Input
                    id="pix-cpf"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => {
                      onCpfChange(formatCpf(e.target.value));
                      setCpfError(null);
                    }}
                    aria-invalid={Boolean(cpfError)}
                    aria-describedby={cpfError ? "pix-cpf-error" : undefined}
                    className="h-12 rounded-xl bg-background"
                  />
                  {cpfError && (
                    <p
                      id="pix-cpf-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-destructive"
                    >
                      {cpfError}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    O CPF do titular é exigido para emitir a cobrança.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartPix}
                  disabled={charging}
                  className="group inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-base font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:text-lg"
                  style={{ boxShadow: "var(--shadow-offer)" }}
                >
                  {charging ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Gerando seu Pix…
                    </>
                  ) : (
                    <>
                      <QrCode className="size-5" />
                      GERAR PIX AGORA
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {paymentMethod === "CARD" && (
          <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-5">
            <PaymentCardPanel
              total={isKnownCoupon(coupon) ? couponPrice(total) : total}
              cpf={cpf}
              onCpfChange={onCpfChange}
              onPay={onPayCard}
            />
          </div>
        )}
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium"
        >
          {submitError}
        </div>
      )}

      <div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-accent" /> Pagamento via Cakto
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-accent" /> Pagamento único
          </li>
          <li className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-accent" /> Entrega digital
          </li>
        </ul>
      </div>
    </div>
  );
}
