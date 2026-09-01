import { motion } from "motion/react";
import { Headphones, Sparkles, Download } from "lucide-react";
import heroStudio from "@/assets/hero-studio.jpg";
import { CTAButton } from "./CTAButton";
import { PRICE_ANCHOR, PRICE_NOW } from "./offer";

const badges = [
  { icon: Sparkles, label: "Pagamento único" },
  { icon: Headphones, label: "Produção personalizada" },
  { icon: Download, label: "Entrega digital" },
];

export function HeroOffer() {
  return (
    <section id="hero" className="relative isolate overflow-hidden">
      <img
        src={heroStudio}
        alt="Estúdio de produção musical profissional com monitores, teclado MIDI e iluminação quente"
        width={1600}
        height={1200}
        className="absolute inset-0 -z-20 size-full object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_78%,transparent)_0%,color-mix(in_oklab,var(--background)_88%,transparent)_45%,var(--background)_100%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-full border border-border bg-surface/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground backdrop-blur"
        >
          ESTUDIO ÉPICO - PRODUÇÃO MUSICAL PROFISSIONAL
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mt-6 text-[2.6rem] leading-[1.03] font-extrabold sm:text-6xl lg:text-7xl"
        >
          Sua ideia vira uma <span className="offer-gradient-text">música profissional</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Conte o que você imaginou — estilo, clima, referência, letra ou simplesmente uma ideia — e
          nós transformamos isso em uma música pronta.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="mt-9 w-full max-w-sm rounded-2xl border border-border bg-surface/80 p-6 backdrop-blur"
          style={{ boxShadow: "var(--shadow-frame)" }}
        >
          <div className="flex items-baseline justify-center gap-2 text-sm text-muted-foreground">
            <span>De</span>
            <span className="text-lg line-through decoration-primary/70 decoration-2">
              {PRICE_ANCHOR}
            </span>
          </div>
          <p className="mt-1 text-xs tracking-[0.18em] text-muted-foreground">POR APENAS</p>
          <p className="offer-gradient-text font-display text-7xl leading-none font-extrabold sm:text-8xl">
            {PRICE_NOW}
          </p>
          <CTAButton className="mt-6 w-full" label="QUERO MINHA MÚSICA" />
        </motion.div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {badges.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-accent" />
              {label}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm font-medium text-foreground/80">
          Você passa sua ideia e transformamos ela em realidade. Sem complicação, sem enrolação, sem
          assinatura. Apenas uma música profissional pronta para você.
        </p>
      </div>
    </section>
  );
}
