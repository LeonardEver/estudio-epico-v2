import { AudioLines, Download, MessageSquareText } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollCTA } from "./ScrollCTA";

const steps = [
  { n: "01", icon: MessageSquareText, text: "Você conta sua ideia." },
  { n: "02", icon: AudioLines, text: "Nós transformamos sua ideia em música." },
  { n: "03", icon: Download, text: "Você recebe sua música pronta." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-border bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
            Como funciona
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-bold sm:text-5xl">Simples assim.</h2>
        </Reveal>

        <div className="mt-10 space-y-2 text-left">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.05}>
              <div className="flex items-center gap-4 border-b border-border py-5 sm:gap-5">
                <span className="offer-gradient-text font-display text-3xl font-extrabold sm:text-4xl">
                  {step.n}
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <step.icon className="size-5 text-accent" />
                </span>
                <p className="text-base font-medium sm:text-lg">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05}>
          <p className="mt-8 text-sm text-muted-foreground">
            Você não precisa saber nada de música.{" "}
            <span className="text-foreground">Só da ideia.</span>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-7">
            <ScrollCTA target="para-quem" label="VER PARA QUEM É" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
