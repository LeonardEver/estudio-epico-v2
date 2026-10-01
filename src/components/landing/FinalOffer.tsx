import { CTAButton } from "./CTAButton";
import { PRICE_VALUE } from "./offer";
import { formatBRL } from "@/lib/format";
import heroStudio from "@/assets/hero-studio.jpg";

export function FinalOffer() {
  return (
    <section id="decisao" className="epic-final epic-container">
      <img src={heroStudio} alt="" width={1600} height={1200} loading="lazy" aria-hidden="true" />
      <div>
        <p className="epic-kicker">Música feita para você</p>
        <h2>
          Agora é a vez
          <br />
          da sua ideia.
        </h2>
        <p>
          Conte o que você tem em mente.
          <br />
          Nós transformamos os detalhes em música.
        </p>
      </div>
      <div className="epic-final-action">
        <p className="epic-price">{formatBRL(PRICE_VALUE)}</p>
        <p>Pagamento único. Entrega em 24h.</p>
        <CTAButton location="final" />
        <span>Letra e produção incluídas.</span>
      </div>
    </section>
  );
}
