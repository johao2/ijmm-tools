import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { issueSession, isValidSession, upstreamPage, upstreamSearch } = await import("@/lib/source-search/upstream");

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("pase temporal del proxy", () => {
  it("vale solo para la misma IP y antes de vencer", () => {
    vi.stubEnv("SOURCE_CHECK_SECRET", "secreto-de-prueba");
    const token = issueSession("1.2.3.4");
    expect(isValidSession(token, "1.2.3.4")).toBe(true);
    expect(isValidSession(token, "5.6.7.8")).toBe(false);
    expect(isValidSession(`${token}x`, "1.2.3.4")).toBe(false);
    expect(isValidSession("", "1.2.3.4")).toBe(false);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 4 * 60 * 1000);
    expect(isValidSession(token, "1.2.3.4")).toBe(false);
  });
});

describe("proxy de páginas", () => {
  it("no descarga direcciones internas ni protocolos distintos de http/https", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    for (const url of ["http://localhost/admin", "http://169.254.169.254/latest", "file:///etc/passwd", "http://10.0.0.1"]) {
      expect((await upstreamPage(url)).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sigue redirecciones solo hacia direcciones públicas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/secreto" } })));
    expect((await upstreamPage("https://ejemplo.org")).status).toBe(400);
  });

  it("reenvía HTML con su tipo original", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<p>hola</p>", { headers: { "content-type": "text/html; charset=utf-8" } })));
    const res = await upstreamPage("https://ejemplo.org/pagina");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Source-Content-Type")).toContain("text/html");
    expect(await res.text()).toBe("<p>hola</p>");
  });
});

describe("proxy de búsqueda", () => {
  it("agrega la clave del servicio y no la expone en la respuesta", async () => {
    vi.stubEnv("CORE_API_KEY", "clave-core");
    const fetchMock = vi.fn(async () => Response.json({ results: [] }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await upstreamSearch("core", "frase de prueba");
    expect(await res.json()).toEqual({ results: [] });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer clave-core");
  });

  it("rechaza servicios sin clave configurada", async () => {
    expect((await upstreamSearch("brave", "frase")).status).toBe(404);
  });
});
