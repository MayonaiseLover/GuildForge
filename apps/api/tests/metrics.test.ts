import { describe, it, expect, beforeEach } from "vitest";
import { MetricsCollector } from "../src/plugins/metrics";

describe("MetricsCollector", () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it("records request counter and histogram", () => {
    collector.record("GET", "/health", 200, 0.015);
    const output = collector.serialize();

    expect(output).toContain('http_requests_total{method="GET",route="/health",status="200"} 1');
    expect(output).toContain('http_request_duration_seconds_count{method="GET",route="/health",status="200"} 1');
    expect(output).toContain("http_request_duration_seconds_sum");
  });

  it("increments counter on repeated requests", () => {
    collector.record("POST", "/api", 201, 0.1);
    collector.record("POST", "/api", 201, 0.2);
    collector.record("POST", "/api", 201, 0.05);
    const output = collector.serialize();

    expect(output).toContain('http_requests_total{method="POST",route="/api",status="201"} 3');
    expect(output).toContain('http_request_duration_seconds_count{method="POST",route="/api",status="201"} 3');
  });

  it("buckets requests correctly", () => {
    collector.record("GET", "/fast", 200, 0.003); // fits in 0.005
    const output = collector.serialize();

    expect(output).toContain('le="0.005"} 1');
    expect(output).toContain('le="0.01"} 1');
    expect(output).toContain('le="+Inf"} 1');
  });

  it("separates metrics by route and status", () => {
    collector.record("GET", "/a", 200, 0.01);
    collector.record("GET", "/b", 404, 0.02);
    const output = collector.serialize();

    expect(output).toContain('route="/a",status="200"');
    expect(output).toContain('route="/b",status="404"');
  });

  it("includes process metrics", () => {
    const output = collector.serialize();
    expect(output).toContain("process_resident_memory_bytes");
    expect(output).toContain("process_heap_used_bytes");
    expect(output).toContain("process_uptime_seconds");
  });
});
