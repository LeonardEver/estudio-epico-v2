"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { Check, ChevronDown, Loader2, Lock, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { analytics, captureTrackingParams } from "@/lib/analytics";
import {
  briefSchema,
  GENRES,
  LYRICS_PREFERENCES,
  MOODS,
  type BriefFormValues,
  type Mood,
} from "@/lib/brief";
import { createOrderFn } from "@/lib/create-order";

const INITIAL_VALUES: BriefFormValues = {
  name: "",
  email: "",
  whatsapp: "",
  lyricsPreference: "CREATE_LYRICS",
  lyrics: "",
  description: "",
  genre: "Pop",
  genreOther: "",
  mood: [],
};

const SUBMIT_ERROR_MESSAGE = "Não conseguimos preparar seu pedido agora. Tente novamente.";

type FieldErrors = Partial<Record<keyof BriefFormValues, string>>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

export function BriefingModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [values, setValues] = useState<BriefFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next && submitting) return; // don't close mid-request
    if (next) analytics.briefingOpened();
    onOpenChange(next);
  }

  function set<K extends keyof BriefFormValues>(key: K, value: BriefFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  }

  function toggleMood(mood: Mood) {
    set(
      "mood",
      values.mood.includes(mood) ? values.mood.filter((m) => m !== mood) : [...values.mood, mood],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // prevent duplicate submissions

    const parsed = briefSchema.safeParse({ ...values, utm: captureTrackingParams() });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        const message = messages?.[0];
        if (message) fieldErrors[field as keyof BriefFormValues] = message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Guarantee "Preparando seu pedido..." is visible briefly, then redirect.
      const [result] = await Promise.all([createOrderFn({ data: parsed.data }), sleep(700)]);
      analytics.briefSubmitted(result.orderId);
      analytics.checkoutRedirect(result.orderId);
      window.location.assign(result.checkoutUrl);
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGE);
      setSubmitting(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 bg-surface outline-none duration-300 data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in sm:inset-x-auto sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl sm:border"
          style={{ boxShadow: "var(--shadow-frame)" }}
        >
          <div aria-hidden className="h-1 shrink-0 bg-[image:var(--gradient-price)]" />

          {/* Header */}
          <div className="relative shrink-0 border-b border-border px-5 pt-5 pb-4 sm:px-7">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              <Sparkles className="size-3.5" /> Seu pedido personalizado
            </p>
            <DialogPrimitive.Title className="mt-2 font-display text-xl leading-tight font-extrabold sm:text-2xl">
              Conte sua ideia. <span className="offer-gradient-text">A gente produz.</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground">
              Leva menos de 2 minutos. Nenhuma informação desnecessária.
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              aria-label="Fechar"
              className="absolute top-4 right-4 rounded-full border border-border bg-background/60 p-2 text-muted-foreground cursor-pointer transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            {/* Scrollable fields */}
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              {/* A) Lyrics */}
              <div role="radiogroup" aria-label="Como você quer criar sua música?">
                <SectionLabel>Como você quer criar sua música?</SectionLabel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {LYRICS_PREFERENCES.map((option) => {
                    const selected = values.lyricsPreference === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => set("lyricsPreference", option.value)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-colors cursor-pointer",
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-input hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selected ? "border-primary" : "border-input",
                          )}
                        >
                          {selected && <span className="size-2 rounded-full bg-primary" />}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {values.lyricsPreference === "HAS_LYRICS" && (
                  <div className="mt-3">
                    <label htmlFor="brief-lyrics" className="mb-1.5 block text-sm font-medium">
                      Conte ou cole sua letra
                    </label>
                    <Textarea
                      id="brief-lyrics"
                      value={values.lyrics}
                      onChange={(e) => set("lyrics", e.target.value)}
                      placeholder="Cole aqui a letra da sua música..."
                      rows={4}
                      maxLength={4000}
                      aria-invalid={!!errors.lyrics}
                      aria-describedby={errors.lyrics ? "brief-lyrics-error" : undefined}
                      className="bg-background"
                    />
                    <FieldError id="brief-lyrics-error" message={errors.lyrics} />
                  </div>
                )}
              </div>

              {/* B) Description */}
              <div>
                <label htmlFor="brief-description" className="mb-1.5 block text-sm font-medium">
                  Conte brevemente sua ideia <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="brief-description"
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Ex: Quero uma música romântica para minha esposa contando nossa história..."
                  rows={3}
                  maxLength={2000}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "brief-description-error" : undefined}
                  className="bg-background"
                />
                <FieldError id="brief-description-error" message={errors.description} />
              </div>

              {/* C) Genre */}
              <div>
                <label htmlFor="brief-genre" className="mb-1.5 block text-sm font-medium">
                  Gênero musical
                </label>
                <div className="relative">
                  <select
                    id="brief-genre"
                    value={values.genre}
                    onChange={(e) => set("genre", e.target.value as BriefFormValues["genre"])}
                    className={cn(
                      "w-full appearance-none rounded-xl border bg-background px-3.5 py-3 text-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                      errors.genre ? "border-destructive" : "border-input",
                    )}
                    aria-invalid={!!errors.genre}
                  >
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <FieldError id="brief-genre-error" message={errors.genre} />
                {values.genre === "Outro" && (
                  <div className="mt-2.5">
                    <Input
                      id="brief-genre-other"
                      value={values.genreOther}
                      onChange={(e) => set("genreOther", e.target.value)}
                      placeholder="Digite o gênero musical"
                      maxLength={80}
                      aria-invalid={!!errors.genreOther}
                      aria-describedby={errors.genreOther ? "brief-genre-other-error" : undefined}
                      className="h-11 rounded-xl bg-background"
                    />
                    <FieldError id="brief-genre-other-error" message={errors.genreOther} />
                  </div>
                )}
              </div>

              {/* D) Mood */}
              <div>
                <SectionLabel>Clima da música (escolha um ou mais)</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => {
                    const selected = values.mood.includes(mood);
                    return (
                      <button
                        key={mood}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleMood(mood)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer sm:text-sm",
                          selected
                            ? "border-primary bg-primary/15 text-foreground shadow-[0_0_16px_-6px_var(--primary-glow)]"
                            : "border-border bg-background text-muted-foreground hover:border-input hover:text-foreground",
                        )}
                      >
                        {selected && <Check className="size-3.5 text-accent" />}
                        {mood}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="brief-mood-error" message={errors.mood} />
              </div>

              {/* E) Customer */}
              <div className="space-y-4">
                <SectionLabel>Seus dados (para envio da música)</SectionLabel>
                <div>
                  <label htmlFor="brief-name" className="mb-1.5 block text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="brief-name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Seu nome completo"
                    maxLength={120}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "brief-name-error" : undefined}
                    className="h-11 rounded-xl bg-background"
                  />
                  <FieldError id="brief-name-error" message={errors.name} />
                </div>
                <div>
                  <label htmlFor="brief-email" className="mb-1.5 block text-sm font-medium">
                    E-mail <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="brief-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="voce@email.com"
                    maxLength={200}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "brief-email-error" : undefined}
                    className="h-11 rounded-xl bg-background"
                  />
                  <FieldError id="brief-email-error" message={errors.email} />
                </div>
                <div>
                  <label htmlFor="brief-whatsapp" className="mb-1.5 block text-sm font-medium">
                    WhatsApp{" "}
                    <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                  </label>
                  <Input
                    id="brief-whatsapp"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={values.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="(11) 99999-9999"
                    maxLength={40}
                    aria-invalid={!!errors.whatsapp}
                    aria-describedby={errors.whatsapp ? "brief-whatsapp-error" : undefined}
                    className="h-11 rounded-xl bg-background"
                  />
                  <FieldError id="brief-whatsapp-error" message={errors.whatsapp} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-surface px-5 pt-4 pb-5 sm:px-7 sm:pb-6">
              {submitError && (
                <div
                  role="alert"
                  className="mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium"
                >
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-base font-bold tracking-wide text-primary-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                style={{ boxShadow: "var(--shadow-offer)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Preparando seu pedido...
                  </>
                ) : (
                  <>
                    CONTINUAR PARA PAGAMENTO
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                Você será direcionado para um checkout seguro.
              </p>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
