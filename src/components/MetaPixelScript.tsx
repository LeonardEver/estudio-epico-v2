"use client";

import { useEffect } from "react";

const PIXEL_ID = (import.meta.env["VITE_META_PIXEL_ID"] as string | undefined)?.trim();

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
};

/**
 * Loads the Meta Pixel base snippet once on the client and fires PageView.
 * Renders nothing; a no-op when VITE_META_PIXEL_ID is not configured.
 */
export function MetaPixelScript() {
  useEffect(() => {
    if (!PIXEL_ID || window.fbq) return;

    // Canonical Meta Pixel bootstrap (queues calls until fbevents.js loads).
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/pt_BR/fbevents.js";
    script.onload = () => {
      window.fbq?.("init", PIXEL_ID);
      window.fbq?.("track", "PageView");
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
