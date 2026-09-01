"use client";

import { ArrowRight } from "lucide-react";
import { CTA_LABEL } from "./offer";
import { useCheckoutFlow } from "./checkout-flow";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CTAButton({
  className,
  label = CTA_LABEL,
  size = "lg",
}: {
  className?: string;
  label?: string;
  size?: "lg" | "md";
}) {
  const { openBriefing } = useCheckoutFlow();

  return (
    <button
      type="button"
      onClick={() => {
        analytics.ctaClick();
        openBriefing();
      }}
      className={cn(
        "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-price)] font-display font-bold tracking-wide text-primary-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] sm:w-auto",
        size === "lg" ? "min-h-14 px-8 text-base sm:text-lg" : "min-h-12 px-6 text-sm",
        className,
      )}
      style={{ boxShadow: "var(--shadow-offer)" }}
    >
      {label}
      <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  );
}
