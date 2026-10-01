"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, Music } from "lucide-react";
import { analytics, captureTrackingParams } from "@/lib/analytics";
import { briefSchema, type Extra, type OrderFormValues } from "@/lib/brief";
import { startCardPaymentFn, startPixPaymentFn } from "@/lib/cakto-payment";
import { CPF_ERROR_MESSAGE, cpfDigits, isValidCpf } from "@/lib/cpf";
import { isKnownCoupon } from "@/lib/coupon";
import { getFingerprint } from "@/lib/fingerprint";
import { INITIAL_ORDER, orderTotal, STEPS, type Step } from "./order-state";
import { StepsIndicator } from "./StepsIndicator";
import { OrderSummary } from "./OrderSummary";
import { MusicStep } from "./MusicStep";
import { ExtrasStep } from "./ExtrasStep";
import { PaymentStep } from "./PaymentStep";
import type { CardPayPayload, CardPayResult, PixChargeView } from "./payment-panels";

const SUBMIT_ERROR_MESSAGE = "Não conseguimos preparar seu pedido agora. Tente novamente.";

type FieldErrors = Partial<Record<keyof OrderFormValues, string>>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function OrderWizard({ initialBundle = false }: { initialBundle?: boolean }) {
  const navigate = useNavigate();
  const [values, setValues] = useState<OrderFormValues>(() => ({
    ...INITIAL_ORDER,
    bundle: initialBundle,
  }));
  const [step, setStep] = useState<Step>("MUSICA");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [charging, setCharging] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pixCharge, setPixCharge] = useState<PixChargeView | null>(null);
  const [pixAttempt, setPixAttempt] = useState(1);

  useEffect(() => {
    analytics.viewOrderPage();
  }, []);

  const set = useCallback(<K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  }, []);

  const toggleExtra = (extra: Extra) => {
    const added = !values.extras.includes(extra);
    set("extras", added ? [...values.extras, extra] : values.extras.filter((e) => e !== extra));
    analytics.toggleExtra(extra === "COVER" ? "capa" : "pagina", added);
  };

  const toggleBundle = (selected: boolean) => {
    set("bundle", selected);
    if (selected) analytics.selectBundle();
  };

  const selectMethod = (method: "PIX" | "CARD") => {
    set("paymentMethod", method);
    analytics.paymentMethodSelected(method);
  };

  const validateMusicStep = (): boolean => {
    const parsed = briefSchema.safeParse(values);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FieldErrors = {};
    for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
      const message = messages?.[0];
      if (message) fieldErrors[field as keyof FieldErrors] = message;
    }
    setErrors(fieldErrors);
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
    return false;
  };

  const goTo = (next: Step) => {
    if (next === "EXTRAS" || next === "PAGAMENTO") {
      if (!validateMusicStep()) return;
    }
    if (STEPS.findIndex((item) => item.id === next) > STEPS.findIndex((item) => item.id === step)) {
      analytics.orderStepCompleted(step);
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPaid = (orderId: string) => {
    analytics.purchaseConfirmed(orderId);
    navigate({ to: "/pedido-recebido", search: { order_id: orderId } });
  };

  /** Gera o PIX na Cakto e mostra o QR Code in-app. */
  const startPix = async () => {
    if (charging) return;
    if (!validateMusicStep()) {
      setStep("MUSICA");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const parsed = briefSchema.safeParse({ ...values, utm: captureTrackingParams() });
    if (!parsed.success) {
      setStep("MUSICA");
      return;
    }
    // Rede de segurança: o painel do PIX já valida o CPF, e o servidor rejeita
    // de novo. Isto só cobre o caso de a chamada escapar do painel.
    if (!isValidCpf(values.cpf)) {
      setSubmitError(CPF_ERROR_MESSAGE);
      return;
    }

    setCharging(true);
    setSubmitError(null);
    try {
      // Garante que "Gerando seu PIX..." fique visível.
      const [result] = await Promise.all([
        startPixPaymentFn({
          data: {
            ...parsed.data,
            cpf: cpfDigits(values.cpf),
            // O servidor só repassa o cupom conhecido; a Cakto decide o preço.
            coupon: values.coupon,
            fingerprint: getFingerprint(),
            pixAttempt,
          },
        }),
        sleep(700),
      ]);
      analytics.briefSubmitted(result.orderId);
      analytics.checkoutStarted(result.orderId);
      setPixCharge({
        orderId: result.orderId,
        chargeId: result.chargeId,
        qrCode: result.qrCode,
        expirationDate: result.expirationDate,
        amount: result.amount,
        baseAmount: result.baseAmount,
        discount: result.discount,
      });
    } catch (error) {
      // Dev: mostra o detalhe estruturado vindo da server fn (step + causa);
      // produção: mensagem amigável.
      const detail = error instanceof Error && import.meta.env.DEV ? error.message : null;
      setSubmitError(detail ?? SUBMIT_ERROR_MESSAGE);
    } finally {
      setCharging(false);
    }
  };

  /** Novo PIX após expiração/falha — nova cobrança (idempotência própria). */
  const retryPix = () => {
    setPixCharge(null);
    setPixAttempt((n) => n + 1);
    setSubmitError(null);
  };

  /** Cartão tokenizado pelo SDK no browser → cobrança via server fn. */
  const payCard = async (payload: CardPayPayload): Promise<CardPayResult> => {
    const parsed = briefSchema.safeParse({ ...values, utm: captureTrackingParams() });
    if (!parsed.success) {
      return { ok: false, message: SUBMIT_ERROR_MESSAGE };
    }

    try {
      const result = await startCardPaymentFn({
        data: {
          ...parsed.data,
          coupon: values.coupon,
          ...payload,
          fingerprint: getFingerprint(),
        },
      });
      analytics.briefSubmitted(result.orderId);
      analytics.checkoutStarted(result.orderId);

      if (result.status === "paid") {
        goToPaid(result.orderId);
        return { ok: true };
      }
      if (result.status === "declined") {
        return {
          ok: false,
          message: "Pagamento recusado pelo banco. Verifique os dados ou tente outro cartão.",
        };
      }
      if (result.status === "refused") {
        return {
          ok: false,
          message: "Não foi possível processar seu pagamento agora. Tente novamente.",
        };
      }
      return {
        ok: false,
        message: "Seu pagamento está em análise. Você será avisado assim que for confirmado.",
      };
    } catch {
      return { ok: false, message: SUBMIT_ERROR_MESSAGE };
    }
  };

  const currentIndex = STEPS.findIndex((s) => s.id === step);
  const couponApplied = isKnownCoupon(values.coupon);

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* Barra superior compacta */}
      <header className="border-b border-border bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Music className="size-5 text-accent" />
            <span className="font-display font-bold tracking-widest text-foreground">
              ESTUDIO ÉPICO
            </span>
          </Link>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-accent" /> Compra segura
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12 lg:grid lg:grid-cols-[1fr_360px] lg:gap-12">
        {/* Coluna principal */}
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight font-extrabold sm:text-4xl">
            Crie sua música personalizada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Você está a poucos passos de ter sua própria música.
          </p>

          <div className="mt-7">
            <StepsIndicator
              current={step}
              onGoTo={(s) => {
                const targetIndex = STEPS.findIndex((x) => x.id === s);
                if (targetIndex <= currentIndex) goTo(s);
              }}
            />
          </div>

          <div className="mt-8">
            {step === "MUSICA" && <MusicStep values={values} errors={errors} onChange={set} />}
            {step === "EXTRAS" && (
              <ExtrasStep
                values={values}
                onToggleExtra={toggleExtra}
                onToggleBundle={toggleBundle}
              />
            )}
            {step === "PAGAMENTO" && (
              <PaymentStep
                paymentMethod={values.paymentMethod}
                onSelectMethod={selectMethod}
                total={orderTotal(values.bundle, values.extras)}
                cpf={values.cpf}
                onCpfChange={(value) => set("cpf", value)}
                coupon={values.coupon}
                onCouponChange={(value) => set("coupon", value)}
                pixCharge={pixCharge}
                charging={charging}
                submitError={submitError}
                onStartPix={startPix}
                onPixPaid={goToPaid}
                onRetryPix={retryPix}
                onPayCard={payCard}
              />
            )}
          </div>

          {/* Navegação entre etapas */}
          <div className="mt-8 flex items-center gap-3">
            {step !== "MUSICA" && (
              <button
                type="button"
                onClick={() => goTo(step === "EXTRAS" ? "MUSICA" : "EXTRAS")}
                disabled={charging}
                className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-display text-sm font-bold tracking-wide text-foreground transition-colors hover:border-input disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </button>
            )}
            {step !== "PAGAMENTO" && (
              <button
                type="button"
                onClick={() => goTo(step === "MUSICA" ? "EXTRAS" : "PAGAMENTO")}
                className="group inline-flex min-h-13 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-base font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] sm:flex-none sm:px-8"
                style={{ boxShadow: "var(--shadow-offer)" }}
              >
                Continuar
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Resumo: sticky no desktop, expansível no mobile */}
        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-8">
            <OrderSummary
              bundle={values.bundle}
              extras={values.extras}
              couponApplied={couponApplied}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
