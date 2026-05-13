"use client";

import { useCallback, useState } from "react";

/** Typed API error from the backend */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isRateLimited() { return this.status === 429; }
  get isServerError() { return this.status >= 500; }
}

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for typed API calls with loading/error state management.
 *
 * Usage:
 *   const { data, error, isLoading, execute } = useApi(
 *     () => api.guilds.list(),
 *     { onError: (e) => e.isUnauthorized && router.push("/login") }
 *   );
 */
export function useApi<T>(
  fetcher: (...args: unknown[]) => Promise<T>,
  options?: UseApiOptions<T>,
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: unknown[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher(...args);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError
        ? err
        : new ApiError(0, err instanceof Error ? err.message : "Unknown error");
      setError(apiError);
      options?.onError?.(apiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}

/**
 * Inline error display for API errors.
 */
export function ApiErrorDisplay({ error, onRetry }: { error: ApiError | null; onRetry?: () => void }) {
  if (!error) return null;

  const getMessage = () => {
    if (error.isUnauthorized) return "Your session has expired. Please log in again.";
    if (error.isForbidden) return "You don't have permission to perform this action.";
    if (error.isRateLimited) return "Too many requests. Please wait a moment.";
    if (error.isServerError) return "Something went wrong on our end. We're looking into it.";
    return error.message;
  };

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
      <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
        <span>⚠️</span>
        <span>Error {error.status > 0 ? `(${error.status})` : ""}</span>
      </div>
      <p className="text-red-300/80">{getMessage()}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-xs font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
