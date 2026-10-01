import { createFileRoute } from "@tanstack/react-router";
import { OrderWizard } from "@/components/order/OrderWizard";

export const Route = createFileRoute("/pedido")({
  validateSearch: (search: Record<string, unknown>): { pacote?: "completo" } =>
    search["pacote"] === "completo" ? { pacote: "completo" } : {},
  head: () => ({
    meta: [
      { title: "Crie sua música personalizada | Estúdio Épico" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

/**
 * Página de pedido — configuração da música + extras + pagamento.
 * A landing page vende; esta página converte.
 */
function OrderPage() {
  const { pacote } = Route.useSearch();
  return <OrderWizard key={pacote ?? "musica"} initialBundle={pacote === "completo"} />;
}
