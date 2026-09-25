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
import { WhatsAppCTA } from "@/components/landing/WhatsAppCTA";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { hasWhatsApp } from "@/lib/whatsapp";

const title = "Sua Música Personalizada | Estúdio Épico — sua ideia vira música profissional";
const description =
  "Conte sua ideia — uma história, homenagem, presente, marca ou negócio — e receba uma música profissional criada especialmente para você. A partir de R$67, pagamento único.";

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
      {/* Funil: promessa + preço → prova (UGC) → resultado real (músicas) →
          como funciona → aplicações → oferta → dúvidas → decisão.
          O preço vem ANTES do vídeo: o visitante entende a oferta primeiro. */}
      <HeroOffer />
      <UGCVideo />
      <AudioShowcase />
      <HowItWorks />
      <ForWhomSection />
      <WhatYouGet />
      <MainOffer />
      <FAQ />
      <FinalOffer />
      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        <p className="font-display text-sm font-bold tracking-widest text-foreground">
          ESTUDIO ÉPICO - PRODUÇÃO MUSICAL PROFISSIONAL
        </p>
        {hasWhatsApp() ? (
          <div className="mt-3">
            <WhatsAppCTA variant="link" label="Falar no WhatsApp" />
          </div>
        ) : (
          <p className="mt-2">[CONTATO: WhatsApp +55 11 95859-4370]</p>
        )}
        <p className="mt-2">© {new Date().getFullYear()} — Todos os direitos reservados.</p>
      </footer>
      <StickyMobileCTA />
      <WhatsAppFloat />
    </main>
  );
}
