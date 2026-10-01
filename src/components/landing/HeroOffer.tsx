import { ArrowDown, Check, Headphones } from "lucide-react";
import heroStudio from "@/assets/hero-studio.jpg";
import { CTAButton } from "./CTAButton";
import { PRICE_ANCHOR, PRICE_SAVINGS, PRICE_VALUE } from "./offer";
import { formatBRL } from "@/lib/format";
import { analytics } from "@/lib/analytics";

export function HeroOffer() {
  return (
    <section id="hero" className="epic-hero">
      <header className="epic-header epic-container">
        <a href="#hero" className="epic-brand" aria-label="Estúdio Épico, início">
          <span className="epic-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            estúdio <strong>épico.</strong>
          </span>
        </a>
        <a href="#exemplos" className="epic-header-link">
          Conheça o som <Headphones size={16} aria-hidden="true" />
        </a>
      </header>
      <div className="epic-container epic-hero-grid">
        <div className="epic-hero-copy">
          <p className="epic-kicker">
            <span aria-hidden="true" /> Música feita para você
          </p>
          <h1>Sua ideia merece uma música própria.</h1>
          <p className="epic-hero-description">
            Um presente com a sua história. Um jingle com o nome da sua marca. Você conta a ideia e
            recebe uma música feita a partir dela.
          </p>
          <div className="epic-hero-price">
            <div>
              <p className="epic-price-anchor">
                De <s>{PRICE_ANCHOR}</s> por
              </p>
              <p className="epic-price">{formatBRL(PRICE_VALUE)}</p>
            </div>
            <p className="epic-saving">
              Economize {PRICE_SAVINGS}
              <span>Pagamento único</span>
            </p>
          </div>
          <div className="epic-hero-actions">
            <CTAButton label="Criar minha música" location="hero" />
            <a
              href="#exemplos"
              className="epic-listen-link"
              onClick={() => analytics.scrollCtaClick("exemplos")}
            >
              <Headphones size={18} aria-hidden="true" /> Ouvir exemplos
            </a>
          </div>
          <p className="epic-next-step">
            Conte sua ideia no próximo passo. Pague por Pix ou cartão.
          </p>
          <ul className="epic-hero-included">
            {["Letra + produção", "Entrega em 24h", "Até 3 revisões"].map((item) => (
              <li key={item}>
                <Check size={14} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="epic-hero-art">
          <img
            src={heroStudio}
            alt="Mesa de produção musical com teclado, monitores e iluminação quente"
            width={1600}
            height={1200}
            fetchPriority="high"
            className="epic-studio-image"
          />
          <div className="epic-photo-caption">
            <span>Música personalizada</span>
            <strong>
              A história é sua.
              <br />O próximo play também.
            </strong>
          </div>
          <a
            href="#exemplos"
            className="epic-photo-track"
            aria-label="Ouvir os exemplos de músicas do Estúdio Épico"
          >
            <span className="epic-disc" aria-hidden="true">
              <i />
            </span>
            <span>
              <small>Do briefing ao play</small>
              <strong>Ouça o que uma ideia pode virar</strong>
            </span>
            <ArrowDown size={20} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="epic-container epic-hero-bottom">
        <span>Sua história. Seu estilo. Sua música.</span>
        <a href="#exemplos">
          Dê o primeiro play <ArrowDown size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
