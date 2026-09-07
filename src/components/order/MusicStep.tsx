"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GENRES, type OrderFormValues } from "@/lib/brief";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

type MusicStepProps = {
  values: OrderFormValues;
  errors: Partial<Record<keyof OrderFormValues, string>>;
  onChange: <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => void;
};

export function MusicStep({ values, errors, onChange }: MusicStepProps) {
  const [showLyrics, setShowLyrics] = useState(false);

  return (
    <div className="space-y-7">
      {/* Dados básicos */}
      <div>
        <SectionLabel>Seus dados (para envio da música)</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="order-name" className="mb-1.5 block text-sm font-medium">
              Nome <span className="text-destructive">*</span>
            </label>
            <Input
              id="order-name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Seu nome completo"
              maxLength={120}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "order-name-error" : undefined}
              className="h-12 rounded-xl bg-background"
            />
            <FieldError id="order-name-error" message={errors.name} />
          </div>
          <div>
            <label htmlFor="order-whatsapp" className="mb-1.5 block text-sm font-medium">
              WhatsApp <span className="text-destructive">*</span>
            </label>
            <Input
              id="order-whatsapp"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={values.whatsapp}
              onChange={(e) => onChange("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999"
              maxLength={40}
              aria-invalid={!!errors.whatsapp}
              aria-describedby={errors.whatsapp ? "order-whatsapp-error" : undefined}
              className="h-12 rounded-xl bg-background"
            />
            <FieldError id="order-whatsapp-error" message={errors.whatsapp} />
          </div>
          <div>
            <label htmlFor="order-email" className="mb-1.5 block text-sm font-medium">
              E-mail <span className="text-destructive">*</span>
            </label>
            <Input
              id="order-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="voce@email.com"
              maxLength={200}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "order-email-error" : undefined}
              className="h-12 rounded-xl bg-background"
            />
            <FieldError id="order-email-error" message={errors.email} />
          </div>
        </div>
      </div>

      {/* Sobre sua música */}
      <div>
        <SectionLabel>Sobre sua música</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="order-recipient" className="mb-1.5 block text-sm font-medium">
              Para quem é essa música? <span className="text-destructive">*</span>
            </label>
            <Input
              id="order-recipient"
              type="text"
              value={values.recipient ?? ""}
              onChange={(e) => onChange("recipient", e.target.value)}
              placeholder="Ex.: Alice"
              maxLength={120}
              aria-invalid={!!errors.recipient}
              className="h-12 rounded-xl bg-background"
            />
            <FieldError id="order-recipient-error" message={errors.recipient} />
          </div>
          <div>
            <label htmlFor="order-occasion" className="mb-1.5 block text-sm font-medium">
              Qual é a ocasião? <span className="text-destructive">*</span>
            </label>
            <Input
              id="order-occasion"
              type="text"
              value={values.occasion ?? ""}
              onChange={(e) => onChange("occasion", e.target.value)}
              placeholder="Ex.: Aniversário"
              maxLength={120}
              aria-invalid={!!errors.occasion}
              className="h-12 rounded-xl bg-background"
            />
            <FieldError id="order-occasion-error" message={errors.occasion} />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="order-description" className="mb-1.5 block text-sm font-medium">
            Conte sua ideia <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="order-description"
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Conte a história, a mensagem ou o contexto: quem é essa pessoa, o que você quer dizer, como imagina o clima da música..."
            rows={5}
            maxLength={2000}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "order-description-error" : undefined}
            className="bg-background"
          />
          <FieldError id="order-description-error" message={errors.description} />
        </div>
      </div>

      {/* Estilo musical */}
      <div>
        <SectionLabel>Estilo musical</SectionLabel>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {GENRES.map((genre) => {
            const selected = values.genre === genre;
            return (
              <button
                key={genre}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange("genre", genre)}
                className={cn(
                  "cursor-pointer rounded-xl border px-2 py-3 text-xs font-medium transition-colors sm:text-sm",
                  selected
                    ? "border-primary bg-primary/15 text-foreground shadow-[0_0_16px_-6px_var(--primary-glow)]"
                    : "border-border bg-background text-muted-foreground hover:border-input hover:text-foreground",
                )}
              >
                {genre}
              </button>
            );
          })}
        </div>
        {values.genre === "Outro" && (
          <div className="mt-2.5">
            <Input
              id="order-genre-other"
              value={values.genreOther}
              onChange={(e) => onChange("genreOther", e.target.value)}
              placeholder="Digite o gênero musical"
              maxLength={80}
              aria-invalid={!!errors.genreOther}
              aria-describedby={errors.genreOther ? "order-genre-other-error" : undefined}
              className="h-12 rounded-xl bg-background"
            />
            <FieldError id="order-genre-other-error" message={errors.genreOther} />
          </div>
        )}
        <FieldError id="order-genre-error" message={errors.genre} />
      </div>

      {/* Progressive disclosure: letra própria */}
      <div>
        <button
          type="button"
          onClick={() => setShowLyrics((v) => !v)}
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-foreground"
          aria-expanded={showLyrics}
        >
          <PenLine className="size-4" />
          {showLyrics ? "Ocultar campo de letra" : "Já tenho a letra escrita?"}
        </button>
        {showLyrics && (
          <div className="mt-3">
            <Textarea
              id="order-lyrics"
              value={values.lyrics}
              onChange={(e) => {
                onChange("lyrics", e.target.value);
                onChange(
                  "lyricsPreference",
                  e.target.value.trim() ? "HAS_LYRICS" : "CREATE_LYRICS",
                );
              }}
              placeholder="Cole aqui a letra da sua música..."
              rows={4}
              maxLength={4000}
              aria-invalid={!!errors.lyrics}
              aria-describedby={errors.lyrics ? "order-lyrics-error" : undefined}
              className="bg-background"
            />
            <FieldError id="order-lyrics-error" message={errors.lyrics} />
          </div>
        )}
      </div>

      {/* Referências opcionais */}
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <label htmlFor="order-references" className="block text-sm font-medium">
            Referências / observações
          </label>
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </div>
        <Textarea
          id="order-references"
          value={values.references ?? ""}
          onChange={(e) => onChange("references", e.target.value)}
          placeholder="Nome de músicas ou artistas parecidos com o que você imagina, detalhes extras..."
          rows={2}
          maxLength={2000}
          className="bg-background"
        />
      </div>
    </div>
  );
}
