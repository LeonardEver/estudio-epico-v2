"use client";

import { useEffect } from "react";

/**
 * Microsoft Clarity — project ID. É público por design (aparece no HTML da
 * página), então fica aqui como constante em vez de variável de ambiente.
 */
const CLARITY_PROJECT_ID = "ynlvmnjkqc";

type ClarityQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityQueue;
  }
}

/**
 * Carrega o Microsoft Clarity (heatmaps + gravação de sessão) uma única vez no
 * cliente, seguindo o mesmo padrão do MetaPixelScript. Renderiza nada e não
 * re-injeta o script quando chamado mais de uma vez.
 *
 * O Meta Pixel tem o próprio componente e não é afetado por este arquivo.
 */
export function ClarityScript() {
  useEffect(() => {
    if (window.clarity) return;

    // Bootstrap oficial da Clarity (enfileira chamadas até o script carregar).
    const clarity = function (...args: unknown[]) {
      (clarity.q = clarity.q || []).push(args);
    } as ClarityQueue;
    window.clarity = clarity;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
