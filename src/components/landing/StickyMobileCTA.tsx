import { useEffect, useState } from "react";
import { CTAButton } from "./CTAButton";
import { PRICE } from "./offer";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  if (!visible) return null;
  return (
    <aside className="epic-sticky" aria-label="Criar sua música">
      <div>
        <span>Música personalizada</span>
        <strong>{PRICE}</strong>
      </div>
      <CTAButton size="md" location="sticky" />
    </aside>
  );
}
