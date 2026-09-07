import { createFileRoute } from "@tanstack/react-router";
import { OrderWizard } from "@/components/order/OrderWizard";

export const Route = createFileRoute("/pedido")({
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
  return <OrderWizard />;
}
