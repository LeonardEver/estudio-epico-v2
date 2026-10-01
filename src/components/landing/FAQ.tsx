import { ChevronDown } from "lucide-react";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { hasWhatsApp } from "@/lib/whatsapp";
import { analytics } from "@/lib/analytics";

const faqs = [
  {
    q: "Como envio minha ideia?",
    a: "Na página de pedido, conte a história ou a mensagem, escolha o estilo e, se quiser, envie sua letra. Você confere as opções antes do pagamento.",
  },
  {
    q: "Posso escolher o estilo e enviar minha letra?",
    a: "Sim. Você pode escolher entre os estilos do formulário, indicar outro e enviar uma letra própria. Se não tiver letra, a composição está incluída.",
  },
  {
    q: "Quanto tempo demora?",
    a: "O prazo de entrega é de 24h. Se você tem uma data ou solicitação específica, confirme os detalhes com a equipe ao fazer seu pedido.",
  },
  {
    q: "Como recebo minha música?",
    a: "A entrega é digital, no e-mail e WhatsApp informados no pedido. Confira seus dados para receber o arquivo.",
  },
  {
    q: "Posso pedir alterações?",
    a: "Sim. Você pode solicitar até 3 rodadas de alterações na música. Envie os detalhes do que quer ajustar para orientar cada revisão.",
  },
  {
    q: "Posso usar a música no meu negócio?",
    a: "Informe o uso previsto no pedido. Para campanhas, anúncios, monetização ou distribuição, confirme as condições de uso e direitos com a equipe antes de contratar.",
  },
  {
    q: "O lançamento nas plataformas está nos R$67?",
    a: "Não. A música de R$67 tem entrega digital. O serviço de lançamento no Spotify, YouTube Music, Apple Music e Deezer está incluído no pacote completo, que também tem capa e página exclusiva.",
  },
  {
    q: "Como funciona a página exclusiva?",
    a: "É uma página para apresentar, ouvir e compartilhar sua música por um link. Você pode escolher esse extra no pedido ou recebê-lo no pacote completo.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Você paga por Pix ou cartão, na página de pedido, com processamento pela Cakto. Veja os itens e o total antes de finalizar. O pagamento é único, sem assinatura.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="epic-section">
      <div className="epic-container epic-faq-layout">
        <div className="epic-faq-intro">
          <p className="epic-kicker">Antes do próximo play</p>
          <h2>O que você quer saber antes de pedir?</h2>
          <p>Tem uma data ou um uso específico? Tire sua dúvida com a equipe.</p>
          {hasWhatsApp() ? (
            <WhatsAppCTA variant="link" label="Tirar uma dúvida no WhatsApp" />
          ) : null}
        </div>
        <div className="epic-faq-list">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              onToggle={(event) => {
                if (event.currentTarget.open) analytics.faqOpened(faq.q);
              }}
            >
              <summary>
                {faq.q}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
