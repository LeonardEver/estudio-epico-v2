"use client";

import { Check, Globe, Palette, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUNDLE_ANCHOR, BUNDLE_PRICE } from "@/components/landing/offer";
import type { Extra, OrderFormValues } from "@/lib/brief";
import { formatBRL } from "./order-state";

type ExtrasStepProps = {
  values: OrderFormValues;
  onToggleExtra: (extra: Extra) => void;
  onToggleBundle: (selected: boolean) => void;
};

const EXTRAS_CONFIG: {
  id: Extra;
  icon: typeof Palette;
  emoji: string;
  name: string;
  price: string;
  description: string;
}[] = [
  {
    id: "COVER",
    icon: Palette,
    emoji: "🎨",
    name: "Capa Personalizada",
    price: "+R$19,90",
    description: "Uma arte exclusiva para acompanhar sua música.",
  },
  {
    id: "EXCLUSIVE_PAGE",
    icon: Globe,
    emoji: "🌐",
    name: "Página Exclusiva",
    price: "+R$59,90",
    description: "Uma página personalizada para ouvir e compartilhar sua música.",
  },
];

export function ExtrasStep({ values, onToggleExtra, onToggleBundle }: ExtrasStepProps) {
  const { extras, bundle } = values;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl leading-tight font-bold sm:text-3xl">
          Deixe sua música <span className="offer-gradient-text">ainda mais especial</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Opcionais — adicione só o que fizer sentido para você.
        </p>

        {/* Extras compactos */}
        <ul className="mt-6 space-y-3">
          {EXTRAS_CONFIG.map((extra) => {
            const selected = extras.includes(extra.id);
            const includedInBundle = bundle;
            return (
              <li key={extra.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selected || includedInBundle}
                  disabled={includedInBundle}
                  onClick={() => onToggleExtra(extra.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
                    includedInBundle
                      ? "cursor-default border-primary/40 bg-primary/5"
                      : "cursor-pointer border-border bg-background hover:border-input",
                    selected && !includedInBundle && "border-primary/60 bg-primary/5",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-lg"
                  >
                    {extra.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-bold">{extra.name}</span>
                      <span className="offer-gradient-text text-sm font-extrabold">
                        {extra.price}
                      </span>
                      {includedInBundle && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
                          Incluído no pacote
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {extra.description}
                    </span>
                  </span>
                  {/* Controle Adicionar */}
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
                      selected || includedInBundle
                        ? "justify-end border-transparent bg-[image:var(--gradient-price)]"
                        : "justify-start border-input bg-surface",
                    )}
                  >
                    <span className="m-0.5 size-4.5 rounded-full bg-primary-foreground shadow" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pacote completo — escolha premium */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border p-6 transition-colors sm:p-8",
          bundle ? "border-primary/60 bg-primary/10" : "border-border bg-surface/70",
        )}
      >
        <div className="pointer-events-none absolute -top-16 right-0 h-40 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            <Star className="size-4" /> Quer levar tudo?
          </p>
          <h3 className="mt-2 font-display text-xl leading-tight font-extrabold sm:text-2xl">
            Música + Capa + Página + Lançamento nas plataformas
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua música pronta, com capa, página exclusiva e disponível no Spotify, YouTube Music,
            Apple Music e Deezer.
          </p>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-lg text-muted-foreground line-through decoration-primary/70 decoration-2">
              {BUNDLE_ANCHOR}
            </span>
            <span className="offer-gradient-text font-display text-4xl font-extrabold sm:text-5xl">
              {BUNDLE_PRICE}
            </span>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-accent uppercase">
              Economize R$77
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleBundle(!bundle)}
            aria-pressed={bundle}
            className={cn(
              "mt-5 inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl font-display text-base font-bold tracking-wide transition-all duration-200 active:scale-[0.99] sm:w-auto sm:px-8",
              bundle
                ? "border-2 border-primary/60 bg-primary/10 text-foreground"
                : "bg-[image:var(--gradient-price)] text-primary-foreground",
            )}
            style={bundle ? undefined : { boxShadow: "var(--shadow-offer)" }}
          >
            {bundle ? (
              <>
                <Check className="size-5" />
                PACOTE SELECIONADO — {formatBRL(479)}
              </>
            ) : (
              "QUERO O PACOTE COMPLETO"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
