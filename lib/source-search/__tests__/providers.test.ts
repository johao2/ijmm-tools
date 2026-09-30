import { describe, expect, it, vi } from "vitest";

// "server-only" impide importar el módulo fuera del servidor de Next; en pruebas se reemplaza
vi.mock("server-only", () => ({}));

const { isBlockedHost } = await import("@/lib/source-search/providers");

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
