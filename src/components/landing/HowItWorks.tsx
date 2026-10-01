import { CTAButton } from "./CTAButton";

const steps = [
  {
    title: "Conte sua ideia",
    description:
      "Diga para quem é, o que precisa aparecer na letra e escolha o estilo. Se já escreveu a letra, pode enviá-la.",
  },
  {
    title: "Nós criamos a música",
    description:
      "Sua ideia orienta a letra e a produção musical, com mixagem e masterização incluídas.",
  },
  {
    title: "Receba e dê o play",
    description:
      "Em 24h, a entrega chega no seu e-mail e WhatsApp. Você pode solicitar até 3 rodadas de alterações.",
  },
];
export function HowItWorks() {
  return (
    <section id="como-funciona" className="epic-section">
      <div className="epic-container">
        <div className="epic-section-heading">
          <div>
            <p className="epic-kicker">Do seu jeito, sem complicar</p>
            <h2>
              Você conta. A gente cria.
              <br />
              Você dá o play.
            </h2>
          </div>
          <p>Não precisa saber produzir música. Precisa contar o que ela deve dizer.</p>
        </div>
        <ol className="epic-process">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="epic-step-number">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="epic-process-bottom">
          <p>
            Letra própria ou composição incluída.
            <br />
            <strong>A escolha é sua.</strong>
          </p>
          <CTAButton location="processo" />
        </div>
      </div>
    </section>
  );
}
