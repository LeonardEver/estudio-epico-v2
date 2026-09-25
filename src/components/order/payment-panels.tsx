"use client";

/**
 * Painéis de pagamento in-app integrados à Cakto.
 *
 * PIX: QR Code gerado no cliente a partir do BR Code (copia-e-cola) retornado
 * pela Cakto, botão copiar, contagem de expiração e polling de status até a
 * confirmação (nunca confiamos no browser — o status vem da API via server fn).
 *
 * Cartão: os dados NUNCA tocam o backend próprio — o SDK Cakto roda no browser
 * e troca o cartão por um token de uso único; a sessão de antifraude (Nethone)
 * também é gerada pelo SDK.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Copy, CreditCard, Loader2, Lock, QrCode, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { getChargeStatusFn } from "@/lib/cakto-payment";
import { loadCaktoSdk } from "@/lib/cakto-sdk";
import { cpfDigits, formatCpf, isValidCpf } from "@/lib/cpf";
import { formatBRL } from "@/lib/format";

export type PixChargeView = {
  orderId: string;
  chargeId: string;
  qrCode: string;
  expirationDate: string | null;
  /** Valor REAL cobrado, devolvido pela Cakto ("56.95") — fonte de verdade. */
  amount: string;
  /** Valor da oferta antes do desconto ("67.00"). */
  baseAmount: string;
  /** Desconto aplicado ("10.05"); "0.00" quando não houve cupom. */
  discount: string;
};

// ---------------------------------------------------------------------------
// PIX
// ---------------------------------------------------------------------------

type PaymentPixPanelProps = {
  pix: PixChargeView;
  onPaid: (orderId: string) => void;
  /** O PIX expirou ou falhou — gera um novo (nova cobrança). */
  onExpired: () => void;
};

