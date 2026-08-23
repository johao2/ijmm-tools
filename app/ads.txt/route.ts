import {
  adsenseConfig,
  getAdsensePublisherId,
} from "@/lib/ads/config";

export const dynamic = "force-dynamic";

export function GET() {
  const publisherId = getAdsensePublisherId(adsenseConfig.clientId);

  if (!publisherId) {
    return new Response("Ad publisher not configured.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
