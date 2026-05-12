import { prisma } from "../../db";
import { BuildPlan } from "@guildforge/plan-schema";
import { MCPDiscordClient } from "../mcp";

type ExecutionEvent =
  | { type: "started"; totalOps: number }
  | { type: "phase"; name: string; description: string }
  | { type: "operation"; index: number; tool: string; status: "pending" | "ok" | "failed" | "skipped"; summary: string }
  | { type: "completed"; planId: string; summary: string }
  | { type: "failed"; error: string; recoverable: boolean };

async function safeCall(
  mcp: MCPDiscordClient,
  tool: string,
  args: Record<string, any>,
  maxRetries = 3
): Promise<{ ok: boolean; data: any; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await mcp.callTool(tool, args);
      if (res && res.content && res.content[0] && res.content[0].text) {
        const parsed = JSON.parse(res.content[0].text);
        if (parsed.ok === false) {
          throw new Error(parsed.error?.message || "Tool error");
        }
        return { ok: true, data: parsed.data || parsed };
      }
      return { ok: true, data: res };
    } catch (err: any) {
      if (attempt === maxRetries) {
        return { ok: false, data: null, error: err.message || String(err) };
      }
      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }
  return { ok: false, data: null, error: "Max retries exceeded" };
}

export async function executeBuildPlan(planId: string, sseEmit: (event: ExecutionEvent) => void) {
  const planRecord = await prisma.buildPlan.update({
    where: { id: planId },
    data: { status: "EXECUTING" },
    include: { guild: true }
  });

  const plan = planRecord.planJson as unknown as BuildPlan;
  const guildId = planRecord.guild.discordGuildId;
  const mcp = new MCPDiscordClient();

  // Track resolved IDs for cross-referencing
  const resolvedRoleIds = new Map<string, string>();
  const resolvedCatIds = new Map<string, string>();
  const resolvedChannelIds = new Map<string, string>();
  let opIndex = 0;
  let totalOps = 0;

  // Count total operations
  totalOps += plan.serverSettings ? 1 : 0;
  totalOps += plan.roles.length;
  totalOps += plan.roles.length > 0 ? 1 : 0; // reorder
  totalOps += plan.categories.length;
  for (const cat of plan.categories) totalOps += cat.channels.length;
  totalOps += (plan.autoModRules || []).length;
  totalOps += (plan.webhooks || []).length;
  totalOps += (plan.embeds || []).length;
  totalOps += (plan.forumSeedPosts || []).length;
  totalOps += (plan.postBuildActions || []).length;

  try {
    sseEmit({ type: "started", totalOps });

    // ═══════════════════════════════════════════════════════
    // PHASE 0: Snapshot existing state for rollback
    // ═══════════════════════════════════════════════════════
    sseEmit({ type: "phase", name: "snapshot", description: "Taking safety snapshot..." });
    await safeCall(mcp, "snapshot_guild", { guildId });

    // ═══════════════════════════════════════════════════════
    // PHASE 1: Server Settings
    // ═══════════════════════════════════════════════════════
    if (plan.serverSettings) {
      sseEmit({ type: "phase", name: "settings", description: "Configuring server settings..." });
      opIndex++;
      sseEmit({ type: "operation", index: opIndex, tool: "configure_server", status: "pending", summary: "Updating server settings" });

      const verMap: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, very_high: 4 };
      const filterMap: Record<string, number> = { disabled: 0, no_role: 1, all: 2 };
      const notifMap: Record<string, number> = { all: 0, mentions: 1 };

      const result = await safeCall(mcp, "configure_server", {
        guildId,
        verificationLevel: verMap[plan.serverSettings.verificationLevel] ?? 2,
        explicitContentFilter: filterMap[plan.serverSettings.contentFilter] ?? 2,
        defaultMessageNotifications: notifMap[plan.serverSettings.defaultNotifications] ?? 1,
      });

      await recordOp(planId, opIndex, "configure_server", plan.serverSettings, result);
      sseEmit({ type: "operation", index: opIndex, tool: "configure_server", status: result.ok ? "ok" : "failed", summary: "Server settings configured" });
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 2: Roles
    // ═══════════════════════════════════════════════════════
    sseEmit({ type: "phase", name: "roles", description: `Creating ${plan.roles.length} roles...` });

    for (const role of plan.roles) {
      opIndex++;
      sseEmit({ type: "operation", index: opIndex, tool: "create_role", status: "pending", summary: `Creating role: ${role.name}` });

      const result = await safeCall(mcp, "create_role", {
        guildId,
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        mentionable: role.mentionable,
        permissions: role.permissions,
      });

      if (result.ok && result.data?.id) {
        resolvedRoleIds.set(role.key, result.data.id);
      }

      await recordOp(planId, opIndex, "create_role", { roleKey: role.key, ...role }, result);
      sseEmit({ type: "operation", index: opIndex, tool: "create_role", status: result.ok ? "ok" : "failed", summary: `Role: ${role.name}` });
    }

    // Reorder roles
    if (plan.roles.length > 0) {
      opIndex++;
      const roleOrder = plan.roles.map((r, i) => ({
        id: resolvedRoleIds.get(r.key),
        position: plan.roles.length - i
      })).filter(r => r.id);

      const result = await safeCall(mcp, "reorder_roles", { guildId, roles: roleOrder });
      await recordOp(planId, opIndex, "reorder_roles", { roleOrder }, result);
      sseEmit({ type: "operation", index: opIndex, tool: "reorder_roles", status: result.ok ? "ok" : "failed", summary: "Roles reordered" });
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 3: Categories & Channels
    // ═══════════════════════════════════════════════════════
    sseEmit({ type: "phase", name: "channels", description: `Building ${plan.categories.length} categories...` });

    for (const cat of plan.categories) {
      opIndex++;
      sseEmit({ type: "operation", index: opIndex, tool: "create_category", status: "pending", summary: `Category: ${cat.name}` });

      const catResult = await safeCall(mcp, "create_category", { guildId, name: cat.name });

      if (catResult.ok && catResult.data?.id) {
        resolvedCatIds.set(cat.key, catResult.data.id);

        // Apply category permission overwrites
        for (const ow of cat.permissionOverwrites) {
          const roleId = ow.roleKey === "@everyone" ? guildId : resolvedRoleIds.get(ow.roleKey);
          if (roleId) {
            await safeCall(mcp, "add_channel_permission_overwrite", {
              guildId, channelId: catResult.data.id,
              overwriteId: roleId, type: 0,
              allow: ow.allow, deny: ow.deny
            });
          }
        }
      }

      await recordOp(planId, opIndex, "create_category", { catKey: cat.key }, catResult);
      sseEmit({ type: "operation", index: opIndex, tool: "create_category", status: catResult.ok ? "ok" : "failed", summary: `Category: ${cat.name}` });

      // Create channels within category
      for (const ch of cat.channels) {
        opIndex++;
        const parentId = resolvedCatIds.get(cat.key);
        let toolName: string;
        let toolArgs: Record<string, any> = { guildId, name: ch.name, categoryId: parentId };

        switch (ch.type) {
          case "text":
            toolName = "create_text_channel";
            if (ch.topic) toolArgs.topic = ch.topic;
            if (ch.slowmodeSeconds) toolArgs.slowmodeSeconds = ch.slowmodeSeconds;
            if (ch.nsfw) toolArgs.nsfw = ch.nsfw;
            break;
          case "voice":
            toolName = "create_voice_channel";
            if (ch.userLimit) toolArgs.userLimit = ch.userLimit;
            if (ch.bitrate) toolArgs.bitrate = ch.bitrate;
            break;
          case "forum":
            toolName = "create_forum_channel";
            if (ch.topic) toolArgs.topic = ch.topic;
            if (ch.forumConfig) {
              if (ch.forumConfig.tags) toolArgs.tags = ch.forumConfig.tags;
              if (ch.forumConfig.guidelines) toolArgs.guidelines = ch.forumConfig.guidelines;
              if (ch.forumConfig.defaultSortOrder) toolArgs.defaultSortOrder = ch.forumConfig.defaultSortOrder;
              if (ch.forumConfig.layout) toolArgs.layout = ch.forumConfig.layout;
              if (ch.forumConfig.defaultReactionEmoji) toolArgs.defaultReactionEmoji = ch.forumConfig.defaultReactionEmoji;
            }
            break;
          case "announcement":
            toolName = "create_announcement_channel";
            if (ch.topic) toolArgs.topic = ch.topic;
            break;
          case "stage":
            toolName = "create_stage_channel";
            break;
          default:
            toolName = "create_text_channel";
        }

        sseEmit({ type: "operation", index: opIndex, tool: toolName, status: "pending", summary: `${ch.type}: ${ch.name}` });

        const chResult = await safeCall(mcp, toolName, toolArgs);

        if (chResult.ok && chResult.data?.id) {
          resolvedChannelIds.set(ch.key, chResult.data.id);

          // Apply channel-level permission overwrites
          if (ch.permissionOverwrites) {
            for (const ow of ch.permissionOverwrites) {
              const roleId = ow.roleKey === "@everyone" ? guildId : resolvedRoleIds.get(ow.roleKey);
              if (roleId) {
                await safeCall(mcp, "add_channel_permission_overwrite", {
                  guildId, channelId: chResult.data.id,
                  overwriteId: roleId, type: 0,
                  allow: ow.allow, deny: ow.deny
                });
              }
            }
          }
        }

        await recordOp(planId, opIndex, toolName, { channelKey: ch.key, ...toolArgs }, chResult);
        sseEmit({ type: "operation", index: opIndex, tool: toolName, status: chResult.ok ? "ok" : "failed", summary: `${ch.type}: ${ch.name}` });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 4: AutoMod Rules
    // ═══════════════════════════════════════════════════════
    if (plan.autoModRules && plan.autoModRules.length > 0) {
      sseEmit({ type: "phase", name: "automod", description: `Configuring ${plan.autoModRules.length} AutoMod rules...` });

      const autoModArgs = plan.autoModRules.map(rule => {
        const mapped: any = {
          name: rule.name,
          type: rule.type,
          actions: rule.actions,
          enabled: rule.enabled !== false,
        };
        if (rule.keywords) mapped.keywords = rule.keywords;
        if (rule.regexPatterns) mapped.regexPatterns = rule.regexPatterns;
        if (rule.presets) mapped.presets = rule.presets;
        if (rule.mentionLimit !== undefined) mapped.mentionLimit = rule.mentionLimit;
        if (rule.alertChannelKey) {
          mapped.alertChannelId = resolvedChannelIds.get(rule.alertChannelKey);
        }
        if (rule.timeoutDurationSeconds) mapped.timeoutDurationSeconds = rule.timeoutDurationSeconds;
        return mapped;
      });

      for (const rule of autoModArgs) {
        opIndex++;
        sseEmit({ type: "operation", index: opIndex, tool: "configure_automod", status: "pending", summary: `AutoMod: ${rule.name}` });
        const result = await safeCall(mcp, "configure_automod", { guildId, rules: [rule] });
        await recordOp(planId, opIndex, "configure_automod", rule, result);
        sseEmit({ type: "operation", index: opIndex, tool: "configure_automod", status: result.ok ? "ok" : "failed", summary: `AutoMod: ${rule.name}` });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 5: Webhooks
    // ═══════════════════════════════════════════════════════
    if (plan.webhooks && plan.webhooks.length > 0) {
      sseEmit({ type: "phase", name: "webhooks", description: `Creating ${plan.webhooks.length} webhooks...` });

      for (const wh of plan.webhooks) {
        opIndex++;
        const channelId = resolvedChannelIds.get(wh.targetChannelKey);
        if (!channelId) {
          sseEmit({ type: "operation", index: opIndex, tool: "create_webhook", status: "skipped", summary: `Webhook "${wh.name}" — target channel not found` });
          continue;
        }

        sseEmit({ type: "operation", index: opIndex, tool: "create_webhook", status: "pending", summary: `Webhook: ${wh.name}` });
        const result = await safeCall(mcp, "create_webhook", { channelId, name: wh.name, reason: wh.purpose });
        await recordOp(planId, opIndex, "create_webhook", wh, result);
        sseEmit({ type: "operation", index: opIndex, tool: "create_webhook", status: result.ok ? "ok" : "failed", summary: `Webhook: ${wh.name}` });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 6: Rich Embeds
    // ═══════════════════════════════════════════════════════
    if (plan.embeds && plan.embeds.length > 0) {
      sseEmit({ type: "phase", name: "embeds", description: `Sending ${plan.embeds.length} rich embeds...` });

      for (const embed of plan.embeds) {
        opIndex++;
        const channelId = resolvedChannelIds.get(embed.targetChannelKey);
        if (!channelId) {
          sseEmit({ type: "operation", index: opIndex, tool: "send_embed", status: "skipped", summary: `Embed "${embed.title}" — target channel not found` });
          continue;
        }

        sseEmit({ type: "operation", index: opIndex, tool: "send_embed", status: "pending", summary: `Embed: ${embed.title}` });

        const embedPayload = {
          title: embed.title,
          description: embed.description,
          color: embed.color ? parseInt(embed.color.replace("#", ""), 16) : 0x5865F2,
          footer: embed.footer ? { text: embed.footer } : undefined,
        };

        const result = await safeCall(mcp, "send_embed", {
          channelId,
          embeds: [embedPayload],
        });

        await recordOp(planId, opIndex, "send_embed", embed, result);
        sseEmit({ type: "operation", index: opIndex, tool: "send_embed", status: result.ok ? "ok" : "failed", summary: `Embed: ${embed.title}` });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 7: Forum Seed Posts
    // ═══════════════════════════════════════════════════════
    if (plan.forumSeedPosts && plan.forumSeedPosts.length > 0) {
      sseEmit({ type: "phase", name: "forum-seeds", description: `Seeding ${plan.forumSeedPosts.length} forum posts...` });

      for (const seed of plan.forumSeedPosts) {
        opIndex++;
        const forumId = resolvedChannelIds.get(seed.forumChannelKey);
        if (!forumId) {
          sseEmit({ type: "operation", index: opIndex, tool: "create_forum_post", status: "skipped", summary: `Seed "${seed.title}" — forum not found` });
          continue;
        }

        sseEmit({ type: "operation", index: opIndex, tool: "create_forum_post", status: "pending", summary: `Forum post: ${seed.title}` });

        const result = await safeCall(mcp, "create_forum_post", {
          channelId: forumId,
          name: seed.title,
          content: seed.content,
          tagName: seed.tagName,
        });

        await recordOp(planId, opIndex, "create_forum_post", seed, result);
        sseEmit({ type: "operation", index: opIndex, tool: "create_forum_post", status: result.ok ? "ok" : "failed", summary: `Forum post: ${seed.title}` });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 8: Post-Build Actions (bot panels, tickets, etc.)
    // ═══════════════════════════════════════════════════════
    if (plan.postBuildActions && plan.postBuildActions.length > 0) {
      sseEmit({ type: "phase", name: "post-build", description: `Running ${plan.postBuildActions.length} post-build actions...` });

      for (const action of plan.postBuildActions) {
        opIndex++;
        sseEmit({ type: "operation", index: opIndex, tool: action.type, status: "pending", summary: `Action: ${action.type}` });

        let result: { ok: boolean; data: any; error?: string };

        switch (action.type) {
          case "bot_invite_panel": {
            const params = action.params as any;
            const channelId = resolvedChannelIds.get(params.targetChannelKey || "bot_setup");
            if (channelId) {
              result = await safeCall(mcp, "post_bot_invite_panel", {
                channelId,
                guildId,
                botIds: params.botIds || plan.bots.map(b => b.botId),
                title: params.title || "## 🤖 Bot Setup Panel",
              });
            } else {
              result = { ok: false, data: null, error: "Target channel not found" };
            }
            break;
          }
          case "ticket_panel": {
            result = await safeCall(mcp, "create_ticket_panel", {
              guildId,
              parentCategoryName: (action.params as any).categoryName || "Support",
              supportRoleName: (action.params as any).supportRoleName || "Support Team",
            });
            break;
          }
          case "verification_gate": {
            result = await safeCall(mcp, "create_verification_gate", { guildId });
            break;
          }
          case "welcome_banner": {
            result = await safeCall(mcp, "create_welcome_banner_asset", { guildId });
            break;
          }
          default: {
            result = { ok: true, data: { note: `Action ${action.type} logged for manual completion` } };
          }
        }

        await recordOp(planId, opIndex, action.type, action.params, result);
        sseEmit({ type: "operation", index: opIndex, tool: action.type, status: result.ok ? "ok" : "failed", summary: `Action: ${action.type}` });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 9: Viral Watermark
    // ═══════════════════════════════════════════════════════
    sseEmit({ type: "phase", name: "watermark", description: "Applying GuildForge watermark..." });
    let watermarkChannelId = null;
    for (const [key, id] of resolvedChannelIds.entries()) {
      if (key.includes("bot") || key.includes("staff") || key.includes("mod") || key.includes("general")) {
        watermarkChannelId = id;
        break;
      }
    }
    if (!watermarkChannelId && resolvedChannelIds.size > 0) {
      watermarkChannelId = Array.from(resolvedChannelIds.values())[0];
    }
    
    if (watermarkChannelId) {
      opIndex++;
      sseEmit({ type: "operation", index: opIndex, tool: "send_embed", status: "pending", summary: "Watermark" });
      const watermarkResult = await safeCall(mcp, "send_embed", {
        channelId: watermarkChannelId,
        embeds: [{
          title: "⚡ Architected by GuildForge AI",
          description: "This server was autonomously designed and built by **GuildForge**. \n\nWant to generate your own enterprise-grade Discord community in seconds? [Visit GuildForge.ai](https://guildforge.ai)",
          color: 0x5865F2,
          footer: { text: "GuildForge • The open-source Discord architect" }
        }]
      });
      await recordOp(planId, opIndex, "send_embed", { purpose: "watermark" }, watermarkResult);
      sseEmit({ type: "operation", index: opIndex, tool: "send_embed", status: watermarkResult.ok ? "ok" : "failed", summary: "Watermark" });
    }

    // ═══════════════════════════════════════════════════════
    // DONE
    // ═══════════════════════════════════════════════════════
    await prisma.buildPlan.update({
      where: { id: planId },
      data: { status: "COMPLETED", executedAt: new Date() }
    });

    const totalChannels = plan.categories.reduce((acc, c) => acc + c.channels.length, 0);
    const totalForums = plan.categories.reduce((acc, c) => acc + c.channels.filter(ch => ch.type === "forum").length, 0);

    sseEmit({
      type: "completed",
      planId,
      summary: [
        `✅ Built ${totalChannels} channels across ${plan.categories.length} categories`,
        `🛡️ ${plan.roles.length} roles configured`,
        totalForums > 0 ? `📋 ${totalForums} forums with tags` : null,
        (plan.autoModRules || []).length > 0 ? `🤖 ${plan.autoModRules!.length} AutoMod rules` : null,
        (plan.embeds || []).length > 0 ? `📨 ${plan.embeds!.length} rich embeds` : null,
        (plan.webhooks || []).length > 0 ? `🔗 ${plan.webhooks!.length} webhooks` : null,
        (plan.forumSeedPosts || []).length > 0 ? `📝 ${plan.forumSeedPosts!.length} forum seed posts` : null,
      ].filter(Boolean).join(" | ")
    });

  } catch (err: any) {
    await prisma.buildPlan.update({
      where: { id: planId },
      data: { status: "FAILED" }
    });
    sseEmit({ type: "failed", error: err.message || String(err), recoverable: true });
  } finally {
    await mcp.disconnect();
  }
}

async function recordOp(
  planId: string,
  ord: number,
  tool: string,
  args: any,
  result: { ok: boolean; data: any; error?: string }
) {
  await prisma.operation.create({
    data: {
      buildPlanId: planId,
      ord,
      tool,
      args,
      result: result.ok ? result.data : { error: result.error },
      status: result.ok ? "OK" : "FAILED",
      startedAt: new Date(),
      finishedAt: new Date(),
    }
  });
}
