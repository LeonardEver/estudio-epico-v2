import { ArrowDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { CTAButton } from "./CTAButton";
import { PRICE_ANCHOR, PRICE_NOW } from "./offer";

export function FinalOffer() {
  return (
    <section id="oferta-final" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-80 bg-primary/10 blur-[120px]" />
      <div className="mx-auto max-w-2xl px-5 text-center">
        <Reveal>
          <h2 className="text-3xl leading-tight font-extrabold sm:text-5xl">
            Sua ideia já existe.
            <br />
            <span className="offer-gradient-text">Agora transforme ela em música.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            className="mt-10 rounded-3xl border border-border bg-surface/80 p-8"
            style={{ boxShadow: "var(--shadow-frame)" }}
          >
            <p className="text-xl text-muted-foreground line-through decoration-primary/70 decoration-2">
              {PRICE_ANCHOR}
            </p>
            <ArrowDown className="mx-auto my-2 size-6 text-accent" />
            <p className="offer-gradient-text font-display text-7xl leading-none font-extrabold sm:text-8xl">
              {PRICE_NOW}
            </p>
            <CTAButton className="mt-7 w-full" />
            <p className="mt-4 text-sm text-muted-foreground">Pagamento único</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
