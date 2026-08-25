import { describe, expect, it } from "vitest";
import {
  buildQrPayload,
  generateQrMatrix,
  MAX_QR_CONTENT_LENGTH,
  validateQrColors,
  type QrErrorCorrection,
} from "@/lib/tools/qr";

describe("QR generator engine", () => {
  it("builds trimmed text payloads", () => {
    expect(buildQrPayload({ type: "text", text: "  Hola IJMM  " })).toEqual({
      success: true,
      payload: "Hola IJMM",
      type: "text",
    });
  });

  it("rejects empty text and URLs", () => {
    expect(buildQrPayload({ type: "text", text: "  " })).toMatchObject({
      success: false,
      code: "EMPTY_CONTENT",
    });
    expect(buildQrPayload({ type: "url", url: "" })).toMatchObject({
      success: false,
      code: "EMPTY_CONTENT",
    });
  });

  it("accepts complete HTTP and HTTPS URLs", () => {
    expect(buildQrPayload({ type: "url", url: "https://ijmmsystem.com/tools?q=1" })).toMatchObject({
      success: true,
      type: "url",
    });
    expect(buildQrPayload({ type: "url", url: "http://localhost:3000" }).success).toBe(true);
  });

  it.each(["ijmmsystem.com", "javascript:alert(1)", "ftp://example.com"])(
    "rejects the invalid or unsupported URL %s",
    (url) => {
      expect(buildQrPayload({ type: "url", url })).toMatchObject({
        success: false,
        code: "INVALID_URL",
      });
    }
  );

  it("builds escaped Wi-Fi payloads", () => {
    expect(
      buildQrPayload({
        type: "wifi",
        ssid: "Casa;IJMM",
        password: "clave:segura,1\\2",
        security: "WPA",
        hidden: true,
      })
    ).toEqual({
      success: true,
      payload: "WIFI:T:WPA;S:Casa\\;IJMM;P:clave\\:segura\\,1\\\\2;H:true;;",
      type: "wifi",
    });
  });

  it("supports open Wi-Fi networks without a password", () => {
    expect(
      buildQrPayload({
        type: "wifi",
        ssid: "Invitados",
        password: "ignored",
        security: "nopass",
        hidden: false,
      })
    ).toMatchObject({
      success: true,
      payload: "WIFI:T:nopass;S:Invitados;P:;H:false;;",
    });
  });

  it("requires an SSID and a password for secured networks", () => {
    expect(
      buildQrPayload({ type: "wifi", ssid: "", password: "x", security: "WPA", hidden: false })
    ).toMatchObject({ success: false, code: "EMPTY_CONTENT" });
    expect(
      buildQrPayload({ type: "wifi", ssid: "Casa", password: "", security: "WEP", hidden: false })
    ).toMatchObject({ success: false, code: "MISSING_WIFI_PASSWORD" });
  });

  it("rejects payloads above the product limit", () => {
    const oversized = "a".repeat(MAX_QR_CONTENT_LENGTH + 1);
    expect(buildQrPayload({ type: "text", text: oversized })).toMatchObject({
      success: false,
      code: "CONTENT_TOO_LARGE",
    });
    expect(generateQrMatrix(oversized)).toMatchObject({
      success: false,
      code: "CONTENT_TOO_LARGE",
    });
  });

  it.each(["L", "M", "Q", "H"] as QrErrorCorrection[])(
    "generates a square boolean matrix with %s correction",
    (level) => {
      const result = generateQrMatrix("https://tools.ijmmsystem.com", level);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.moduleCount).toBeGreaterThanOrEqual(21);
        expect(result.matrix).toHaveLength(result.moduleCount);
        result.matrix.forEach((row) => {
          expect(row).toHaveLength(result.moduleCount);
          row.forEach((module) => expect(typeof module).toBe("boolean"));
        });
        expect(result.matrix[0][0]).toBe(true);
      }
    }
  );

  it("rejects an empty matrix payload", () => {
    expect(generateQrMatrix(" \n ")).toMatchObject({
      success: false,
      code: "EMPTY_CONTENT",
    });
  });

  it("reports QR capacity overflow safely", () => {
    expect(generateQrMatrix("á".repeat(MAX_QR_CONTENT_LENGTH), "H")).toMatchObject({
      success: false,
      code: "CAPACITY_EXCEEDED",
    });
  });

  it("accepts high-contrast QR colors", () => {
    expect(validateQrColors("#111827", "#ffffff")).toEqual({
      success: true,
      contrastRatio: 17.74,
    });
  });

  it.each([
    ["#ffffff", "#111827", "LOW_CONTRAST"],
    ["#777777", "#888888", "LOW_CONTRAST"],
    ["black", "#ffffff", "INVALID_COLORS"],
  ])("rejects unsafe color pair %s on %s", (dark, light, code) => {
    expect(validateQrColors(dark, light)).toMatchObject({ success: false, code });
  });
});
