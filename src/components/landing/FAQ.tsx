import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "Como envio minha ideia?",
    a: "Na página de pedido, você conta sua história em um formulário rápido: para quem é, qual a ocasião e o que você imagina. Leva menos de 2 minutos.",
  },
  {
    q: "Posso escolher o estilo da música?",
    a: "Sim. Sertanejo, pop, pagode, funk, rock, eletrônica, MPB, gospel e mais. Você escolhe — ou descreve o clima e nós sugerimos.",
  },
  {
    q: "Quanto tempo demora?",
    a: "Sua música é produzida com cuidado e entregue em poucos dias úteis. O prazo exato é informado junto com a confirmação do pedido.",
  },
  {
    q: "Como recebo minha música?",
    a: "Você recebe o arquivo digital em alta qualidade, pronto para ouvir e compartilhar, no seu e-mail e WhatsApp.",
  },
  {
    q: "Posso usar minha música nas redes sociais?",
    a: "Pode. A música é sua: poste no Instagram, TikTok, WhatsApp, YouTube — onde quiser.",
  },
  {
    q: "Como funciona a página exclusiva?",
    a: "É um extra opcional: uma página personalizada onde sua música fica disponível para tocar, com link para você compartilhar com quem quiser.",
  },
  {
    q: "Como funciona o lançamento nas plataformas?",
    a: "No pacote completo, sua música é lançada oficialmente no Spotify, YouTube Music, Apple Music e Deezer. Cuidamos de tudo para você.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal>
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
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
