import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  trackEvent,
  registerAnalyticsProvider,
  clearAnalyticsProviders,
} from "../events";

describe("Analytics Event Architecture", () => {
  beforeEach(() => {
    clearAnalyticsProviders();
  });

  it("should dispatch events safely when no providers are registered", () => {
    expect(() => {
      trackEvent("tool_view", { toolId: "percentage-calculator" });
    }).not.toThrow();
  });

  it("should notify registered providers when an event is tracked", () => {
    const mockHandler = vi.fn();
    registerAnalyticsProvider(mockHandler);

    trackEvent("tool_complete", {
      toolId: "percentage-calculator",
      mode: "percentage_of",
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(
      "tool_complete",
      expect.objectContaining({
        toolId: "percentage-calculator",
        mode: "percentage_of",
        timestamp: expect.any(Number),
      })
    );
  });

  it("should support multiple analytics providers simultaneously", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    registerAnalyticsProvider(handler1);
    registerAnalyticsProvider(handler2);

    trackEvent("result_copy", { toolId: "percentage-calculator" });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("should support unregistering a provider", () => {
    const mockHandler = vi.fn();
    const unregister = registerAnalyticsProvider(mockHandler);

    trackEvent("tool_start", { toolId: "percentage-calculator" });
    expect(mockHandler).toHaveBeenCalledTimes(1);

    unregister();

    trackEvent("tool_start", { toolId: "percentage-calculator" });
    expect(mockHandler).toHaveBeenCalledTimes(1); // Remains 1, not called second time
  });

  it("should protect execution if a provider handler throws an exception", () => {
    const faultyHandler = vi.fn().mockImplementation(() => {
      throw new Error("Provider network failure");
    });
    const goodHandler = vi.fn();

    registerAnalyticsProvider(faultyHandler);
    registerAnalyticsProvider(goodHandler);

    expect(() => {
      trackEvent("tool_error", { toolId: "percentage-calculator", errorCode: "DIVISION_BY_ZERO" });
    }).not.toThrow();

    expect(faultyHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });
});
