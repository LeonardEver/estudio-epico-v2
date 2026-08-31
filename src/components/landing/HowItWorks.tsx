import { Reveal } from "./Reveal";

const steps = [
  { n: "01", title: "Você conta a ideia", text: "Estilo, clima, referência ou letra." },
  { n: "02", title: "Nós produzimos", text: "A produção fica por nossa conta." },
  { n: "03", title: "Você recebe", text: "Sua música pronta para ouvir." },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-5xl">Como funciona</h2>
        </Reveal>

        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.05}>
              <div>
                <p className="offer-gradient-text font-display text-6xl font-extrabold sm:text-7xl">
                  {step.n}
                </p>
                <h3 className="mt-3 text-xl font-bold sm:text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
