import { createFileRoute } from "@tanstack/react-router";
import { HeroOffer } from "@/components/landing/HeroOffer";
import { UGCVideo } from "@/components/landing/UGCVideo";
import { BenefitGrid } from "@/components/landing/BenefitGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AudioShowcase } from "@/components/landing/AudioShowcase";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { ValueSection } from "@/components/landing/ValueSection";
import { ObjectionSection } from "@/components/landing/ObjectionSection";
import { FAQ } from "@/components/landing/FAQ";
import { FinalOffer } from "@/components/landing/FinalOffer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";

const title = "Música personalizada por R$67 | Sua ideia vira uma música profissional";
const description =
  "Conte sua ideia — estilo, clima, referência ou letra — e receba uma música profissional pronta. De R$150 por R$67, pagamento único.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background pb-20 lg:pb-0">
      <HeroOffer />
      <UGCVideo />
      <BenefitGrid />
      <HowItWorks />
      <AudioShowcase />
      <TestimonialSection />
      <ValueSection />
      <ObjectionSection />
      <FAQ />
      <FinalOffer />
      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        <p className="font-display text-sm font-bold tracking-widest text-foreground">
          PRODUÇÃO MUSICAL PERSONALIZADA
        </p>
        <p className="mt-2">[CONTATO: inserir e-mail ou WhatsApp]</p>
        <p className="mt-1">© {new Date().getFullYear()} — Todos os direitos reservados.</p>
      </footer>
      <StickyMobileCTA />
    </main>
  );
}
