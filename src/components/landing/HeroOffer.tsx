import { motion } from "motion/react";
import { Headphones, Sparkles, Download } from "lucide-react";
import heroStudio from "@/assets/hero-studio.jpg";
import { ScrollCTA } from "./ScrollCTA";
import { PRICE } from "./offer";

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

      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-full border border-border bg-surface/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground backdrop-blur"
        >
          ESTUDIO ÉPICO — PRODUÇÃO MUSICAL PROFISSIONAL
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mt-6 text-[2.3rem] leading-[1.06] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
        >
          VOCÊ TEM UMA IDEIA.
          <br />
          NÓS TRANSFORMAMOS ELA EM <span className="offer-gradient-text">UMA MÚSICA.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Uma história, uma homenagem, um aniversário, um presente, uma marca ou simplesmente uma
          ideia. Você conta pra gente — e recebe uma música criada{" "}
          <span className="font-semibold text-foreground">especialmente para você.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="mt-9 flex flex-col items-center gap-5"
        >
          <ScrollCTA target="vsl" label="VER COMO FUNCIONA" variant="primary" />
          <p className="text-sm text-muted-foreground">
            A partir de <span className="font-display font-bold text-foreground">{PRICE}</span> ·
            pagamento único
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
        >
          {badges.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-accent" />
              {label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
