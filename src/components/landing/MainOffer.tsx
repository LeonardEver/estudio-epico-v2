import { Check, Clock, Download, Lock, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import { CTAButton } from "./CTAButton";
import { BUMP_PRICE, EXCLUSIVE_PAGE_PRICE, PRICE } from "./offer";

// Sinais de confiança — todos já descritos no FAQ/na página, só mais visíveis.
const trust = [
  { icon: ShieldCheck, label: "Pagamento seguro" },
  { icon: Download, label: "Entrega digital no e-mail e WhatsApp" },
  { icon: Clock, label: "Produção em poucos dias úteis" },
];

const included = [
  "Música customizada, criada a partir da sua ideia",
  "Composição da letra personalizada (ou envie a sua)",
  "Produção musical completa no estilo que você escolher",
  "Mixagem e masterização profissional",
];

export function MainOffer() {
  return (
    <section id="oferta" className="relative overflow-hidden border-t border-border py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-primary/10 blur-[120px]" />
      <div className="mx-auto max-w-2xl px-5 text-center">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
            A oferta
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">
            Sua Música <span className="offer-gradient-text">Personalizada</span>
          </h2>
        </Reveal>

        {/* Oferta principal — compacta */}
        <Reveal delay={0.05}>
          <div
            className="mt-10 rounded-3xl border border-border bg-surface/80 p-7 text-left backdrop-blur sm:p-8"
            style={{ boxShadow: "var(--shadow-frame)" }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Por apenas
                </p>
                <p className="offer-gradient-text font-display text-6xl leading-none font-extrabold sm:text-7xl">
                  {PRICE}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Pagamento único · Sem assinatura
                </p>
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="size-3.5 text-accent" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <CTAButton className="mt-7 w-full" />

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="size-3.5 shrink-0" />
              Na página de pedido você conta sua ideia em menos de 2 minutos e finaliza no checkout
              seguro.
            </p>

            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
              {trust.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon className="size-3.5 shrink-0 text-accent" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 text-sm text-muted-foreground">
            Na página de pedido você ainda pode adicionar extras: Capa Personalizada ({BUMP_PRICE})
            e Página Exclusiva ({EXCLUSIVE_PAGE_PRICE}).
          </p>
        </Reveal>

        {/*
          O CTA de WhatsApp desta seção foi removido: agora existe um botão
          FLUTUANTE sempre visível (WhatsAppFloat) que cobre o mesmo caso sem
          repetir o convite três vezes na mesma página.
        */}
      </div>
    </section>
  );
}
