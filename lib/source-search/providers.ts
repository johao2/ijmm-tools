import { abstractFromInvertedIndex, htmlToText } from "@/lib/source-search/text";

/**
 * Conectores a servicios de búsqueda. Se ejecutan en el navegador: cada consulta pasa por el proxy del sitio
 * (/api/source-check/buscar y /pagina), que agrega las claves privadas y devuelve la respuesta tal cual.
 * Así el análisis (que consume procesador) ocurre en el equipo del usuario y el servidor solo reenvía.
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

export const PROVIDER_IDS: ProviderId[] = ["brave", "core", "openalex"];

/** Pase temporal que entrega el servidor al iniciar una revisión (limita el uso del proxy). */
let sessionToken = "";
export function setSearchSession(token: string) {
  sessionToken = token;
}

const TIMEOUT_MS = 15_000;

const RETRY_DELAY_MS = 800;

/** Fallas pasajeras del servicio (saturación, límite momentáneo, error interno): se reintenta una vez. */
const isTransientStatus = (status: number) => status === 429 || status >= 500;
/** Tiempo de espera agotado o error de red. */
const isTransientError = (err: unknown) => ["TimeoutError", "AbortError", "TypeError"].includes((err as Error).name);

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, { headers: { Accept: "application/json", ...headers }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    } catch (err) {
      if (attempt >= 2 || !isTransientError(err)) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      continue;
    }
    if (res.ok) return res.json();
    if (attempt >= 2 || !isTransientStatus(res.status)) throw new Error(`HTTP ${res.status}`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
}

const searchUrl = (provider: ProviderId, phrase: string) => `/api/source-check/buscar?p=${provider}&q=${encodeURIComponent(phrase)}&t=${encodeURIComponent(sessionToken)}`;

const asString = (v: unknown) => (typeof v === "string" ? v : "");

/** Brave Search: búsqueda web por frase exacta. */
export async function searchBrave(phrase: string): Promise<Candidate[]> {
  const data = (await getJson(searchUrl("brave", phrase))) as { web?: { results?: Record<string, unknown>[] } };
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
  const data = (await getJson(searchUrl("core", phrase))) as { results?: Record<string, unknown>[] };
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
  const data = (await getJson(searchUrl("openalex", phrase))) as { results?: Record<string, unknown>[] };
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

/** Cabecera con el tipo de contenido original de la página descargada por el proxy. */
export const SOURCE_TYPE_HEADER = "X-Source-Content-Type";

/**
 * Descarga una página pública (a través del proxy) y devuelve su texto. Devuelve null si no es HTML o texto,
 * si la dirección no es pública o si la página no responde.
 */
export async function fetchPageText(rawUrl: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) return null;
  const res = await fetch(`/api/source-check/pagina?u=${encodeURIComponent(parsed.toString())}&t=${encodeURIComponent(sessionToken)}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const type = res.headers.get(SOURCE_TYPE_HEADER) ?? "";
  if (!/text\/html|text\/plain|application\/xhtml/.test(type)) return null;
  const body = new TextDecoder("utf-8").decode(await res.arrayBuffer());
  return type.includes("text/plain") ? body : htmlToText(body);
}
