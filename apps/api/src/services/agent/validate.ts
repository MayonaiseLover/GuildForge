import { BuildPlan } from "@guildforge/plan-schema";

export function validatePlan(plan: BuildPlan): string[] {
  const issues: string[] = [];

  // ── Role validations ──
  const roleKeys = new Set(plan.roles.map(r => r.key));

  if (plan.roles.length > 250) {
    issues.push("Discord allows a maximum of 250 roles.");
  }
  if (plan.roles.length < 3) {
    issues.push("Plan should have at least 3 roles (admin, moderator, member).");
  }

  const roleNames = new Set<string>();
  for (const role of plan.roles) {
    if (roleNames.has(role.name.toLowerCase())) {
      issues.push(`Duplicate role name: ${role.name}`);
    }
    roleNames.add(role.name.toLowerCase());

    if (!/^#[0-9a-fA-F]{6}$/.test(role.color)) {
      issues.push(`Role ${role.name} has invalid color: ${role.color}`);
    }
  }

  // ── Category validations ──
  if (plan.categories.length > 50) {
    issues.push("Discord allows a maximum of 50 categories.");
  }

  let totalChannels = 0;
  const allChannelKeys = new Set<string>();

  for (const cat of plan.categories) {
    if (cat.channels.length > 50) {
      issues.push(`Category ${cat.key} has more than 50 channels (max per category).`);
    }

    const channelNames = new Set<string>();
    for (const ch of cat.channels) {
      totalChannels++;

      // Channel name rules
      if (ch.type !== "voice" && ch.type !== "stage") {
        const nameRegex = /^[a-z0-9\-_\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\p{Emoji}・]+$/u;
        // Discord allows unicode, emojis, and special chars in channel names
        if (ch.name.length > 100) {
          issues.push(`Channel ${ch.name} in ${cat.key} exceeds 100 character limit.`);
        }
      }

      if (channelNames.has(ch.name)) {
        issues.push(`Duplicate channel name ${ch.name} in category ${cat.key}.`);
      }
      channelNames.add(ch.name);

      if (allChannelKeys.has(ch.key)) {
        issues.push(`Duplicate channel key ${ch.key} across categories.`);
      }
      allChannelKeys.add(ch.key);

      // Forum-specific validations
      if (ch.type === "forum" && ch.forumConfig) {
        if (ch.forumConfig.tags && ch.forumConfig.tags.length > 20) {
          issues.push(`Forum ${ch.name} has more than 20 tags (Discord limit).`);
        }
        if (ch.forumConfig.tags && ch.forumConfig.tags.length < 1) {
          issues.push(`Forum ${ch.name} should have at least 1 tag.`);
        }
      }

      // Permission overwrite references
      if (ch.permissionOverwrites) {
        for (const ow of ch.permissionOverwrites) {
          if (!roleKeys.has(ow.roleKey) && ow.roleKey !== "@everyone") {
            issues.push(`Channel ${ch.key} references unknown roleKey ${ow.roleKey}.`);
          }
        }
      }

      // Slowmode bounds
      if (ch.slowmodeSeconds !== undefined && (ch.slowmodeSeconds < 0 || ch.slowmodeSeconds > 21600)) {
        issues.push(`Channel ${ch.name} slowmode must be 0-21600 seconds.`);
      }

      // Voice channel limits
      if (ch.type === "voice" && ch.userLimit !== undefined && (ch.userLimit < 0 || ch.userLimit > 99)) {
        issues.push(`Voice channel ${ch.name} user limit must be 0-99.`);
      }
    }

    // Category permission references
    for (const ow of cat.permissionOverwrites) {
      if (!roleKeys.has(ow.roleKey) && ow.roleKey !== "@everyone") {
        issues.push(`Category ${cat.key} references unknown roleKey ${ow.roleKey}.`);
      }
    }
  }

  // Total channel limit
  if (totalChannels > 500) {
    issues.push(`Total channels (${totalChannels}) exceeds Discord's 500 channel limit.`);
  }

  // ── AutoMod validations ──
  if (plan.autoModRules) {
    if (plan.autoModRules.length > 6) {
      issues.push("Discord allows a maximum of 6 AutoMod rules per server.");
    }
    for (const rule of plan.autoModRules) {
      if (rule.type === "keyword" && (!rule.keywords || rule.keywords.length === 0) && (!rule.regexPatterns || rule.regexPatterns.length === 0)) {
        issues.push(`AutoMod rule "${rule.name}" is keyword type but has no keywords or regex.`);
      }
      if (rule.type === "keyword_preset" && (!rule.presets || rule.presets.length === 0)) {
        issues.push(`AutoMod rule "${rule.name}" is keyword_preset type but has no presets.`);
      }
      if (rule.alertChannelKey && !allChannelKeys.has(rule.alertChannelKey) && rule.actions.includes("alert")) {
        issues.push(`AutoMod rule "${rule.name}" references unknown alert channel key ${rule.alertChannelKey}.`);
      }
    }
  }

  // ── Embed validations ──
  if (plan.embeds) {
    for (const embed of plan.embeds) {
      if (!allChannelKeys.has(embed.targetChannelKey)) {
        issues.push(`Embed "${embed.title}" targets unknown channel key ${embed.targetChannelKey}.`);
      }
      if (embed.description.length > 4096) {
        issues.push(`Embed "${embed.title}" description exceeds 4096 character limit.`);
      }
    }
  }

  // ── Webhook validations ──
  if (plan.webhooks) {
    for (const wh of plan.webhooks) {
      if (!allChannelKeys.has(wh.targetChannelKey)) {
        issues.push(`Webhook "${wh.name}" targets unknown channel key ${wh.targetChannelKey}.`);
      }
    }
  }

  // ── Forum seed post validations ──
  if (plan.forumSeedPosts) {
    for (const seed of plan.forumSeedPosts) {
      if (!allChannelKeys.has(seed.forumChannelKey)) {
        issues.push(`Forum seed post "${seed.title}" targets unknown forum key ${seed.forumChannelKey}.`);
      }
    }
  }

  // ── Minimum requirements ──
  const hasWelcome = plan.categories.some(c => c.channels.some(ch => ch.name.includes("welcome")));
  if (!hasWelcome) {
    issues.push("Server should have a welcome channel.");
  }

  const hasRules = plan.categories.some(c => c.channels.some(ch => ch.name.includes("rules")));
  if (!hasRules) {
    issues.push("Server should have a rules channel.");
  }

  return issues;
}
