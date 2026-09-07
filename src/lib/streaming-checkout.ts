/**
 * URL do checkout do upsell de lançamento (streaming) — server-side.
 *
 * Enquanto o checkout dedicado do lançamento não estiver configurado
 * (KIWIFY_STREAMING_CHECKOUT_URL), retorna null: a seção de upsell permanece
 * visível como vitrine premium e registra o interesse no analytics, sem
 * redirecionar o cliente para um destino inexistente.
 */
import { createServerFn } from "@tanstack/react-start";
import { env } from "./server/env";

export const getStreamingCheckoutUrl = createServerFn({ method: "GET" }).handler(() => {
  return env("KIWIFY_STREAMING_CHECKOUT_URL") ?? null;
});
