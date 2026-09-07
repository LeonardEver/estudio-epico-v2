import { createFileRoute } from "@tanstack/react-router";
import { HeroOffer } from "@/components/landing/HeroOffer";
import { UGCVideo } from "@/components/landing/UGCVideo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ForWhomSection } from "@/components/landing/ForWhomSection";
import { WhatYouGet } from "@/components/landing/WhatYouGet";
import { AudioShowcase } from "@/components/landing/AudioShowcase";
import { MainOffer } from "@/components/landing/MainOffer";
import { FAQ } from "@/components/landing/FAQ";
import { FinalOffer } from "@/components/landing/FinalOffer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";

const title = "Sua Música Personalizada | Estúdio Épico — sua ideia vira música profissional";
const description =
  "Conte sua ideia — uma história, homenagem, presente, marca ou negócio — e receba uma música profissional criada especialmente para você. A partir de R$79,90, pagamento único.";

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
      {/* Funil: atenção → curiosidade → demonstração → desejo → prova → oferta → decisão */}
      <HeroOffer />
      <UGCVideo />
      <HowItWorks />
      <ForWhomSection />
      <WhatYouGet />
      <AudioShowcase />
      <MainOffer />
      <FAQ />
      <FinalOffer />
      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        <p className="font-display text-sm font-bold tracking-widest text-foreground">
          ESTUDIO ÉPICO - PRODUÇÃO MUSICAL PROFISSIONAL
        </p>
        <p className="mt-2">[CONTATO: inserir e-mail ou WhatsApp]</p>
        <p className="mt-1">© {new Date().getFullYear()} — Todos os direitos reservados.</p>
      </footer>
      <StickyMobileCTA />
    </main>
  );
}
