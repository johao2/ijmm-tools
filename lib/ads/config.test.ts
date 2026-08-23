import { describe, expect, it } from "vitest";
import {
  getAdsensePublisherId,
  isValidAdsenseClientId,
  isValidAdsenseSlotId,
} from "./config";

describe("AdSense configuration", () => {
  it("accepts only a complete AdSense client identifier", () => {
    expect(isValidAdsenseClientId("ca-pub-1234567890123456")).toBe(true);
    expect(isValidAdsenseClientId("pub-1234567890123456")).toBe(false);
    expect(isValidAdsenseClientId("ca-pub-1234")).toBe(false);
    expect(isValidAdsenseClientId("")).toBe(false);
  });

  it("accepts only ten-digit ad slot identifiers", () => {
    expect(isValidAdsenseSlotId("1234567890")).toBe(true);
    expect(isValidAdsenseSlotId("12345")).toBe(false);
    expect(isValidAdsenseSlotId("slot123456")).toBe(false);
  });

  it("derives the ads.txt publisher identifier safely", () => {
    expect(getAdsensePublisherId("ca-pub-1234567890123456")).toBe(
      "pub-1234567890123456"
    );
    expect(getAdsensePublisherId("invalid")).toBeNull();
  });
});
