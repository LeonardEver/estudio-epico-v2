import { Reveal } from "./Reveal";

const points = [
  "Você não precisa saber produzir música.",
  "Você não precisa de um estúdio.",
  "Você não precisa saber arranjar nem mixar.",
  "Você só precisa da ideia — a produção é feita para você.",
];

export function ValueSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:grid-cols-2 sm:items-center">
        <Reveal>
          <h2 className="text-3xl leading-tight font-bold sm:text-5xl">
            Produção profissional <span className="offer-gradient-text">sem complicação.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <ul className="space-y-4">
            {points.map((point) => (
              <li key={point} className="border-l-2 border-primary/60 pl-4 text-muted-foreground">
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
