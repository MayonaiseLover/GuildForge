/**
 * Request duration metrics plugin — collects per-route timing histograms.
 *
 * Exposes GET /metrics returning Prometheus-compatible text format.
 * Tracks: http_request_duration_seconds (histogram by method + route + status)
 *         http_requests_total (counter by method + route + status)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface Bucket {
  le: number;
  count: number;
}

interface MetricKey {
  method: string;
  route: string;
  status: string;
}

interface Histogram {
  sum: number;
  count: number;
  buckets: Bucket[];
}

const BUCKET_BOUNDARIES = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

class MetricsCollector {
  private histograms = new Map<string, Histogram>();
  private counters = new Map<string, number>();

  private key(m: MetricKey): string {
    return `${m.method}|${m.route}|${m.status}`;
  }

  record(method: string, route: string, status: number, durationSec: number): void {
    const k: MetricKey = { method, route, status: String(status) };
    const hk = this.key(k);

    // Counter
    this.counters.set(hk, (this.counters.get(hk) || 0) + 1);

    // Histogram
    if (!this.histograms.has(hk)) {
      this.histograms.set(hk, {
        sum: 0,
        count: 0,
        buckets: BUCKET_BOUNDARIES.map((le) => ({ le, count: 0 })),
      });
    }
    const h = this.histograms.get(hk)!;
    h.sum += durationSec;
    h.count++;
    for (const b of h.buckets) {
      if (durationSec <= b.le) b.count++;
    }
  }

  serialize(): string {
    const lines: string[] = [];

    // Counter
    lines.push("# HELP http_requests_total Total HTTP requests");
    lines.push("# TYPE http_requests_total counter");
    for (const [k, v] of this.counters) {
      const [method, route, status] = k.split("|");
      lines.push(`http_requests_total{method="${method}",route="${route}",status="${status}"} ${v}`);
    }

    // Histogram
    lines.push("");
    lines.push("# HELP http_request_duration_seconds Request duration in seconds");
    lines.push("# TYPE http_request_duration_seconds histogram");
    for (const [k, h] of this.histograms) {
      const [method, route, status] = k.split("|");
      const labels = `method="${method}",route="${route}",status="${status}"`;
      for (const b of h.buckets) {
        lines.push(`http_request_duration_seconds_bucket{${labels},le="${b.le}"} ${b.count}`);
      }
      lines.push(`http_request_duration_seconds_bucket{${labels},le="+Inf"} ${h.count}`);
      lines.push(`http_request_duration_seconds_sum{${labels}} ${h.sum.toFixed(6)}`);
      lines.push(`http_request_duration_seconds_count{${labels}} ${h.count}`);
    }

    // Process metrics
    const mem = process.memoryUsage();
    lines.push("");
    lines.push("# HELP process_resident_memory_bytes Resident memory size in bytes");
    lines.push("# TYPE process_resident_memory_bytes gauge");
    lines.push(`process_resident_memory_bytes ${mem.rss}`);
    lines.push("# HELP process_heap_used_bytes Heap used in bytes");
    lines.push("# TYPE process_heap_used_bytes gauge");
    lines.push(`process_heap_used_bytes ${mem.heapUsed}`);
    lines.push("# HELP process_uptime_seconds Process uptime in seconds");
    lines.push("# TYPE process_uptime_seconds gauge");
    lines.push(`process_uptime_seconds ${process.uptime().toFixed(1)}`);

    return lines.join("\n") + "\n";
  }
}

const collector = new MetricsCollector();

export default async function metricsPlugin(app: FastifyInstance) {
  // Record timing on every response
  app.addHook("onResponse", async (req: FastifyRequest, reply: FastifyReply) => {
    const route = req.routeOptions?.url || req.url;
    const durationMs = reply.elapsedTime;
    collector.record(req.method, route, reply.statusCode, durationMs / 1000);
  });

  // Expose /metrics endpoint (Prometheus scrape target)
  app.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return collector.serialize();
  });
}

export { collector, MetricsCollector };
