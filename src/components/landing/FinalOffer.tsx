import { Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { CTAButton } from "./CTAButton";
import { PRICE } from "./offer";

const recap = [
  "Música criada a partir da sua ideia",
  "Letra personalizada",
  "Produção, mixagem e masterização",
];

export function FinalOffer() {
  return (
    <section
      id="cta-final"
      className="relative overflow-hidden border-t border-border py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-80 bg-primary/10 blur-[120px]" />
      <div className="mx-auto max-w-2xl px-5 text-center">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
            Pronto para criar a sua?
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">
            Sua ideia já existe.
            <br />
            <span className="offer-gradient-text">Agora transforme ela em música.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            className="mt-10 rounded-3xl border border-border bg-surface/80 p-8 backdrop-blur"
            style={{ boxShadow: "var(--shadow-frame)" }}
          >
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Sua Música Personalizada
            </p>
            <div className="mt-3 flex items-baseline justify-center gap-3">
              <span className="offer-gradient-text font-display text-7xl leading-none font-extrabold sm:text-8xl">
                {PRICE}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Pagamento único · Sem assinatura</p>

            <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
              {recap.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="size-3.5 text-accent" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <CTAButton className="mt-8 w-full" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-accent" /> Checkout seguro
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" /> Pagamento único
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-accent" /> Entrega digital
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 text-sm text-muted-foreground">
            Na página de pedido você ainda pode adicionar a capa personalizada, a página exclusiva
            ou levar o pacote completo com lançamento nas plataformas.
          </p>
        </Reveal>

        {/* WhatsApp desta seção: coberto pelo botão flutuante (WhatsAppFloat). */}
      </div>
    </section>
  );
}
