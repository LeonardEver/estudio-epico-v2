import { useState } from "react";
import { ArrowDown, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { pauseOtherMedia } from "@/lib/media";

export function UGCVideo() {
  const [failed, setFailed] = useState(false);
  return (
    <section id="vsl" className="epic-section epic-video-section">
      <div className="epic-container epic-video-layout">
        <div className="epic-video-frame">
          <video
            src="/ugc.mp4#t=0.1"
            playsInline
            controls
            preload="metadata"
            aria-label="Vídeo de apresentação do Estúdio Épico"
            aria-describedby="epic-video-description"
            onPlay={(event) => {
              pauseOtherMedia(event.currentTarget);
              analytics.mediaPlay("video", "apresentacao");
            }}
            onEnded={() => analytics.mediaCompleted("video", "apresentacao")}
            onError={() => setFailed(true)}
          />
          {failed ? (
            <p role="status" className="epic-media-error">
              O vídeo não carregou. Você pode ouvir os exemplos acima ou seguir para o pedido.
            </p>
          ) : null}
        </div>
        <div className="epic-video-copy">
          <p className="epic-kicker">Por trás da sua música</p>
          <h2>Conheça o Estúdio Épico de perto.</h2>
          <p>
            Um vídeo para conhecer a proposta e entender como pedir sua música. Depois, conte o que
            você quer ouvir.
          </p>
          <ul className="epic-simple-list">
            {[
              "Sua história é o ponto de partida.",
              "Você escolhe o estilo e a mensagem.",
              "A música chega pronta para dar o play.",
            ].map((item) => (
              <li key={item}>
                <Check size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p id="epic-video-description" className="epic-video-description">
            Como pedir: conte sua ideia, escolha o estilo e receba a música em formato digital.
          </p>
          <a href="#como-funciona" className="epic-text-link">
            Ver como funciona <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
