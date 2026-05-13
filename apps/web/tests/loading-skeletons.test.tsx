import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Test that each loading skeleton renders without crashing and shows appropriate placeholder text.
// These are simple smoke tests — if the component renders, the skeleton works.

describe("Loading Skeletons", () => {
  it("dashboard loading renders", async () => {
    const { default: DashboardLoading } = await import("@/app/dashboard/loading");
    const { container } = render(<DashboardLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("teams loading renders", async () => {
    const { default: TeamsLoading } = await import("@/app/teams/loading");
    const { container } = render(<TeamsLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("analytics loading renders", async () => {
    const { default: AnalyticsLoading } = await import("@/app/analytics/loading");
    const { container } = render(<AnalyticsLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("billing loading renders", async () => {
    const { default: BillingLoading } = await import("@/app/billing/loading");
    const { container } = render(<BillingLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("monitoring loading renders", async () => {
    const { default: MonitoringLoading } = await import("@/app/monitoring/loading");
    const { container } = render(<MonitoringLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("templates loading renders", async () => {
    const { default: TemplatesLoading } = await import("@/app/templates/loading");
    const { container } = render(<TemplatesLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("pricing loading renders", async () => {
    const { default: PricingLoading } = await import("@/app/pricing/loading");
    const { container } = render(<PricingLoading />);
    expect(container.firstChild).toBeTruthy();
  });

  it("login loading renders", async () => {
    const { default: LoginLoading } = await import("@/app/login/loading");
    const { container } = render(<LoginLoading />);
    expect(container.firstChild).toBeTruthy();
  });
});
