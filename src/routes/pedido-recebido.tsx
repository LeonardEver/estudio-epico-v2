import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Music } from "lucide-react";
import { StreamingUpsell } from "@/components/landing/StreamingUpsell";
import { analytics } from "@/lib/analytics";

export const Route = createFileRoute("/pedido-recebido")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: typeof search["order_id"] === "string" ? (search["order_id"] as string) : undefined,
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
 * Pós-compra: primeiro o upsell premium do lançamento nas plataformas,
 * depois a confirmação do pedido (para onde o botão de recusa rola).
 * A confirmação deliberadamente NÃO afirma que a produção começou — isso só
 * acontece após o webhook de pagamento confirmar o pedido.
 */
function SuccessPage() {
  const { order_id: orderId } = Route.useSearch();

  useEffect(() => {
    analytics.streamingUpsellShown();
  }, []);

  const scrollToConfirmation = () => {
    document.getElementById("confirmacao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <StreamingUpsell onDecline={scrollToConfirmation} />

      <section id="confirmacao" className="flex flex-col items-center px-5 py-20 text-center">
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
      </section>
    </main>
  );
}
