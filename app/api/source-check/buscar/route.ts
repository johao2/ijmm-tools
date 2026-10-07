import type { ProviderId } from "@/lib/source-search/providers";
import { clientIp, isValidSession, upstreamSearch } from "@/lib/source-search/upstream";

export const dynamic = "force-dynamic";

const PROVIDERS: ProviderId[] = ["brave", "core", "openalex"];
/** Consultas máximas por pase (una revisión de 40 000 palabras usa menos de 200) */
const MAX_PER_SESSION = 250;
const used = new Map<string, number>();

/** Proxy de búsqueda: agrega la clave del servicio y devuelve su respuesta sin procesar. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const provider = params.get("p") as ProviderId;
  const phrase = (params.get("q") ?? "").slice(0, 300);
  const token = params.get("t") ?? "";
  if (!PROVIDERS.includes(provider) || phrase.trim().length < 3) return Response.json({ message: "Solicitud no válida." }, { status: 400 });
  if (!isValidSession(token, clientIp(req))) return Response.json({ message: "La revisión expiró. Vuelve a iniciarla." }, { status: 401 });
  const count = (used.get(token) ?? 0) + 1;
  if (count > MAX_PER_SESSION) return Response.json({ message: "Límite de consultas de esta revisión." }, { status: 429 });
  used.set(token, count);
  if (used.size > 5000) used.clear();
  return upstreamSearch(provider, phrase);
}
