"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Rocket, Sparkles } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { getStreamingCheckoutUrl } from "@/lib/streaming-checkout";
import { PlatformLogos } from "./PlatformLogos";
import { STREAMING_PRICE } from "./offer";

/**
 * Upsell pós-compra do lançamento nas plataformas de streaming.
 * Exibido em /pedido-recebido antes da confirmação do pedido.
 */
export function StreamingUpsell({ onDecline }: { onDecline: () => void }) {
  const [interested, setInterested] = useState(false);

  const handleAccept = async () => {
    analytics.streamingUpsellAccepted();
    // Enquanto o checkout dedicado do lançamento não existir, registramos o
    // interesse e seguimos para a confirmação (sem redirecionar para lugar nenhum).
    try {
      const url = await getStreamingCheckoutUrl();
      if (url) {
        window.location.assign(url);
        return;
      }
    } catch {
      // segue para o fluxo de interesse registrado
    }
    setInterested(true);
    onDecline();
  };

  return (
    <section
      id="upsell-streaming"
      className="relative isolate overflow-hidden border-b border-border py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-primary/15 blur-[130px]" />
      <div className="mx-auto max-w-2xl px-5 text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-accent uppercase backdrop-blur">
          <Sparkles className="size-3.5" /> Serviço adicional de lançamento
        </p>

        <h1 className="mt-6 text-3xl leading-tight font-extrabold sm:text-5xl">
          <span aria-hidden>🚀</span> LANCE SUA MÚSICA NAS{" "}
          <span className="offer-gradient-text">PLATAFORMAS DIGITAIS</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          Coloque sua música nas principais plataformas digitais com o nosso suporte em todo o
          processo de lançamento.
        </p>

        {/* Logos reais, mesma fonte do card do Pacote Completo. */}
        <PlatformLogos layout="row" className="mt-7 justify-center" />

        <div
          className="mt-9 rounded-3xl border border-border bg-surface/80 p-8 backdrop-blur"
          style={{ boxShadow: "var(--shadow-frame)" }}
        >
          <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            <Rocket className="size-4 text-accent" /> Lançamento nas plataformas
          </p>
          <div className="mt-4 flex items-baseline justify-center gap-3">
            <span className="offer-gradient-text font-display text-6xl leading-none font-extrabold sm:text-7xl">
              {STREAMING_PRICE}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Serviço de lançamento com suporte no processo. Este serviço é opcional e tem cobrança
            separada da música avulsa.
          </p>

          <button
            type="button"
            onClick={handleAccept}
            className="group mt-7 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-base font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] sm:w-auto sm:px-10 sm:text-lg"
            style={{ boxShadow: "var(--shadow-offer)" }}
          >
            QUERO LANÇAR MINHA MÚSICA
            <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {interested && (
            <p className="mt-4 text-sm font-medium text-accent">
              Interesse no lançamento registrado! Acompanhe as novidades no seu e-mail.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            analytics.streamingUpsellDeclined();
            onDecline();
          }}
          className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Agora não — quero só acompanhar meu pedido
          <ArrowDown className="size-4" />
        </button>
      </div>
    </section>
  );
}
