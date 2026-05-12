import { ToolRegistry } from "./index.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChannelType } from "discord.js";
import {
  CreateTicketPanelInput, CreateVerificationGateInput,
  CreateWelcomeFlowInput, CreateSelfAssignableRolesInput
} from "../schemas/guild.js";

export function registerTemplateTools(registry: ToolRegistry) {
  registry.register({
    name: "create_ticket_panel",
    description: "Create a support ticket system with a dedicated category, support role, and ticket channel",
    inputSchema: zodToJsonSchema(CreateTicketPanelInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, parentCategoryName = "Support", supportRoleName = "Support Team" } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    const category = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({ name: parentCategoryName, type: ChannelType.GuildCategory })
    );

    const supportRole = await limiter.run({ scope: "guild", guildId }, () =>
      guild.roles.create({ name: supportRoleName, color: "#5865F2", mentionable: true })
    );

    const ticketChannel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({
        name: "create-ticket",
        type: ChannelType.GuildText,
        parent: category.id,
        topic: "React with 🎫 to open a support ticket",
        permissionOverwrites: [
          { id: guild.roles.everyone.id, allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] },
          { id: supportRole.id, allow: ["ViewChannel", "SendMessages", "ManageMessages", "ManageChannels"] }
        ]
      })
    );

    // Post the ticket panel embed
    await limiter.run({ scope: "global" }, () =>
      (ticketChannel as any).send({
        embeds: [{
          title: "🎫 Support Tickets",
          description: [
            "**Need help?** React with 🎫 below to open a private ticket.",
            "",
            "A member of our support team will assist you as soon as possible.",
            "",
            "**Before opening a ticket:**",
            "• Check #faq for common questions",
            "• Search existing forum posts for your issue",
            "• Include relevant details in your ticket",
          ].join("\n"),
          color: 0x5865F2,
          footer: { text: "GuildForge Ticket System • Powered by automation" }
        }]
      }).then((msg: any) => msg.react("🎫"))
    );

    // Create transcript channel
    const transcriptChannel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({
        name: "ticket-transcripts",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
          { id: supportRole.id, allow: ["ViewChannel", "ReadMessageHistory"] }
        ]
      })
    );

    return {
      ticketCategoryId: category.id,
      ticketChannelId: ticketChannel.id,
      transcriptChannelId: transcriptChannel.id,
      supportRoleId: supportRole.id,
    };
  });

  registry.register({
    name: "create_verification_gate",
    description: "Create a verification gate with Unverified/Verified roles and a verification channel with instructions",
    inputSchema: zodToJsonSchema(CreateVerificationGateInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    const unverifiedRole = await limiter.run({ scope: "guild", guildId }, () =>
      guild.roles.create({ name: "Unverified", color: "#95a5a6" })
    );
    const verifiedRole = await limiter.run({ scope: "guild", guildId }, () =>
      guild.roles.create({ name: "Verified", color: "#2ecc71" })
    );

    const verificationChannel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({
        name: "✅・verify",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
          { id: unverifiedRole.id, allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] }
        ]
      })
    );

    // Post verification instructions
    await limiter.run({ scope: "global" }, () =>
      (verificationChannel as any).send({
        embeds: [{
          title: "✅ Server Verification",
          description: [
            "Welcome! Please verify your account to access the server.",
            "",
            "**React with ✅ below to verify.**",
            "",
            "This helps us prevent spam bots and raids.",
            "After verifying, you'll gain access to all community channels.",
          ].join("\n"),
          color: 0x2ecc71,
          footer: { text: "Verification is required to participate" }
        }]
      }).then((msg: any) => msg.react("✅"))
    );

    await limiter.run({ scope: "guild", guildId }, () => guild.edit({ verificationLevel: 2 }));

    return {
      unverifiedRoleId: unverifiedRole.id,
      verifiedRoleId: verifiedRole.id,
      verificationChannelId: verificationChannel.id,
    };
  });

  registry.register({
    name: "create_welcome_flow",
    description: "Create a welcome channel with a rich welcome embed that greets new members",
    inputSchema: zodToJsonSchema(CreateWelcomeFlowInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, welcomeMessage, rulesChannelId, rolesChannelId } = args as any;
    const guild = await discordClient.getGuild(guildId);

    // Find or create welcome channel
    let welcomeChannel = guild.channels.cache.find((c: any) => c.name.includes("welcome") && c.type === ChannelType.GuildText);
    if (!welcomeChannel) {
      welcomeChannel = await limiter.run({ scope: "guild", guildId }, () =>
        guild.channels.create({
          name: "👋・welcome",
          type: ChannelType.GuildText,
          topic: "Welcome to the server!",
          permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] }
          ]
        })
      );
    }

    const links: string[] = [];
    if (rulesChannelId) links.push(`📜 Read the rules: <#${rulesChannelId}>`);
    if (rolesChannelId) links.push(`🎭 Pick your roles: <#${rolesChannelId}>`);

    await limiter.run({ scope: "global" }, () =>
      (welcomeChannel as any).send({
        embeds: [{
          title: `Welcome to ${guild.name}! 🎉`,
          description: [
            welcomeMessage || `We're glad you're here! This is a community built for collaboration, learning, and having fun.`,
            "",
            "**Getting Started:**",
            ...links,
            "",
            "Feel free to introduce yourself and jump into the conversation!",
          ].join("\n"),
          color: 0x5865F2,
          footer: { text: `${guild.name} • Built with GuildForge` }
        }]
      })
    );

    return {
      welcomeChannelId: (welcomeChannel as any).id,
    };
  });

  registry.register({
    name: "create_self_assignable_roles",
    description: "Create a role selection channel with reaction-role embeds for notification and interest roles",
    inputSchema: zodToJsonSchema(CreateSelfAssignableRolesInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, roles: roleConfigs } = args as any;
    const guild = await discordClient.getGuild(guildId);

    // Find or create roles channel
    let rolesChannel = guild.channels.cache.find((c: any) => c.name.includes("role") && c.type === ChannelType.GuildText);
    if (!rolesChannel) {
      rolesChannel = await limiter.run({ scope: "guild", guildId }, () =>
        guild.channels.create({
          name: "🎭・roles",
          type: ChannelType.GuildText,
          topic: "React to assign yourself roles",
          permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: ["ViewChannel", "ReadMessageHistory", "AddReactions"], deny: ["SendMessages"] }
          ]
        })
      );
    }

    // Group roles by category
    const categories: Record<string, Array<{ emoji: string; name: string; description: string }>> = {};
    if (roleConfigs && Array.isArray(roleConfigs)) {
      for (const rc of roleConfigs) {
        const cat = rc.category || "General";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ emoji: rc.emoji || "🔹", name: rc.name, description: rc.description || "" });
      }
    } else {
      categories["🔔 Notifications"] = [
        { emoji: "📢", name: "Announcements", description: "Get pinged for server announcements" },
        { emoji: "🎉", name: "Events", description: "Get pinged for community events" },
        { emoji: "🎁", name: "Giveaways", description: "Get pinged for giveaways" },
      ];
    }

    const embeds: any[] = [];
    for (const [catName, catRoles] of Object.entries(categories)) {
      embeds.push({
        title: catName,
        description: catRoles.map(r => `${r.emoji} **${r.name}** — ${r.description}`).join("\n"),
        color: 0x5865F2,
        footer: { text: "React below to assign yourself these roles" }
      });
    }

    const msg = await limiter.run({ scope: "global" }, async (): Promise<any> =>
      (rolesChannel as any).send({ embeds })
    );

    // Add reactions
    for (const catRoles of Object.values(categories)) {
      for (const role of catRoles) {
        try { await msg.react(role.emoji); } catch {}
      }
    }

    return {
      rolesChannelId: (rolesChannel as any).id,
      messageId: msg.id,
      note: "Connect Carl-bot or a reaction role handler to this message to complete the flow.",
    };
  });

  registry.register({
    name: "create_welcome_banner_asset",
    description: "Generates a customized static welcome banner image and posts it to the bot config channel for the owner to use with welcome bots",
    inputSchema: zodToJsonSchema(z.object({
      guildId: z.string()
    })) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    let targetChannel = guild.channels.cache.find((c: any) => c.name.includes("bot-config") && c.type === ChannelType.GuildText);
    if (!targetChannel) {
      targetChannel = guild.channels.cache.find((c: any) => c.name.includes("mod-chat") || c.name.includes("staff") && c.type === ChannelType.GuildText);
    }
    
    if (!targetChannel) {
      return { status: "skipped", reason: "No suitable staff/bot-config channel found" };
    }

    try {
      const { createCanvas, loadImage } = await import('@napi-rs/canvas');
      const { AttachmentBuilder } = await import('discord.js');
      
      const W = 900, H = 300;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext('2d');

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(0.5, '#16213e');
      grad.addColorStop(1, '#0f3460');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#e94560'; ctx.beginPath(); ctx.arc(750, 50, 200, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#533483'; ctx.beginPath(); ctx.arc(100, 280, 150, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Bottom bar
      const bar = ctx.createLinearGradient(0, H-4, W, H);
      bar.addColorStop(0, '#e94560'); bar.addColorStop(0.5, '#533483'); bar.addColorStop(1, '#0f3460');
      ctx.fillStyle = bar; ctx.fillRect(0, H - 4, W, 4);

      // Text
      const tX = 160;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#e94560';
      ctx.fillText('W E L C O M E', tX, 90);
      ctx.font = 'bold 36px sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText('{user.name}', tX, 140);
      ctx.font = '18px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('to ' + guild.name, tX, 178);

      // Avatar placeholder
      const aSize = 100, aX = 80, aY = H / 2;
      ctx.fillStyle = '#533483';
      ctx.beginPath(); ctx.arc(aX, aY, aSize/2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', aX, aY);

      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'welcome-banner-asset.png' });

      await limiter.run({ scope: "global" }, () =>
        (targetChannel as any).send({
          content: "## 🖼️ Your Custom Welcome Banner Asset\nHere is the custom welcome banner generated for your server.",
          files: [attachment],
          embeds: [{
            color: 0xe94560,
            title: "How to use this banner",
            description: "GuildForge is a server architect, not a 24/7 welcome bot. To welcome new users dynamically, you should upload this image to a bot like Carl-bot or Arcane.\n\n1. Save the image above.\n2. Go to your bot's dashboard (e.g. carl.gg)\n3. Navigate to **Welcome/Leave** messages.\n4. Upload this image as the welcome banner.\n5. Set the welcome channel to `#👋・welcome`."
          }]
        })
      );

      return {
        channelId: (targetChannel as any).id,
        status: "success",
        note: "Asset posted successfully"
      };
    } catch (error: any) {
      return { status: "error", error: error.message };
    }
  });
}
