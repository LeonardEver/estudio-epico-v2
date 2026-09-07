"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Music } from "lucide-react";
import { analytics, captureTrackingParams } from "@/lib/analytics";
import { briefSchema, type Extra, type OrderFormValues } from "@/lib/brief";
import { createOrderFn } from "@/lib/create-order";
import { INITIAL_ORDER, STEPS, type Step } from "./order-state";
import { StepsIndicator } from "./StepsIndicator";
import { OrderSummary } from "./OrderSummary";
import { MusicStep } from "./MusicStep";
import { ExtrasStep } from "./ExtrasStep";
import { PaymentStep } from "./PaymentStep";

const SUBMIT_ERROR_MESSAGE = "Não conseguimos preparar seu pedido agora. Tente novamente.";

type FieldErrors = Partial<Record<keyof OrderFormValues, string>>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function OrderWizard() {
  const [values, setValues] = useState<OrderFormValues>(INITIAL_ORDER);
  const [step, setStep] = useState<Step>("MUSICA");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    return false;
  };

  const goTo = (next: Step) => {
    if (next === "EXTRAS" || next === "PAGAMENTO") {
      if (!validateMusicStep()) return;
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (submitting) return;
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

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Garante que "Preparando seu pedido..." fique visível antes do redirect.
      const [result] = await Promise.all([createOrderFn({ data: parsed.data }), sleep(700)]);
      analytics.briefSubmitted(result.orderId);
      analytics.checkoutRedirect(result.orderId);
      window.location.assign(result.checkoutUrl);
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGE);
      setSubmitting(false);
    }
  };

  const currentIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <main className="min-h-screen bg-background">
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
                onSubmit={submit}
                submitting={submitting}
                submitError={submitError}
              />
            )}
          </div>

          {/* Navegação entre etapas */}
          <div className="mt-8 flex items-center gap-3">
            {step !== "MUSICA" && (
              <button
                type="button"
                onClick={() => goTo(step === "EXTRAS" ? "MUSICA" : "EXTRAS")}
                disabled={submitting}
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
            <OrderSummary bundle={values.bundle} extras={values.extras} />
          </div>
        </aside>
      </div>
    </main>
  );
}
