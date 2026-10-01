import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CTAButton({
  className,
  label = "Criar minha música",
  size = "lg",
  bundle = false,
  location = "oferta",
}: {
  className?: string;
  label?: string;
  size?: "lg" | "md";
  bundle?: boolean;
  location?: string;
}) {
  return (
    <Link
      to="/pedido"
      search={bundle ? { pacote: "completo" } : {}}
      onClick={() => analytics.ctaClick(location, bundle ? "pacote" : "musica")}
      className={cn("epic-cta", size === "md" && "epic-cta-small", className)}
    >
      {label}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}
