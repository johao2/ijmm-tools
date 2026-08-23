/**
 * Centralized, Provider-Agnostic Analytics Architecture for IJMM Tools
 * 
 * Guarantees:
 * - Vendor-agnostic event dispatching (Zero hardcoded third-party SDKs).
 * - Exception-safe execution (Never breaks UI or calculations).
 * - Extensible provider subscriber pattern for future analytics adapters.
 */

export type StandardEventName =
  | "tool_view"
  | "tool_start"
  | "tool_complete"
  | "tool_error"
  | "result_copy"
  | "result_download"
  | "tool_share"
  | "search_perform"
  | "category_view";

export interface AnalyticsEventPayload {
  toolId?: string;
  categoryId?: string;
  errorCode?: string;
  mode?: string;
  resultCount?: number;
}

export interface AnalyticsDispatchPayload extends AnalyticsEventPayload {
  timestamp: number;
}

export type AnalyticsProviderHandler = (
  eventName: StandardEventName,
  payload: AnalyticsDispatchPayload
) => void;

// Internal registry of analytics subscribers/adapters
const registeredProviders: Set<AnalyticsProviderHandler> = new Set();

/**
 * Register a custom analytics provider (e.g. Google Analytics adapter, PostHog, internal logger).
 * Returns an unregister function.
 */
export function registerAnalyticsProvider(handler: AnalyticsProviderHandler): () => void {
  registeredProviders.add(handler);
  return () => {
    registeredProviders.delete(handler);
  };
}

/**
 * Clears all registered analytics providers (useful for testing).
 */
export function clearAnalyticsProviders(): void {
  registeredProviders.clear();
}

/**
 * Centralized event tracking function.
 * Called by UI components across the platform.
 */
export function trackEvent(
  eventName: StandardEventName,
  payload?: AnalyticsEventPayload
): void {
  try {
    const formattedPayload: AnalyticsDispatchPayload = {
      timestamp: Date.now(),
      ...(payload?.toolId ? { toolId: payload.toolId } : {}),
      ...(payload?.categoryId ? { categoryId: payload.categoryId } : {}),
      ...(payload?.errorCode ? { errorCode: payload.errorCode } : {}),
      ...(payload?.mode ? { mode: payload.mode } : {}),
      ...(typeof payload?.resultCount === "number"
        ? { resultCount: payload.resultCount }
        : {}),
    };

    // Development environment debug log
    if (process.env.NODE_ENV === "development") {
      // Intentionally silent or subtle debug logging if needed
    }

    // Dispatch event to all registered providers
    registeredProviders.forEach((provider) => {
      try {
        provider(eventName, formattedPayload);
      } catch {
        // Individual provider failures are swallowed to protect UI execution
      }
    });
  } catch {
    // Global tracking safety wrapper
  }
}
