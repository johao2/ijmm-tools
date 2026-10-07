import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { isBlockedHost, SOURCE_TYPE_HEADER, type ProviderId } from "@/lib/source-search/providers";

/**
 * Proxy del detector de similitud (solo servidor). Agrega las claves privadas a cada consulta y devuelve
 * la respuesta del servicio sin procesarla, para consumir el mínimo de procesador en Cloudflare Workers.
 */

export function configuredProviders(): ProviderId[] {
  const list: ProviderId[] = [];
  if (process.env.BRAVE_SEARCH_API_KEY) list.push("brave");
  if (process.env.CORE_API_KEY) list.push("core");
  if (process.env.OPENALEX_API_KEY) list.push("openalex");
  return list;
}

const UPSTREAM_TIMEOUT_MS = 12_000;
const PAGE_TIMEOUT_MS = 10_000;
const MAX_PAGE_BYTES = 2_000_000;
/** Duración del pase de una revisión (búsquedas + descargas toman menos de 1 minuto) */
const SESSION_MS = 3 * 60 * 1000;

const noStore = { "Cache-Control": "no-store" };

/** Consulta al servicio con su clave y devuelve el JSON tal cual. */
export async function upstreamSearch(provider: ProviderId, phrase: string): Promise<Response> {
  let url: string;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (provider === "brave" && process.env.BRAVE_SEARCH_API_KEY) {
    url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(`"${phrase}"`)}&count=5&extra_snippets=true`;
    headers["X-Subscription-Token"] = process.env.BRAVE_SEARCH_API_KEY;
  } else if (provider === "core" && process.env.CORE_API_KEY) {
    // CORE falla con frases entre comillas; se busca sin comillas y la coincidencia exacta se verifica después
    url = `https://api.core.ac.uk/v3/search/works/?q=${encodeURIComponent(phrase)}&limit=3`;
    headers.Authorization = `Bearer ${process.env.CORE_API_KEY}`;
  } else if (provider === "openalex" && process.env.OPENALEX_API_KEY) {
    url = `https://api.openalex.org/works?search=${encodeURIComponent(`"${phrase}"`)}&per-page=3&select=id,doi,display_name,publication_year,primary_location,open_access,abstract_inverted_index&api_key=${encodeURIComponent(process.env.OPENALEX_API_KEY)}`;
  } else {
    return Response.json({ message: "Servicio no disponible." }, { status: 404, headers: noStore });
  }
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS), cache: "no-store" });
    return new Response(res.body, { status: res.status, headers: { "Content-Type": "application/json", ...noStore } });
  } catch {
    return Response.json({ message: "El servicio no respondió." }, { status: 504, headers: noStore });
  }
}

/** Corta la descarga al llegar al tamaño máximo (sin procesar el contenido). */
function capBytes(max: number) {
  let size = 0;
  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.length;
      if (size > max) {
        controller.terminate();
        return;
      }
      controller.enqueue(chunk);
    },
  });
}

/**
 * Descarga una página pública y la reenvía. Solo http/https, sin redes internas,
 * máximo 3 redirecciones, 2 MB y 10 s. Solo HTML o texto.
 */
export async function upstreamPage(rawUrl: string): Promise<Response> {
  const fail = (status: number) => new Response(null, { status, headers: noStore });
  let url = rawUrl;
  for (let hop = 0; hop < 4; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return fail(400);
    }
    if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) return fail(400);
    let res: Response;
    try {
      res = await fetch(parsed, {
        redirect: "manual",
        signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
        headers: { "User-Agent": "IJMM-Tools-SimilarityChecker/1.0 (+https://tools.ijmmsystem.com)", Accept: "text/html,text/plain" },
        cache: "no-store",
      });
    } catch {
      return fail(504);
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return fail(502);
      url = new URL(location, parsed).toString();
      continue;
    }
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !res.body || !/text\/html|text\/plain|application\/xhtml/.test(type)) return fail(415);
    return new Response(res.body.pipeThrough(capBytes(MAX_PAGE_BYTES)), {
      headers: { "Content-Type": "application/octet-stream", [SOURCE_TYPE_HEADER]: type, ...noStore },
    });
  }
  return fail(508);
}

/** Secreto para firmar los pases: SOURCE_CHECK_SECRET o, si no existe, uno derivado de las claves del servidor. */
function secret() {
  return process.env.SOURCE_CHECK_SECRET || createHash("sha256").update(`ijmm-tools:${process.env.BRAVE_SEARCH_API_KEY}:${process.env.CORE_API_KEY}:${process.env.OPENALEX_API_KEY}`).digest("hex");
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

/** Pase de una revisión, atado a la IP del visitante. */
export function issueSession(ip: string): string {
  const expires = String(Date.now() + SESSION_MS);
  return `${expires}.${sign(`${expires}:${ip}`)}`;
}

export function isValidSession(token: string, ip: string): boolean {
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(`${expires}:${ip}`));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconocida";
}
