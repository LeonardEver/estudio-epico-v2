"use client";

import appleMusic from "@/assets/applemusic2.svg";
import deezer from "@/assets/deezer.webp";
import spotify from "@/assets/Spotify.svg.webp";
import youtube from "@/assets/youtube.webp";
import { cn } from "@/lib/utils";

/**
 * Logos reais das plataformas onde o serviço distribui.
 *
 * São INFORMATIVOS — não são botões, não têm hover, não são clicáveis. Cada
 * marca fica na proporção original (`object-contain`, sem forçar dimensão).
 *
 * O fundo claro atrás de cada logo é necessário porque o tema é escuro: as
 * marcas do Apple Music e do Deezer são escuras e sumiriam no card. É uma
 * placa neutra, não um botão.
 *
 * ATENÇÃO ao arquivo `youtube.webp`: ele é a marca do **YouTube** (retângulo
 * vermelho + play), NÃO a do YouTube Music. Por isso o alt diz "YouTube".
 *
 * Os assets são os arquivos fornecidos em src/assets — nenhum logo é redesenhado.
 */
const BASE_IMG = "w-auto max-w-full object-contain";

const PLATFORM_ASSETS: { name: string; alt: string; src: string; imgClass?: string }[] = [
  { name: "Spotify", alt: "Spotify", src: spotify },
  { name: "YouTube Music", alt: "YouTube", src: youtube },
  {
    name: "Apple Music",
    alt: "Apple Music",
    src: appleMusic,
    // O viewBox desse SVG tem ~38% de espaço vazio embaixo, então o desenho
    // sai menor que os outros no mesmo box. Subir a altura compensa — e o
    // `object-contain` mantém a proporção, sem esticar o logo.
    imgClass: "max-h-10",
  },
  { name: "Deezer", alt: "Deezer", src: deezer },
];

export function PlatformLogos({
  layout = "grid",
  className,
}: {
  /** "grid" = 2×2 (card do pacote) · "row" = linha única (upsell). */
  layout?: "grid" | "row";
  className?: string;
}) {
  return (
    <ul
      role="list"
      aria-label="Plataformas de distribuição"
      className={cn(
        layout === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {PLATFORM_ASSETS.map((platform) => (
        <li
          key={platform.name}
          className="flex h-11 items-center justify-center rounded-lg bg-white px-2.5"
        >
          <img
            src={platform.src}
            alt={platform.alt}
            loading="lazy"
            decoding="async"
            className={cn(BASE_IMG, platform.imgClass ?? "max-h-6")}
          />
        </li>
      ))}
    </ul>
  );
}
