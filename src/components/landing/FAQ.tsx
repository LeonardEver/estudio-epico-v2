import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "Como funciona?",
    a: "Você conta a sua ideia — estilo, clima, referência ou letra. A partir disso produzimos a música e enviamos o arquivo final.",
  },
  {
    q: "Preciso saber produzir?",
    a: "Não. A parte técnica é toda por nossa conta. Você só precisa da ideia.",
  },
  {
    q: "Posso enviar uma referência?",
    a: "Sim. Referências ajudam bastante a definir a direção da produção.",
  },
  { q: "Posso enviar minha própria letra?", a: "Sim, você pode enviar a sua letra." },
  {
    q: "Posso escolher o gênero?",
    a: "Sim. Você escolhe o gênero e o clima, ou descreve o que imagina e sugerimos a direção.",
  },
  { q: "Como recebo a música?", a: "Entrega digital. [DEFINIR: formato e canal de entrega]" },
  { q: "Quanto tempo leva?", a: "[DEFINIR: prazo de entrega]" },
  { q: "Posso pedir ajustes?", a: "[DEFINIR: política de ajustes / revisões]" },
];

export function FAQ() {
  return (
    <section className="border-t border-border bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-5xl">Perguntas frequentes</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-border">
                <AccordionTrigger className="text-left text-base font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
