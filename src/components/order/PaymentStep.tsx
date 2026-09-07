"use client";

import { CreditCard, Loader2, Lock, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/brief";
import { PaymentCardPanel, PaymentPixPanel, PAYMENT_GATEWAY_INTEGRATED } from "./payment-panels";

type PaymentStepProps = {
  paymentMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
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
  onSubmit,
  submitting,
  submitError,
}: PaymentStepProps) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl leading-tight font-bold sm:text-3xl">
          Como você quer <span className="offer-gradient-text">pagar?</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Você conclui o pagamento no checkout seguro — leva menos de 1 minuto.
        </p>

        {/* Métodos de pagamento */}
        <div
          className="mt-6 grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-label="Método de pagamento"
        >
          {METHODS.map((method) => {
            const selected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectMethod(method.id)}
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

        {/* Painel do método selecionado — montado quando o gateway integrado existir */}
        {PAYMENT_GATEWAY_INTEGRATED && (
          <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-5">
            {paymentMethod === "PIX" ? <PaymentPixPanel /> : <PaymentCardPanel />}
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="group inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-base font-bold tracking-wide text-primary-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:text-lg"
          style={{ boxShadow: "var(--shadow-offer)" }}
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Preparando seu pedido...
            </>
          ) : (
            <>
              FINALIZAR PEDIDO
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </>
          )}
        </button>

        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-accent" /> Checkout seguro
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
