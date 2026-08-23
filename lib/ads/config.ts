export type AdPlacement = "top" | "middle" | "bottom" | "sidebar";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
const ADSENSE_CONSENT_READY =
  process.env.NEXT_PUBLIC_ADSENSE_CONSENT_READY === "true";

const AD_SLOTS: Record<AdPlacement, string> = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? "",
  middle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE ?? "",
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM ?? "",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
};

export function isValidAdsenseClientId(value: string): boolean {
  return /^ca-pub-\d{16}$/.test(value);
}

export function isValidAdsenseSlotId(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function getAdsensePublisherId(clientId: string): string | null {
  return isValidAdsenseClientId(clientId)
    ? clientId.replace("ca-pub-", "pub-")
    : null;
}

export const adsenseConfig = {
  clientId: ADSENSE_CLIENT_ID,
  enabled:
    ADSENSE_ENABLED &&
    ADSENSE_CONSENT_READY &&
    isValidAdsenseClientId(ADSENSE_CLIENT_ID),
  consentReady: ADSENSE_CONSENT_READY,
  slots: AD_SLOTS,
} as const;

export function getAdsenseSlot(placement: AdPlacement): string | null {
  const slot = adsenseConfig.slots[placement];
  return isValidAdsenseSlotId(slot) ? slot : null;
}
