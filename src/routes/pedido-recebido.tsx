import { createFileRoute, Link } from "@tanstack/react-router";
import { Music } from "lucide-react";

export const Route = createFileRoute("/pedido-recebido")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search["order_id"] === "string" ? (search["order_id"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pedido recebido! 🎵 | Música personalizada" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

/**
 * Simple post-checkout confirmation — the customer lands here only if the
 * Kiwify checkout is configured to redirect back to this page.
 * It deliberately does NOT claim production has started; that only happens
 * after the payment webhook confirms the order.
 */
function SuccessPage() {
  const { orderId } = Route.useSearch();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 text-center">
      <div
        className="flex size-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-price)]"
        style={{ boxShadow: "var(--shadow-offer)" }}
      >
        <Music className="size-8 text-primary-foreground" />
      </div>

      <h1 className="mt-8 font-display text-3xl font-extrabold sm:text-5xl">
        Pedido recebido! <span aria-hidden>🎵</span>
      </h1>
      <p className="mt-4 text-lg font-medium text-foreground">Agora é com a gente.</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Assim que sua música estiver pronta, enviaremos o download para o e-mail informado.
      </p>

      {orderId && (
        <p className="mt-8 rounded-full border border-border bg-surface px-4 py-1.5 text-xs tracking-wide text-muted-foreground">
          Pedido {orderId}
        </p>
      )}

      <Link
        to="/"
        className="mt-10 inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-input"
      >
        Voltar para a página
      </Link>
    </main>
  );
}
