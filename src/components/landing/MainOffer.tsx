import { Check, ChevronDown, Disc3, LockKeyhole } from "lucide-react";
import { CTAButton } from "./CTAButton";
import { PlatformLogos } from "./PlatformLogos";
import { CoverPreview, ExclusivePagePreview } from "@/components/order/ExtraPreviews";
import {
  PRICE_VALUE,
  PRICE_ANCHOR,
  BUMP_PRICE,
  EXCLUSIVE_PAGE_PRICE,
  STREAMING_PRICE,
  BUNDLE_PRICE,
  BUNDLE_ANCHOR,
  BUNDLE_SAVINGS,
} from "./offer";
import { formatBRL } from "@/lib/format";

const included = [
  "Letra com os detalhes da sua ideia, ou a letra que você enviar",
  "Produção musical no estilo escolhido",
  "Mixagem e masterização incluídas",
  "Entrega digital em 24h, por e-mail e WhatsApp",
  "Até 3 rodadas de alterações",
];
const bundleItems = [
  { name: "Música personalizada", price: formatBRL(PRICE_VALUE) },
  { name: "Capa personalizada", price: BUMP_PRICE },
  { name: "Página exclusiva", price: EXCLUSIVE_PAGE_PRICE },
  { name: "Lançamento nas plataformas", price: STREAMING_PRICE },
];

export function MainOffer() {
  return (
    <section id="oferta" className="epic-section epic-offer-section">
      <div className="epic-container">
        <div className="epic-section-heading">
          <div>
            <p className="epic-kicker">Escolha como sua ideia chega ao mundo</p>
            <h2>
              Da sua ideia ao áudio pronto.
              <br />E além, se você quiser.
            </h2>
          </div>
          <p>A música já vem completa. Capa, página e lançamento são escolhas suas.</p>
        </div>
        <div className="epic-offer-grid">
          <article className="epic-music-offer">
            <div className="epic-offer-label">
              <Disc3 size={20} aria-hidden="true" /> A sua música
            </div>
            <h3>Sua música personalizada</h3>
            <p className="epic-offer-description">
              Para presentear, homenagear ou dar som à sua marca.
            </p>
            <p className="epic-price-anchor">
              De <s>{PRICE_ANCHOR}</s> por
            </p>
            <p className="epic-price">{formatBRL(PRICE_VALUE)}</p>
            <p className="epic-payment-note">Pagamento único. Sem assinatura.</p>
            <ul className="epic-simple-list">
              {included.map((item) => (
                <li key={item}>
                  <Check size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <CTAButton label="Criar minha música por R$67" location="oferta_musica" />
            <p className="epic-offer-micro">
              <LockKeyhole size={14} aria-hidden="true" /> Pix ou cartão. Confira o total antes de
              pagar.
            </p>
          </article>
          <article className="epic-bundle-offer">
            <div className="epic-offer-label">O pacote completo</div>
            <h3>Ouvir. Compartilhar. Lançar.</h3>
            <p className="epic-offer-description">
              Sua música com capa, uma página exclusiva e o serviço de lançamento nas plataformas.
            </p>
            <div className="epic-release-preview" aria-label="Apresentação ilustrativa do pacote">
              <span className="epic-release-cover">
                <Disc3 size={26} aria-hidden="true" />
                <strong>
                  Sua
                  <br />
                  música.
                </strong>
                <small>Estúdio Épico</small>
              </span>
              <div>
                <span className="epic-preview-label">Prévia ilustrativa</span>
                <strong>
                  Uma faixa.
                  <br />
                  Mais formas de ouvir.
                </strong>
                <p>Áudio + capa + link + distribuição</p>
              </div>
            </div>
            <PlatformLogos layout="row" className="epic-platforms" />
            <p className="epic-platform-note">Destinos de distribuição. Sem parceria ou endosso.</p>
            <ul className="epic-bundle-items">
              {bundleItems.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </li>
              ))}
            </ul>
            <div className="epic-bundle-total">
              <div>
                <p className="epic-price-anchor">
                  Separadamente, <s>{BUNDLE_ANCHOR}</s>
                </p>
                <p className="epic-price">{BUNDLE_PRICE}</p>
              </div>
              <span>
                Economize
                <br />
                <strong>{BUNDLE_SAVINGS}</strong>
              </span>
            </div>
            <CTAButton label="Escolher pacote completo" bundle location="oferta_pacote" />
            <p className="epic-offer-micro">Você revisa os itens e o total na página de pedido.</p>
          </article>
        </div>
        <div className="epic-extras">
          <div>
            <h3>Só quer um toque a mais?</h3>
            <p>Adicione um extra no pedido, se fizer sentido para você.</p>
          </div>
          <div className="epic-extras-list">
            <details>
              <summary>
                <span>
                  Capa personalizada <small>Uma imagem para acompanhar sua faixa.</small>
                </span>
                <strong>{BUMP_PRICE}</strong>
                <ChevronDown size={17} aria-hidden="true" />
              </summary>
              <div className="epic-extra-preview">
                <CoverPreview selected onAdd={() => {}} />
              </div>
            </details>
            <details>
              <summary>
                <span>
                  Página exclusiva <small>Um link para ouvir e compartilhar sua música.</small>
                </span>
                <strong>{EXCLUSIVE_PAGE_PRICE}</strong>
                <ChevronDown size={17} aria-hidden="true" />
              </summary>
              <div className="epic-extra-preview">
                <ExclusivePagePreview selected onAdd={() => {}} />
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
