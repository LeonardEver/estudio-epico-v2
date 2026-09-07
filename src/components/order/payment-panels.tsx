"use client";

/**
 * Painéis de pagamento PREPARADOS para integração futura de gateway.
 *
 * Hoje o pagamento acontece no checkout seguro (Kiwify) — o fluxo atual da
 * etapa de pagamento redireciona para lá. Estes painéis desenham a UI do
 * pagamento in-page (PIX com QR Code/copia-e-cola/estado de espera e cartão
 * com campos tokenizados) para quando existir um gateway integrado.
 *
 * Para ativar: implemente o gateway e altere PAYMENT_GATEWAY_INTEGRATED para
 * true — o PaymentStep monta o painel do método selecionado automaticamente.
 * IMPORTANTE: nunca manipule dados de cartão no backend próprio; use a
 * tokenização/SDK do gateway.
 */
import { useState } from "react";
import { Copy, Loader2, QrCode, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

export const PAYMENT_GATEWAY_INTEGRATED = false;

/** PIX — QR Code, copia e cola e estado "Aguardando pagamento" com polling. */
export function PaymentPixPanel() {
  const [status] = useState<"AWAITING" | "CONFIRMED">("AWAITING");
  const pixCode = "PIX_CODE_AQUI"; // ← substituir pelo código retornado pelo gateway

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {/* QR Code real monta aqui (payload PIX do gateway) */}
        <div
          className="flex aspect-square w-44 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background"
          aria-label="QR Code PIX"
        >
          <QrCode className="size-16 text-muted-foreground" />
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          readOnly
          value={pixCode}
          className="h-11 flex-1 truncate rounded-xl bg-background text-xs"
        />
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(pixCode)}
          className="inline-flex min-w-24 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:border-input"
        >
          <Copy className="size-4" /> Copiar
        </button>
      </div>
      <p className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium">
        {status === "AWAITING" && (
          <>
            <Loader2 className="size-4 animate-spin text-accent" />
            Aguardando pagamento... (confirmação automática)
          </>
        )}
      </p>
    </div>
  );
}

/** Cartão — campos preparados para a tokenização/SDK segura do gateway. */
export function PaymentCardPanel() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="card-number" className="mb-1.5 block text-sm font-medium">
          Número do cartão
        </label>
        <Input
          id="card-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          className="h-12 rounded-xl bg-background"
        />
      </div>
      <div>
        <label htmlFor="card-name" className="mb-1.5 block text-sm font-medium">
          Nome impresso no cartão
        </label>
        <Input
          id="card-name"
          autoComplete="cc-name"
          placeholder="Como está no cartão"
          className="h-12 rounded-xl bg-background"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-expiry" className="mb-1.5 block text-sm font-medium">
            Validade
          </label>
          <Input
            id="card-expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            className="h-12 rounded-xl bg-background"
          />
        </div>
        <div>
          <label htmlFor="card-cvv" className="mb-1.5 block text-sm font-medium">
            CVV
          </label>
          <Input
            id="card-cvv"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            className="h-12 rounded-xl bg-background"
          />
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Seus dados são criptografados pelo gateway de pagamento.
      </p>
    </form>
  );
}
