import { describe, expect, it, vi } from "vitest";

// "server-only" impide importar el módulo fuera del servidor de Next; en pruebas se reemplaza
vi.mock("server-only", () => ({}));

const { isBlockedHost, searchCore } = await import("@/lib/source-search/providers");

describe("isBlockedHost", () => {
  it("bloquea redes internas, equipo local y metadatos de la nube", () => {
    for (const host of ["localhost", "app.localhost", "127.0.0.1", "10.0.0.5", "192.168.1.10", "172.16.0.1", "172.31.255.1", "169.254.169.254", "100.64.0.1", "[::1]", "fd00::1", "intranet", "servidor.local", "api.internal"]) {
      expect(isBlockedHost(host), host).toBe(true);
    }
  });

  it("permite dominios públicos", () => {
    for (const host of ["repositorio.uce.edu.ec", "www.scielo.org", "doi.org", "172.32.0.1", "8.8.8.8"]) {
      expect(isBlockedHost(host), host).toBe(false);
    }
  });
});

describe("reintento ante fallas pasajeras", () => {
  const ok = { results: [{ id: 1, title: "Obra", fullText: "texto completo" }] };
  const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });

  it("reintenta una vez si el servicio responde 503 y usa la segunda respuesta", async () => {
    vi.stubEnv("CORE_API_KEY", "prueba");
    const fetchMock = vi.fn().mockResolvedValueOnce(json(503)).mockResolvedValueOnce(json(200, ok));
    vi.stubGlobal("fetch", fetchMock);
    const r = await searchCore("frase de prueba");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(r).toHaveLength(1);
    expect(r[0].url).toBe("https://core.ac.uk/works/1");
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("reintenta una vez si se agota el tiempo de espera", async () => {
    vi.stubEnv("CORE_API_KEY", "prueba");
    const timeout = Object.assign(new Error("timeout"), { name: "TimeoutError" });
    const fetchMock = vi.fn().mockRejectedValueOnce(timeout).mockResolvedValueOnce(json(200, ok));
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchCore("frase")).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("no reintenta errores definitivos (401) y falla tras dos intentos pasajeros", async () => {
    vi.stubEnv("CORE_API_KEY", "prueba");
    const unauthorized = vi.fn().mockResolvedValue(json(401));
    vi.stubGlobal("fetch", unauthorized);
    await expect(searchCore("frase")).rejects.toThrow("HTTP 401");
    expect(unauthorized).toHaveBeenCalledTimes(1);

    const down = vi.fn().mockResolvedValue(json(504));
    vi.stubGlobal("fetch", down);
    await expect(searchCore("frase")).rejects.toThrow("HTTP 504");
    expect(down).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});
