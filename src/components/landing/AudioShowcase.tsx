import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type Track = {
  title: string;
  genre: string;
  mood: string;
  /** Edite aqui: coloque o arquivo em public/audio/ e informe o caminho. */
  src?: string;
};

const tracks: Track[] = [
  {
    title: "Carnes do João",
    genre: "Sertanejo",
    mood: "Energético",
    src: "/audio/carnes-do-joao.mp3",
  },
  { title: "Lili Roupas", genre: "Pop", mood: "Emocional", src: "/audio/lili-roupas.mp3" },
  { title: "Viva Leve - Viagens", genre: "Samba", mood: "Leve", src: "/audio/viva-leve.mp3" },
  {
    title: "Aniversário da Luiza",
    genre: "Acústico",
    mood: "Emocional",
    src: "/audio/niverluiza.mp3",
  },
];

const BARS = 44;
const heights = Array.from({ length: BARS }, (_, i) =>
  Math.round(28 + Math.abs(Math.sin(i * 1.7) * 52) + ((i * 13) % 17)),
);

function Waveform({ progress, active }: { progress: number; active: boolean }) {
  return (
    <div className="flex h-12 items-center gap-[3px]">
      {heights.map((h, i) => {
        const filled = active && i / BARS <= progress;
        return (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors duration-150",
              filled ? "bg-accent" : "bg-foreground/15",
            )}
            style={{ height: `${Math.min(h, 100)}%` }}
          />
        );
      })}
    </div>
  );
}

export function AudioShowcase() {
  const [current, setCurrent] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = (index: number, src: string) => {
    if (current === index) {
      audioRef.current?.pause();
      setCurrent(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(src);
    audio.addEventListener("timeupdate", () =>
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0),
    );
    audio.addEventListener("ended", () => {
      setCurrent(null);
      setProgress(0);
    });
    audioRef.current = audio;
    setProgress(0);
    setCurrent(index);
    void audio.play();
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-5xl">Exemplos de áudio</h2>
          <p className="mt-3 text-muted-foreground">
            Cada música é produzida do zero a partir da ideia do cliente.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {tracks.map((track, i) => {
            const active = current === i;
            const disabled = !track.src;
            return (
              <Reveal key={`${track.genre}-${i}`} delay={(i % 2) * 0.04}>
                <article className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => track.src && toggle(i, track.src)}
                      aria-label={active ? "Pausar" : "Reproduzir"}
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-price)] text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:bg-none disabled:bg-foreground/10 disabled:text-muted-foreground"
                    >
                      {active ? (
                        <Pause className="size-5 fill-current" />
                      ) : (
                        <Play className="ml-0.5 size-5 fill-current" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">{track.title}</h3>
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        {track.genre} · {track.mood}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Waveform progress={progress} active={active} />
                  </div>
                  {disabled && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      [ADICIONAR ÁUDIO EM /public/audio/]
                    </p>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
