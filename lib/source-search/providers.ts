import "server-only";
import { abstractFromInvertedIndex, htmlToText } from "@/lib/source-search/text";

/**
 * Conectores a servicios de búsqueda. Solo se ejecutan en el servidor:
 * las claves viven en variables de entorno y nunca llegan al navegador.
 */

export type ProviderId = "brave" | "core" | "openalex";
export type AnalysisLevel = "full" | "abstract" | "snippet";

export interface Candidate {
  provider: ProviderId;
  url: string;
  title: string;
  /** Texto disponible sin descargar la página (texto completo de CORE, resumen de OpenAlex, extracto de Brave) */
  text: string;
  level: AnalysisLevel;
  /** Brave: se intentará descargar la página para analizar el texto completo */
  fetchPage?: boolean;
  year?: number;
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  brave: "Internet (Brave Search)",
  core: "Repositorios académicos (CORE)",
  openalex: "Publicaciones académicas (OpenAlex)",
};

export function configuredProviders(): ProviderId[] {
  const list: ProviderId[] = [];
  if (process.env.BRAVE_SEARCH_API_KEY) list.push("brave");
  if (process.env.CORE_API_KEY) list.push("core");
  if (process.env.OPENALEX_API_KEY) list.push("openalex");
  return list;
}

const TIMEOUT_MS = 12_000;

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const asString = (v: unknown) => (typeof v === "string" ? v : "");

/** Brave Search: búsqueda web por frase exacta. */
export async function searchBrave(phrase: string): Promise<Candidate[]> {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(`"${phrase}"`)}&count=5&extra_snippets=true`;
  const data = (await getJson(url, { "X-Subscription-Token": key })) as { web?: { results?: Record<string, unknown>[] } };
  return (data.web?.results ?? []).map((r) => ({
    provider: "brave" as const,
    url: asString(r.url),
    title: asString(r.title).replace(/<[^>]+>/g, ""),
    text: htmlToText([asString(r.description), ...(Array.isArray(r.extra_snippets) ? r.extra_snippets.map(asString) : [])].join("\n")),
    level: "snippet" as const,
    fetchPage: true,
  })).filter((c) => c.url.startsWith("http"));
}

/** CORE: repositorios institucionales y revistas de acceso abierto, con texto completo. */
export async function searchCore(phrase: string): Promise<Candidate[]> {
  const key = process.env.CORE_API_KEY;
  if (!key) return [];
  const url = `https://api.core.ac.uk/v3/search/works/?q=${encodeURIComponent(`"${phrase}"`)}&limit=3`;
  const data = (await getJson(url, { Authorization: `Bearer ${key}` })) as { results?: Record<string, unknown>[] };
  return (data.results ?? []).map((w) => {
    const links = Array.isArray(w.links) ? (w.links as { type?: string; url?: string }[]) : [];
    const display = links.find((l) => l.type === "display")?.url;
    const doi = asString(w.doi);
    const link = display || (doi ? `https://doi.org/${doi}` : "") || asString(w.downloadUrl) || (w.id ? `https://core.ac.uk/works/${w.id}` : "");
    const fullText = asString(w.fullText);
    return {
      provider: "core" as const,
      url: link,
      title: asString(w.title),
      text: fullText || asString(w.abstract),
      level: fullText ? ("full" as const) : ("abstract" as const),
      year: typeof w.yearPublished === "number" ? w.yearPublished : undefined,
    };
  }).filter((c) => c.url);
}

/** OpenAlex: catálogo académico mundial. Devuelve el resumen (el texto completo no se entrega por API). */
export async function searchOpenAlex(phrase: string): Promise<Candidate[]> {
  const key = process.env.OPENALEX_API_KEY;
  if (!key) return [];
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(`"${phrase}"`)}&per-page=3&select=id,doi,display_name,publication_year,primary_location,open_access,abstract_inverted_index&api_key=${encodeURIComponent(key)}`;
  const data = (await getJson(url)) as { results?: Record<string, unknown>[] };
  return (data.results ?? []).map((w) => {
    const location = (w.primary_location ?? {}) as { landing_page_url?: string };
    const oa = (w.open_access ?? {}) as { oa_url?: string };
    return {
      provider: "openalex" as const,
      url: asString(w.doi) || location.landing_page_url || oa.oa_url || asString(w.id),
      title: asString(w.display_name),
      text: abstractFromInvertedIndex(w.abstract_inverted_index as Record<string, number[]> | null),
      level: "abstract" as const,
      year: typeof w.publication_year === "number" ? w.publication_year : undefined,
    };
  }).filter((c) => c.url);
}

/** Direcciones que nunca se descargan (red interna, equipo local, metadatos de la nube). */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") || !h.includes(".") && !h.includes(":")) return true;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h)) return true;
  if (h.includes(":") && (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80") || h === "::")) return true;
  return false;
}

const MAX_BYTES = 2_000_000;

/**
 * Descarga una página pública y devuelve su texto. Solo http/https, sin redes internas,
 * máximo 3 redirecciones, 2 MB y 10 s. Devuelve null si no es HTML o texto.
 */
export async function fetchPageText(rawUrl: string): Promise<string | null> {
  let url = rawUrl;
  for (let hop = 0; hop < 4; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) return null;
    const res = await fetch(parsed, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "IJMM-Tools-SimilarityChecker/1.0 (+https://tools.ijmmsystem.com)", Accept: "text/html,text/plain" },
      cache: "no-store",
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return null;
      url = new URL(location, parsed).toString();
      continue;
    }
    if (!res.ok || !res.body) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/.test(type)) return null;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const body = new TextDecoder("utf-8").decode(Buffer.concat(chunks));
    return type.includes("text/plain") ? body : htmlToText(body);
  }
  return null;
}
