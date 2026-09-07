/**
 * Client-callable server function that persists the music order (briefing +
 * extras + payment method) and returns the Kiwify checkout URL. Runs entirely
 * server-side (CSRF-protected by the start instance middleware); the handler
 * imports server-only modules.
 */
import { createServerFn } from "@tanstack/react-start";
import { briefSchema } from "./brief";
import { createOrder } from "./server/orders";

export const createOrderFn = createServerFn({ method: "POST" })
  .validator(briefSchema)
  .handler(async ({ data }) => {
    return createOrder({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      lyricsPreference: data.lyricsPreference,
      lyrics: data.lyrics.trim(),
      description: data.description,
      genre: data.genre,
      genreOther: data.genreOther,
      mood: data.mood ?? [],
      recipient: data.recipient,
      occasion: data.occasion,
      references: data.references,
      extras: data.extras,
      bundle: data.bundle,
      paymentMethod: data.paymentMethod,
      ...(data.utm ? { utm: data.utm } : {}),
    });
  });
