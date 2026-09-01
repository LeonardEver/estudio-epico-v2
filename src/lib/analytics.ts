/**
 * Meta Pixel frontend events.
 *
 * The pixel ID is public by design (injected via VITE_META_PIXEL_ID) and the
 * helper is a no-op when the pixel is not configured or not yet loaded.
 * Purchase is NEVER fired from the frontend — payment confirmation comes
 * exclusively from the Kiwify webhook.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function track(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "src",
  "sck",
  "s1",
  "s2",
  "s3",
];

/** UTM/tracking params from the landing page URL — forwarded to Kiwify. */
export function captureTrackingParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    if (TRACKING_KEYS.includes(key) && value) params[key] = value;
  });
  return params;
}

export const analytics = {
  /** Fired when any "QUERO MINHA MÚSICA" CTA is clicked. */
  ctaClick(): void {
    track("CTA_Click");
  },
  /** Fired when the briefing modal opens. */
  briefingOpened(): void {
    track("Briefing_Opened");
  },
  /** Fired when a briefing is successfully submitted (order persisted). */
  briefSubmitted(orderId: string): void {
    track("Lead", { order_id: orderId });
  },
  /** Fired right before redirecting to the Kiwify checkout. */
  checkoutRedirect(orderId: string): void {
    track("InitiateCheckout", { order_id: orderId });
  },
};
