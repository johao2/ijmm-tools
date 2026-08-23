"use client";

import { useEffect } from "react";
import {
  adsenseConfig,
  getAdsenseSlot,
  type AdPlacement,
} from "@/lib/ads/config";
import { cn } from "@/lib/utils/cn";

interface AdPlaceholderProps {
  placement: AdPlacement;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, never>[];
  }
}

const MIN_HEIGHTS: Record<AdPlacement, string> = {
  top: "min-h-24 sm:min-h-28",
  middle: "min-h-28 sm:min-h-32",
  bottom: "min-h-28 sm:min-h-32",
  sidebar: "min-h-64",
};

export default function AdPlaceholder({
  placement,
  className,
}: AdPlaceholderProps) {
  const slot = getAdsenseSlot(placement);
  const active = adsenseConfig.enabled && slot !== null;

  useEffect(() => {
    if (!active) return;

    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Ad delivery failures must never affect the tool experience.
    }
  }, [active, slot]);

  if (!active) return null;

  return (
    <aside
      aria-label="Publicidad"
      className={cn(
        "my-8 flex w-full flex-col overflow-hidden rounded-(--radius-md) border border-[var(--border)] bg-[var(--surface)]",
        MIN_HEIGHTS[placement],
        className
      )}
    >
      <span className="px-3 pt-2 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
        Publicidad
      </span>
      <ins
        className="adsbygoogle block flex-1"
        data-ad-client={adsenseConfig.clientId}
        data-ad-format="auto"
        data-ad-slot={slot}
        data-full-width-responsive="true"
        style={{ display: "block" }}
      />
    </aside>
  );
}
