import { ArrowUpRight, Gift, Store } from "lucide-react";

export function ForWhomSection() {
  return (
    <section id="para-quem" className="epic-section epic-audience-section">
      <div className="epic-container">
        <div className="epic-section-heading">
          <div>
            <p className="epic-kicker">Um som com a sua intenção</p>
            <h2>
              Para alguém. Para uma marca.
              <br />
              Para a sua ideia.
            </h2>
          </div>
        </div>
        <div className="epic-audience-grid">
          <article>
            <Gift size={30} aria-hidden="true" />
            <h3>Para presentear</h3>
            <p>O nome, as lembranças e a mensagem que só você poderia contar.</p>
            <ul>
              <li>Aniversários</li>
              <li>Casamentos</li>
              <li>Homenagens</li>
              <li>Histórias de amor</li>
            </ul>
            <a href="#audio-presente" className="epic-text-link">
              Ouvir um presente <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </article>
          <article>
            <Store size={30} aria-hidden="true" />
            <h3>Para o seu negócio</h3>
            <p>Uma música com o nome da sua marca e a mensagem da campanha.</p>
            <ul>
              <li>Lojas e restaurantes</li>
              <li>Marcas e serviços</li>
              <li>Campanhas</li>
              <li>Redes sociais</li>
            </ul>
            <a href="#audio-jingle" className="epic-text-link">
              Ouvir um jingle <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <p className="epic-audience-note">
              Para anúncios e uso comercial, confirme as condições de uso com a equipe.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
