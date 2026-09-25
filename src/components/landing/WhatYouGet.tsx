import { Headphones, Music, PenLine, SlidersHorizontal } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollCTA } from "./ScrollCTA";
import { CTAButton } from "./CTAButton";
import { PRICE } from "./offer";

// Entregáveis do produto principal — exatamente estes 4, todos INCLUSOS no
// R$67. Valores individuais são ancoragem de valor percebido (definidos
// pelo produto): capa, página exclusiva e distribuição NÃO entram aqui —
// continuam sendo adicionais do funil, vendidos na página de pedido.
const deliverables = [
  {
    icon: Music,
    title: "Música Customizada",
    price: "R$49,90",
    text: "Uma música única, criada do zero a partir da sua história.",
  },
  {
    icon: PenLine,
    title: "Composição da Letra Personalizada",
    price: "R$39,90",
    text: "Sua história transformada em uma letra feita especialmente para você.",
  },
  {
    icon: SlidersHorizontal,
    title: "Produção Musical Completa",
    price: "R$69,90",
    text: "Arranjo, instrumentos e sonoridade no estilo que você escolher.",
  },
  {
    icon: Headphones,
    title: "Mixagem e Masterização",
    price: "R$49,90",
    text: "Finalização da faixa para entregar um resultado pronto para ouvir.",
  },
];

const SEPARATED_TOTAL = "R$209,60";

export function WhatYouGet() {
  return (
    <section id="voce-recebe" className="border-y border-border bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
              O que você recebe
            </p>
            <h2 className="mt-3 text-3xl leading-tight font-bold sm:text-5xl">
              Tudo o que sua música precisa.{" "}
              <span className="offer-gradient-text">Em um só pacote.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Do primeiro verso à master final, você recebe uma produção musical completa por um
              único preço.
            </p>
          </div>
        </Reveal>

        {/* Lista com valores individuais riscados (ancoragem discreta) */}
        <div className="mt-10">
          {deliverables.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.04}>
              <div className="flex items-start gap-4 border-b border-border py-5">
                <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-price)] text-primary-foreground">
                  <item.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold sm:text-lg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground line-through decoration-primary/50 decoration-1">
                  {item.price}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Total separado → contraste → preço real → CTA */}
        <Reveal delay={0.05}>
          <div className="mt-10 text-center">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Valor separado
            </p>
            <p className="mt-1 text-lg text-muted-foreground/70 line-through decoration-primary/50 decoration-1">
              {SEPARATED_TOTAL}
            </p>

            <p className="mt-8 font-display text-lg font-bold tracking-[0.14em] text-accent uppercase sm:text-xl">
              Tudo isso já está incluso.
            </p>

            <p className="mt-5 text-xs tracking-[0.22em] text-muted-foreground uppercase">
              Por apenas
            </p>
            <p className="offer-gradient-text mt-1 font-display text-7xl leading-none font-extrabold sm:text-8xl">
              {PRICE}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Pagamento único. Sem mensalidade.</p>

            <div className="mx-auto mt-7 max-w-sm">
              <CTAButton className="w-full" />
            </div>

            <div className="mt-5 flex justify-center">
              <ScrollCTA target="oferta" label="VER A OFERTA" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
