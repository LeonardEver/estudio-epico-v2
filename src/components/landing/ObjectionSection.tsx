import { Reveal } from "./Reveal";

const objections = [
  {
    q: "“Não sei produzir.”",
    a: "Não precisa. Você descreve a ideia e a produção é feita por nós.",
  },
  {
    q: "“Não tenho uma letra pronta.”",
    a: "Sem problema: você pode enviar apenas um conceito, clima ou tema.",
  },
  {
    q: "“Não sei escolher o gênero.”",
    a: "Você pode indicar o clima que imagina e nós sugerimos a direção.",
  },
  {
    q: "“Tenho uma referência, mas não sei explicar.”",
    a: "Basta enviar a referência — ela já diz muito sobre o que você quer.",
  },
];

export function ObjectionSection() {
  return (
    <section className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Se você pensou isso, relaxa</h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {objections.map((item, i) => (
            <Reveal key={item.q} delay={(i % 2) * 0.04}>
              <article className="h-full rounded-2xl border border-border bg-surface-2/60 p-6">
                <h3 className="text-base font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
