import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { CTAButton } from "./CTAButton";

const benefits = [
  "Música personalizada",
  "Produção baseada na sua ideia",
  "Escolha de gênero e clima",
  "Possibilidade de enviar referências",
  "Arquivo final pronto para ouvir e compartilhar",
  "Pagamento único",
];

export function BenefitGrid() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-5xl">O que você recebe</h2>
        </Reveal>

        <ul className="mt-9 grid gap-x-10 gap-y-1 sm:grid-cols-2">
          {benefits.map((benefit, i) => (
            <Reveal key={benefit} delay={i * 0.03}>
              <li className="flex items-start gap-3 border-b border-border py-4 text-base sm:text-lg">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="size-4 text-accent" />
                </span>
                {benefit}
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.05}>
          <div className="mt-10">
            <CTAButton />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
