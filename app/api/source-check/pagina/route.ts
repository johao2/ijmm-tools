import { clientIp, isValidSession, upstreamPage } from "@/lib/source-search/upstream";

export const dynamic = "force-dynamic";

/** Descargas máximas por pase (el detector descarga hasta 40 páginas) */
const MAX_PER_SESSION = 60;
const used = new Map<string, number>();

/** Proxy de descarga de páginas públicas para compararlas con el documento (el análisis se hace en el navegador). */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const url = params.get("u") ?? "";
  const token = params.get("t") ?? "";
  if (!url || url.length > 2048) return new Response(null, { status: 400 });
  if (!isValidSession(token, clientIp(req))) return new Response(null, { status: 401 });
  const count = (used.get(token) ?? 0) + 1;
  if (count > MAX_PER_SESSION) return new Response(null, { status: 429 });
  used.set(token, count);
  if (used.size > 5000) used.clear();
  return upstreamPage(url);
}
