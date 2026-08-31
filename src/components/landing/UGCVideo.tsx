import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Reveal } from "./Reveal";
import { CTAButton } from "./CTAButton";

// Edite aqui: caminho do vídeo real (arquivo na pasta public/).
const VIDEO_SRC = "/ugc.mp4";

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
    <section className="relative border-y border-border bg-surface/40 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <h2 className="text-3xl leading-tight font-bold sm:text-4xl">
            Veja o que acontece quando uma ideia vira música.
          </h2>
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

        <p className="mt-5 text-sm text-muted-foreground">Experiência real de um cliente</p>

        <Reveal delay={0.1}>
          <div className="mt-9">
            <CTAButton />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