const POLL_INTERVAL_MS = 4000;

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PaymentPixPanel({ pix, onPaid, onExpired }: PaymentPixPanelProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(() =>
    pix.expirationDate
      ? Math.max(0, Math.floor((new Date(pix.expirationDate).getTime() - Date.now()) / 1000))
      : null,
  );
  const [terminal, setTerminal] = useState<"expired" | "failed" | null>(null);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  // QR Code (imagem) gerado a partir do BR Code — a Cakto devolve só o texto.
  useEffect(() => {
    let cancelled = false;
    if (!pix.qrCode) return;
    QRCode.toDataURL(pix.qrCode, { width: 352, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        // Sem imagem o cliente ainda pode usar o copia-e-cola.
      });
    return () => {
      cancelled = true;
    };
  }, [pix.qrCode]);

  // Contagem regressiva até a expiração.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => (r === null ? null : r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling do status via API (servidor consulta a Cakto — nunca o browser).
  useEffect(() => {
    if (terminal) return;
    let stopped = false;
    let paid = false;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      if (stopped) return;
      const expired = pix.expirationDate && Date.now() > new Date(pix.expirationDate).getTime();
      if (expired) {
        setTerminal("expired");
        return;
      }
      const { status } = await getChargeStatusFn({ data: { chargeId: pix.chargeId } });
      if (stopped) return;
      if (status === "paid") {
        paid = true;
        onPaidRef.current(pix.orderId);
        return;
      }
      if (status === "failed" || status === "refunded") {
        setTerminal("failed");
        return;
      }
      timer = setTimeout(check, POLL_INTERVAL_MS);
    };

    timer = setTimeout(check, 1500); // primeira checagem mais cedo
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pix.chargeId, pix.expirationDate, terminal]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(pix.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível — o input está selecionável.
    }
  }, [pix.qrCode]);

  if (terminal) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {terminal === "expired"
            ? "Este PIX expirou. Gere um novo para continuar."
            : "Não confirmamos o pagamento deste PIX."}
        </p>
        <button
          type="button"
          onClick={onExpired}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-input"
        >
          <RefreshCw className="size-4" /> Gerar novo PIX
        </button>
      </div>
    );
  }

  // Valores vêm da cobrança da Cakto — não de uma conta feita no navegador.
  const finalAmount = Number(pix.amount);
  const baseAmount = Number(pix.baseAmount);
  const discounted = Number(pix.discount) > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center">
        {discounted && Number.isFinite(baseAmount) && (
          <p className="text-xs text-muted-foreground">
            <span className="line-through decoration-primary/50">{formatBRL(baseAmount)}</span> ·
            desconto aplicado
          </p>
        )}
        <p className="offer-gradient-text font-display text-2xl font-extrabold">
          {Number.isFinite(finalAmount) ? formatBRL(finalAmount) : pix.amount}
        </p>
      </div>

      <div className="flex justify-center">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="QR Code PIX"
            className="size-52 rounded-2xl border border-border bg-white p-2"
          />
        ) : (
          <div
            className="flex aspect-square w-52 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background"
            aria-label="QR Code PIX"
          >
            <QrCode className="size-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          readOnly
          value={pix.qrCode}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 flex-1 truncate rounded-xl bg-background text-xs"
          aria-label="Código PIX copia e cola"
        />
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex min-w-24 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:border-input"
        >
          <Copy className="size-4" /> {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium">
        <Loader2 className="size-4 animate-spin text-accent" />
        Aguardando pagamento...{" "}
        {remaining !== null && remaining > 0 && (
          <span className="text-muted-foreground">(expira em {formatCountdown(remaining)})</span>
        )}
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Aprovação automática — não feche esta página até confirmar.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cartão
// ---------------------------------------------------------------------------

export type CardPayPayload = {
  /** Token de uso único gerado pelo SDK Cakto no browser. */
  cardToken: string;
  installments: number;
  antifraudRef: string;
  cpf: string;
};

export type CardPayResult = { ok: boolean; message?: string };

type PaymentCardPanelProps = {
  total: number;
  /** CPF controlado pelo wizard — o mesmo campo serve PIX e cartão. */
  cpf: string;
  onCpfChange: (value: string) => void;
  onPay: (payload: CardPayPayload) => Promise<CardPayResult>;
};

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function PaymentCardPanel({ total, cpf, onCpfChange, onPay }: PaymentCardPanelProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Antifraude: quanto antes iniciar, mais sinais coleta enquanto o cliente
  // preenche o formulário.
  useEffect(() => {
    let cancelled = false;
    loadCaktoSdk()
      .then((sdk) => {
        if (cancelled) return;
        return sdk.initAntifraud().catch(() => undefined);
      })
      .catch(() => undefined); // o erro real aparece ao enviar
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = (): string | null => {
    if (onlyDigits(cardNumber).length < 13) return "Informe o número do cartão completo.";
    if (holderName.trim().length < 3) return "Informe o nome impresso no cartão.";
    const parsed = parseExpiry(expiry);
    if (!parsed) return "Informe a validade no formato MM/AA.";
    const now = new Date();
    const nowYm = now.getFullYear() * 100 + (now.getMonth() + 1);
    if (parsed.year * 100 + parsed.month < nowYm) return "Este cartão está vencido.";
    if (onlyDigits(cvv).length < 3) return "Informe o CVV (3 a 4 dígitos).";
    if (!isValidCpf(cpf)) return "Informe um CPF válido.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const sdk = await loadCaktoSdk();
      const parsed = parseExpiry(expiry)!;
      // Token de uso único — o backend nunca recebe os dados do cartão.
      const { cardToken } = await sdk.createToken({
        holderName: holderName.trim(),
        cardNumber: onlyDigits(cardNumber),
        cvv: onlyDigits(cvv),
        expMonth: String(parsed.month).padStart(2, "0"),
        expYear: String(parsed.year % 100).padStart(2, "0"),
      });
      await sdk.completeAntifraudProfile();
      const antifraudRef = sdk.getAntifraudReference();

      const result = await onPay({
        cardToken,
        installments,
        antifraudRef,
        cpf: cpfDigits(cpf),
      });
      if (result.ok) {
        sdk.cleanupAntifraud();
        return;
      }
      setError(result.message ?? "Não foi possível processar o pagamento. Tente novamente.");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível processar o pagamento. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="card-number" className="mb-1.5 block text-sm font-medium">
          Número do cartão
        </label>
        <Input
          id="card-number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
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
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
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
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
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
            value={cvv}
            onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
            className="h-12 rounded-xl bg-background"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-cpf" className="mb-1.5 block text-sm font-medium">
            CPF do titular
          </label>
          <Input
            id="card-cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => onCpfChange(formatCpf(e.target.value))}
            className="h-12 rounded-xl bg-background"
          />
        </div>
        <div>
          <label htmlFor="card-installments" className="mb-1.5 block text-sm font-medium">
            Parcelas
          </label>
          <select
            id="card-installments"
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="h-12 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}x de {total / n >= 1 ? `R$${(total / n).toFixed(2).replace(".", ",")}` : "R$—"}
                {n === 1 ? " à vista" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-base font-bold tracking-wide text-primary-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        style={{ boxShadow: "var(--shadow-offer)" }}
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Processando pagamento...
          </>
        ) : (
          <>
            <CreditCard className="size-5" />
            PAGAR AGORA
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Seus dados são criptografados pelo gateway de pagamento.
      </p>
    </form>
  );
}
