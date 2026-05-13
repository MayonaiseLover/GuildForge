/**
 * Alert delivery service — dispatches alerts via webhook and Discord DM.
 *
 * When an alert fires, call deliverAlert() to send notifications to all
 * configured channels on the alert rule.
 */

interface AlertPayload {
  id: string;
  guildId: string;
  severity: string;
  title: string;
  message: string;
  ruleId: string;
  ruleName: string;
  createdAt: Date;
}

/**
 * Deliver an alert to all configured channels (webhook URL and/or Discord DM).
 */
export async function deliverAlert(
  alert: AlertPayload,
  options: {
    webhookUrl?: string | null;
    channels?: string[];
    discordUserId?: string;
    botToken?: string;
  },
): Promise<{ webhook: boolean; dm: boolean }> {
  const results = { webhook: false, dm: false };

  // ── Webhook delivery ──────────────────────────────────────────────────
  if (options.webhookUrl) {
    try {
      const res = await fetch(options.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Discord webhook format (works with Slack too)
          embeds: [{
            title: `🚨 ${alert.title}`,
            description: alert.message,
            color: alert.severity === "critical" ? 0xFF0000 : 0xFFA500,
            fields: [
              { name: "Guild", value: alert.guildId, inline: true },
              { name: "Severity", value: alert.severity.toUpperCase(), inline: true },
              { name: "Rule", value: alert.ruleName, inline: true },
            ],
            timestamp: alert.createdAt.toISOString(),
            footer: { text: "GuildForge Monitoring" },
          }],
        }),
        signal: AbortSignal.timeout(10_000),
      });
      results.webhook = res.ok;
      if (!results.webhook) {
        process.stderr.write(JSON.stringify({ level: "warn", service: "alert-delivery", msg: `Webhook returned ${res.status}`, alertId: alert.id, ts: new Date().toISOString() }) + "\n");
      }
    } catch (err) {
      process.stderr.write(JSON.stringify({ level: "error", service: "alert-delivery", msg: "Webhook failed", alertId: alert.id, error: err instanceof Error ? err.message : String(err), ts: new Date().toISOString() }) + "\n");
    }
  }

  // ── Discord DM delivery ───────────────────────────────────────────────
  const botToken = options.botToken || process.env.DISCORD_BOT_TOKEN;
  if (options.discordUserId && botToken) {
    try {
      // Step 1: Open DM channel
      const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: options.discordUserId }),
        signal: AbortSignal.timeout(10_000),
      });

      if (dmRes.ok) {
        const dm = (await dmRes.json()) as { id: string };

        // Step 2: Send message in DM channel
        const severity = alert.severity === "critical" ? "🔴" : "🟠";
        const msgRes = await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [{
              title: `${severity} Alert: ${alert.title}`,
              description: alert.message,
              color: alert.severity === "critical" ? 0xFF0000 : 0xFFA500,
              fields: [
                { name: "Guild", value: alert.guildId, inline: true },
                { name: "Rule", value: alert.ruleName, inline: true },
              ],
              timestamp: alert.createdAt.toISOString(),
              footer: { text: "GuildForge Monitoring • Reply /alerts to manage" },
            }],
          }),
          signal: AbortSignal.timeout(10_000),
        });
        results.dm = msgRes.ok;
        if (!results.dm) {
          process.stderr.write(JSON.stringify({ level: "warn", service: "alert-delivery", msg: `Discord DM returned ${msgRes.status}`, alertId: alert.id, ts: new Date().toISOString() }) + "\n");
        }
      }
    } catch (err) {
      process.stderr.write(JSON.stringify({ level: "error", service: "alert-delivery", msg: "Discord DM failed", alertId: alert.id, error: err instanceof Error ? err.message : String(err), ts: new Date().toISOString() }) + "\n");
    }
  }

  return results;
}
