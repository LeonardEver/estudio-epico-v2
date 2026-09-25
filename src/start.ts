import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { handleKiwifyWebhook } from "./lib/server/kiwify-webhook";
import { handleCaktoWebhook } from "./lib/server/cakto-webhook";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Kiwify payment webhook — kept for in-flight/legacy orders during the
// transition to Cakto; the current funnel no longer creates Kiwify checkouts.
const kiwifyWebhookMiddleware = createMiddleware().server(async ({ request, pathname, next }) => {
  if (pathname === "/api/kiwify/webhook" && request.method === "POST") {
    return handleKiwifyWebhook(request);
  }
  return next();
});

// Cakto payment webhook — plain HTTP route handled before the router (same
// pattern as the Kiwify one above). Configure the URL in the Cakto dashboard:
//   https://SEU-DOMINIO/api/cakto/webhook
const caktoWebhookMiddleware = createMiddleware().server(async ({ request, pathname, next }) => {
  if (pathname === "/api/cakto/webhook" && request.method === "POST") {
    return handleCaktoWebhook(request);
  }
  return next();
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests. (The webhook above is a router request, not a
// serverFn, so it is intentionally outside the CSRF filter.)
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    errorMiddleware,
    kiwifyWebhookMiddleware,
    caktoWebhookMiddleware,
    csrfMiddleware,
  ],
}));
