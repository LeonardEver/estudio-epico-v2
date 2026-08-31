import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CHECKOUT_URL, CTA_LABEL, PRICE_ANCHOR, PRICE_NOW } from "./offer";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="leading-tight">
          <p className="text-[11px] text-muted-foreground line-through">{PRICE_ANCHOR}</p>
          <p className="offer-gradient-text font-display text-2xl font-extrabold">{PRICE_NOW}</p>
        </div>
        <a
          href={CHECKOUT_URL}
          className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display text-sm font-bold text-primary-foreground"
          style={{ boxShadow: "var(--shadow-offer)" }}
        >
          {CTA_LABEL}
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
