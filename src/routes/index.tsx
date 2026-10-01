import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { analytics, captureTrackingParams } from "@/lib/analytics";
import heroStudio from "@/assets/hero-studio.jpg";
import { HeroOffer } from "@/components/landing/HeroOffer";
import { UGCVideo } from "@/components/landing/UGCVideo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ForWhomSection } from "@/components/landing/ForWhomSection";
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
      { property: "og:image", content: `https://estudioepico.vercel.app${heroStudio}` },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    captureTrackingParams();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            analytics.sectionViewed(entry.target.id);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll("main > section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return (
    <main id="main-content" className="epic-landing">
      <HeroOffer />
      <AudioShowcase />
      <UGCVideo />
      <HowItWorks />
      <ForWhomSection />
      <MainOffer />
      <FAQ />
      <FinalOffer />
      <footer className="epic-footer epic-container">
        <p className="epic-brand">
          estúdio <strong>épico.</strong>
        </p>
        {hasWhatsApp() ? (
          <div className="mt-3">
            <WhatsAppCTA variant="link" label="Falar no WhatsApp" />
          </div>
        ) : null}
        <p>© {new Date().getFullYear()} Estúdio Épico. Música personalizada.</p>
      </footer>
      <StickyMobileCTA />
      <WhatsAppFloat />
    </main>
  );
}
