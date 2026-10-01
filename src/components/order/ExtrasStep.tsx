"use client";

import { useState } from "react";
import { Check, ChevronDown, Flame, Globe, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BUNDLE_ANCHOR,
  BUNDLE_PRICE,
  BUNDLE_SAVINGS,
  DISTRIBUTION_PLATFORMS,
} from "@/components/landing/offer";
import { PlatformLogos } from "@/components/landing/PlatformLogos";
import type { Extra, OrderFormValues } from "@/lib/brief";
import { CoverPreview, ExclusivePagePreview } from "./ExtraPreviews";

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
    name: "Capa personalizada",
    price: "+R$19,90",
    description: "Uma arte exclusiva para acompanhar sua música.",
  },
  {
    id: "EXCLUSIVE_PAGE",
    icon: Globe,
    emoji: "🌐",
    name: "Página exclusiva",
    price: "+R$59,90",
    description: "Uma página personalizada para ouvir e compartilhar sua música.",
  },
];

/** O que o Pacote Completo entrega — exatamente os itens reais da oferta. */
const BUNDLE_BENEFITS = [
  "Sua música criada especialmente para você",
  "Capa profissional para o lançamento",
  "Página exclusiva para ouvir e compartilhar",
  "Distribuição nas principais plataformas digitais",
  "Tudo em um único pedido",
];

export function ExtrasStep({ values, onToggleExtra, onToggleBundle }: ExtrasStepProps) {
  const { extras, bundle } = values;
  /** Qual prévia está aberta — uma por vez (accordion). */
  const [openPreview, setOpenPreview] = useState<Extra | null>(null);

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
            const previewOpen = openPreview === extra.id;
            return (
              <li
                key={extra.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-colors",
                  includedInBundle
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-background",
                  selected && !includedInBundle && "border-primary/60 bg-primary/5",
                )}
              >
                <div className="flex items-stretch">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selected || includedInBundle}
                    disabled={includedInBundle}
                    onClick={() => onToggleExtra(extra.id)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-4 px-4 py-4 text-left",
                      includedInBundle ? "cursor-default" : "cursor-pointer",
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

                  {/*
                    Seta separada do toggle: o botão acima liga/desliga o extra,
                    esta só abre a prévia. Botões aninhados seriam HTML inválido,
                    por isso os dois são irmãos dentro do card.
                  */}
                  <button
                    type="button"
                    onClick={() => setOpenPreview(previewOpen ? null : extra.id)}
                    aria-expanded={previewOpen}
                    aria-controls={`preview-${extra.id}`}
                    aria-label={`${previewOpen ? "Fechar" : "Ver"} prévia: ${extra.name}`}
                    className="flex w-12 shrink-0 cursor-pointer items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-surface hover:text-accent"
                  >
                    <ChevronDown
                      className={cn(
                        "size-5 transition-transform duration-300",
                        previewOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>

                {/* Prévia inline — accordion animado, sem modal. */}
                <div
                  id={`preview-${extra.id}`}
                  inert={!previewOpen}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    previewOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border px-4 py-5 sm:px-5">
                      {extra.id === "COVER" ? (
                        <CoverPreview
                          selected={selected || includedInBundle}
                          onAdd={() => onToggleExtra(extra.id)}
                        />
                      ) : (
                        <ExclusivePagePreview
                          selected={selected || includedInBundle}
                          onAdd={() => onToggleExtra(extra.id)}
                        />
                      )}
                    </div>
                  </div>
                </div>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
                <Flame className="size-4" /> Pacote completo
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight font-extrabold sm:text-3xl">
                SUA MÚSICA EM TODA A <span className="offer-gradient-text">INTERNET.</span>
              </h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {DISTRIBUTION_PLATFORMS.join(" • ")} e muito mais
              </p>
            </div>

            {/*
              Logos reais no canto superior direito (no mobile caem para baixo
              do título, em bloco compacto, sem empurrar a headline).
            */}
            <PlatformLogos className="w-full shrink-0 sm:max-w-[250px] lg:max-w-[280px]" />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Leve sua música para as principais plataformas digitais e tenha um lançamento pronto
            para ser compartilhado, ouvido e descoberto pelo seu público.
          </p>

          <p className="mt-5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
            Você recebe:
          </p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {BUNDLE_BENEFITS.map((label) => (
              <li key={label} className="flex items-center gap-2.5 text-sm">
                <Check className="size-4 shrink-0 text-accent" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <p className="text-base text-muted-foreground">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">De </span>
              <span className="font-medium line-through decoration-primary/60 decoration-2">
                {BUNDLE_ANCHOR}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Por
              </span>
              <span className="offer-gradient-text font-display text-5xl leading-none font-extrabold sm:text-6xl">
                {BUNDLE_PRICE}
              </span>
            </p>
            <p className="mt-3 inline-flex rounded-full bg-primary/15 px-4 py-1.5 font-display text-sm font-extrabold tracking-wide text-accent uppercase">
              Você economiza {BUNDLE_SAVINGS}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Pagamento único · Sem assinatura</p>
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
                PACOTE SELECIONADO — {BUNDLE_PRICE}
              </>
            ) : (
              <>
                QUERO LANÇAR MINHA MÚSICA
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
