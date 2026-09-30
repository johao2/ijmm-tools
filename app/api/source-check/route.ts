import { checkSources, MAX_WORDS } from "@/lib/source-search/check";
import { configuredProviders } from "@/lib/source-search/providers";
import { tokenize } from "@/lib/tools/similarity";

export const dynamic = "force-dynamic";
// Las búsquedas y descargas pueden tardar; el orquestador se limita a ~45 s
export const maxDuration = 60;

const MIN_WORDS = 50;
const DAILY_LIMIT = Number(process.env.SOURCE_CHECK_DAILY_LIMIT ?? 3);
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Límite diario por IP en memoria. En Vercel cada instancia lleva su propio conteo,
 * así que es una protección básica contra abuso, no un contador exacto de facturación.
 */
const usage = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconocida";
}

function consume(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = usage.get(ip);
  if (!entry || entry.resetAt < now) {
    usage.set(ip, { count: 1, resetAt: now + DAY_MS });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  if (entry.count >= DAILY_LIMIT) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Estado del servicio: qué fuentes están configuradas. */
export function GET() {
  return json({ providers: configuredProviders(), dailyLimit: DAILY_LIMIT, maxWords: MAX_WORDS });
}

export async function POST(req: Request) {
  // Solo peticiones desde el propio sitio
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ message: "Origen no permitido." }, 403);

  if (configuredProviders().length === 0) {
    return json({ message: "La búsqueda en internet y repositorios aún no está activada en este sitio." }, 503);
  }

  let body: { text?: unknown; ngram?: unknown; consent?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ message: "Solicitud no válida." }, 400);
  }
  if (body.consent !== true) {
    return json({ message: "Debes aceptar el envío del texto para buscar fuentes en internet." }, 400);
  }
  const text = typeof body.text === "string" ? body.text : "";
  const ngram = [4, 5, 7].includes(Number(body.ngram)) ? Number(body.ngram) : 5;
  const words = tokenize(text).length;
  if (words < MIN_WORDS) return json({ message: `El documento debe tener al menos ${MIN_WORDS} palabras.` }, 400);
  if (words > MAX_WORDS) return json({ message: `El documento tiene ${words} palabras; el máximo por revisión es ${MAX_WORDS}.` }, 400);

  const quota = consume(clientIp(req));
  if (!quota.allowed) {
    return json({ message: `Alcanzaste el límite de ${DAILY_LIMIT} revisiones en internet por día. Vuelve a intentarlo mañana.` }, 429);
  }

  try {
    const result = await checkSources(text, ngram);
    return json({ ...result, remaining: quota.remaining });
  } catch {
    return json({ message: "No se pudo completar la búsqueda. Inténtalo de nuevo en unos minutos." }, 502);
  }
}
