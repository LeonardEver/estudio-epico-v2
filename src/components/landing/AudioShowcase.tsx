import { useState } from "react";
import { Headphones } from "lucide-react";
import { CTAButton } from "./CTAButton";
import { analytics } from "@/lib/analytics";
import { pauseOtherMedia } from "@/lib/media";

const tracks = [
  {
    title: "Carnes do João",
    situation: "Jingle para loja",
    genre: "Sertanejo",
    src: "/audio/carnes-do-joao.mp3",
    id: "jingle",
    label: "CJ",
  },
  {
    title: "Aniversário da Luiza",
    situation: "Presente de aniversário",
    genre: "Acústico",
    src: "/audio/niverluiza.mp3",
    id: "presente",
    label: "AL",
  },
  {
    title: "Lili Roupas",
    situation: "Música para marca",
    genre: "Pop",
    src: "/audio/lili-roupas.mp3",
    id: "marca",
    label: "LR",
  },
  {
    title: "Viva Leve",
    situation: "Música para negócio",
    genre: "Samba",
    src: "/audio/viva-leve.mp3",
    id: "negocio",
    label: "VL",
  },
];

function TrackPlayer({ track }: { track: (typeof tracks)[number] }) {
  const [failed, setFailed] = useState(false);
  return (
    <article id={`audio-${track.id}`} className="epic-track">
      <div className="epic-track-identity">
        <span className={`epic-track-cover epic-track-cover-${track.id}`} aria-hidden="true">
          {track.label}
        </span>
        <div>
          <p>{track.situation}</p>
          <h3>{track.title}</h3>
          <span>{track.genre}</span>
        </div>
      </div>
      <audio
        controls
        preload="none"
        aria-label={`Ouvir ${track.title}`}
        src={track.src}
        onPlay={(event) => {
          setFailed(false);
          pauseOtherMedia(event.currentTarget);
          analytics.mediaPlay("audio", track.id);
        }}
        onEnded={() => analytics.mediaCompleted("audio", track.id)}
        onError={() => setFailed(true)}
      />
      {failed ? (
        <p className="epic-media-error" role="status">
          Não foi possível carregar esta faixa. Tente reproduzir novamente.
        </p>
      ) : null}
    </article>
  );
}

export function AudioShowcase() {
  return (
    <section id="exemplos" className="epic-section epic-examples">
      <div className="epic-container">
        <div className="epic-section-heading">
          <div>
            <p className="epic-kicker">
              <Headphones size={16} aria-hidden="true" /> O som fala por si
            </p>
            <h2>
              Antes de imaginar a sua,
              <br className="epic-desktop-break" /> dê o play.
            </h2>
          </div>
          <p>
            Ouça músicas produzidas pelo Estúdio Épico. Cada exemplo mostra uma forma de transformar
            uma ideia em som.
          </p>
        </div>
        <div className="epic-track-grid">
          {tracks.map((track) => (
            <TrackPlayer key={track.id} track={track} />
          ))}
        </div>
        <div className="epic-examples-bottom">
          <p>A próxima pode contar a sua história.</p>
          <CTAButton size="md" location="exemplos" />
        </div>
      </div>
    </section>
  );
}
