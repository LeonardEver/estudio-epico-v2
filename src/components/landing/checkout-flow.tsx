"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { BriefingModal } from "./BriefingModal";

type CheckoutFlowContextValue = {
  /** Opens the briefing modal (any CTA calls this instead of navigating). */
  openBriefing: () => void;
};

const CheckoutFlowContext = createContext<CheckoutFlowContextValue | null>(null);

export function CheckoutFlowProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openBriefing = useCallback(() => setOpen(true), []);

  return (
    <CheckoutFlowContext.Provider value={{ openBriefing }}>
      {children}
      <BriefingModal open={open} onOpenChange={setOpen} />
    </CheckoutFlowContext.Provider>
  );
}

export function useCheckoutFlow(): CheckoutFlowContextValue {
  const context = useContext(CheckoutFlowContext);
  if (!context) throw new Error("useCheckoutFlow must be used inside CheckoutFlowProvider");
  return context;
}
