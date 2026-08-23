import Script from "next/script";
import { adsenseConfig } from "@/lib/ads/config";

export default function AdSenseScript() {
  if (!adsenseConfig.enabled) return null;

  return (
    <Script
      id="ijmm-adsense"
      async
      crossOrigin="anonymous"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.clientId}`}
    />
  );
}
