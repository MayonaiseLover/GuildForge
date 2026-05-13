/**
 * Error tracking and reporting utility.
 * Wraps Sentry (or any error tracker) behind a unified interface.
 *
 * Usage:
 *   import { captureError, captureMessage } from "./error-tracking";
 *   captureError(error, { userId, route: "/teams" });
 *   captureMessage("Billing checkout attempted", "info");
 *
 * When SENTRY_DSN is not set, errors are logged to stdout via Pino.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sentry: any = null;

async function getSentry() {
  if (_sentry) return _sentry;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;
  try {
    // @ts-expect-error — @sentry/node is an optional runtime dependency
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      release: process.env.npm_package_version || "1.0.0",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      integrations: [],
    });
    _sentry = Sentry;
    return Sentry;
  } catch {
    return null;
  }
}

export async function captureError(
  error: Error | unknown,
  context?: Record<string, unknown>,
) {
  const sentry = await getSentry();
  if (sentry) {
    sentry.captureException(error, { extra: context });
  }
  // Always log to stdout for structured logging pickup
  const err = error instanceof Error ? error : new Error(String(error));
  console.error("[error-tracking]", err.message, context ?? {});
}

export async function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>,
) {
  const sentry = await getSentry();
  if (sentry) {
    sentry.captureMessage(message, { level, extra: context });
  }
  console.log(`[error-tracking:${level}]`, message, context ?? {});
}

/** Fastify onError hook — wire into app for automatic error capture */
export function errorHook() {
  return async (req: any, _reply: any, error: Error) => {
    await captureError(error, {
      method: req.method,
      url: req.url,
      userId: req.user?.id,
      reqId: req.id,
    });
  };
}
