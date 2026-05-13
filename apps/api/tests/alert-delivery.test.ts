import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deliverAlert } from "../src/services/alert-delivery";

const MOCK_ALERT = {
  id: "alert-001",
  guildId: "guild-123",
  severity: "critical" as const,
  title: "CPU Spike",
  message: "CPU usage exceeded 95% threshold",
  ruleId: "rule-001",
  ruleName: "High CPU",
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

describe("deliverAlert", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns false for both when no channels configured", async () => {
    const result = await deliverAlert(MOCK_ALERT, {});
    expect(result).toEqual({ webhook: false, dm: false });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends webhook with Discord embed format", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200 });

    const result = await deliverAlert(MOCK_ALERT, {
      webhookUrl: "https://hooks.example.com/webhook",
    });

    expect(result.webhook).toBe(true);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://hooks.example.com/webhook");
    expect(opts.method).toBe("POST");

    const body = JSON.parse(opts.body);
    expect(body.embeds).toHaveLength(1);
    expect(body.embeds[0].title).toContain("CPU Spike");
    expect(body.embeds[0].color).toBe(0xFF0000); // critical = red
    expect(body.embeds[0].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Severity", value: "CRITICAL" }),
      ]),
    );
  });

  it("handles webhook failure gracefully", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await deliverAlert(MOCK_ALERT, {
      webhookUrl: "https://hooks.example.com/webhook",
    });

    expect(result.webhook).toBe(false);
  });

  it("handles webhook network error gracefully", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const result = await deliverAlert(MOCK_ALERT, {
      webhookUrl: "https://hooks.example.com/webhook",
    });

    expect(result.webhook).toBe(false);
  });

  it("sends Discord DM through two-step flow (open channel + send message)", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "dm-channel-999" }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const result = await deliverAlert(MOCK_ALERT, {
      discordUserId: "user-456",
      botToken: "test-bot-token",
    });

    expect(result.dm).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);

    // First call: open DM channel
    const [dmUrl, dmOpts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(dmUrl).toBe("https://discord.com/api/v10/users/@me/channels");
    expect(JSON.parse(dmOpts.body).recipient_id).toBe("user-456");
    expect(dmOpts.headers.Authorization).toBe("Bot test-bot-token");

    // Second call: send message in DM channel
    const [msgUrl] = (fetch as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(msgUrl).toBe("https://discord.com/api/v10/channels/dm-channel-999/messages");
  });

  it("handles DM channel creation failure", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 403 });

    const result = await deliverAlert(MOCK_ALERT, {
      discordUserId: "user-456",
      botToken: "test-bot-token",
    });

    expect(result.dm).toBe(false);
    expect(fetch).toHaveBeenCalledOnce(); // Only DM channel attempt, no message
  });

  it("delivers to both webhook and DM simultaneously", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, status: 200 }) // webhook
      .mockResolvedValueOnce({ // DM channel open
        ok: true,
        status: 200,
        json: async () => ({ id: "dm-123" }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200 }); // DM message

    const result = await deliverAlert(MOCK_ALERT, {
      webhookUrl: "https://hooks.example.com/wh",
      discordUserId: "user-789",
      botToken: "bot-tok",
    });

    expect(result).toEqual({ webhook: true, dm: true });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("uses warning color for non-critical alerts", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200 });

    await deliverAlert({ ...MOCK_ALERT, severity: "warning" }, {
      webhookUrl: "https://hooks.example.com/wh",
    });

    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.embeds[0].color).toBe(0xFFA500); // warning = orange
  });
});
