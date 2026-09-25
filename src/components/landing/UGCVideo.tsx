import { useRef, useState } from "react";
import { CheckCircle2, Play, Quote } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollCTA } from "./ScrollCTA";

// Edite aqui: caminho do vídeo real (arquivo na pasta public/).
const VIDEO_SRC = "/ugc.mp4";

// O que o visitante verá na VSL — reforça o clique no play.
const takeaways = [
  "O que é o Estúdio Épico",
  "Como sua música é criada",
  "Exemplos de situações reais",
  "Como pedir a sua música",
];

export function UGCVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    void video.play();
    setPlaying(true);
  };

  return (
    <section id="vsl" className="relative border-y border-border bg-surface/40 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
            Prova real
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl">
            UMA IDEIA PODE VIRAR UMA <span className="offer-gradient-text">MÚSICA.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Aperte o play e veja o que acontece entre o briefing e a música pronta.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            className="relative mx-auto mt-9 aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-3xl border border-border bg-black sm:max-w-[380px]"
            style={{ boxShadow: "var(--shadow-frame)" }}
          >
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              className="size-full object-cover"
              playsInline
              controls={playing}
              preload="metadata"
            />
            {!playing && (
              <button
                type="button"
                onClick={play}
                aria-label="Reproduzir vídeo"
                className="absolute inset-0 flex items-center justify-center bg-background/35 transition-colors duration-200 hover:bg-background/20"
              >
                <span
                  className="flex size-20 items-center justify-center rounded-full bg-[image:var(--gradient-price)]"
                  style={{ boxShadow: "var(--shadow-offer)" }}
                >
                  <Play className="ml-1 size-8 fill-primary-foreground text-primary-foreground" />
                </span>
              </button>
            )}
          </div>
        </Reveal>

        {/* Legenda no formato de post — o vídeo precisa ler como prova, não como banner. */}
        <div className="mx-auto mt-4 flex max-w-[380px] items-start gap-3 rounded-2xl border border-border bg-surface/70 px-4 py-3 text-left backdrop-blur">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15"
          >
            <Quote className="size-3.5 text-accent" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Experiência real de um cliente</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Do pedido à música pronta, sem cortes.
            </p>
          </div>
        </div>

        <Reveal delay={0.05}>
          <ul className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
            {takeaways.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm font-medium"
              >
                <CheckCircle2 className="size-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-9">
            <ScrollCTA target="exemplos" label="OUÇA O RESULTADO" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
