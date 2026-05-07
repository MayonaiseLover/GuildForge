import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChannelType } from "discord.js";
import {
  CreateTicketPanelInput, CreateVerificationGateInput,
  CreateWelcomeFlowInput, CreateSelfAssignableRolesInput
} from "../schemas/guild.js";

export function registerTemplateTools(registry: ToolRegistry) {
  registry.register({
    name: "create_ticket_panel",
    description: "Create a support ticket system",
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
        name: "tickets",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, allow: ["ViewChannel", "SendMessages"] },
          { id: supportRole.id, allow: ["ViewChannel", "SendMessages", "ManageMessages"] }
        ]
      })
    );

    return {
      ticketCategoryId: category.id,
      supportChannelId: ticketChannel.id,
      supportRoleId: supportRole.id,
      instructionsForUser: "Invite Ticket Tool bot via the generated invite link, then run /setup in the #tickets channel."
    };
  });

  registry.register({
    name: "create_verification_gate",
    description: "Create a verification gate",
    inputSchema: zodToJsonSchema(CreateVerificationGateInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    const unverifiedRole = await limiter.run({ scope: "guild", guildId }, () =>
      guild.roles.create({ name: "Unverified" })
    );
    const verifiedRole = await limiter.run({ scope: "guild", guildId }, () =>
      guild.roles.create({ name: "Verified" })
    );

    const verificationChannel = await limiter.run({ scope: "guild", guildId }, () =>
      guild.channels.create({
        name: "verification",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
          { id: unverifiedRole.id, allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] }
        ]
      })
    );

    await limiter.run({ scope: "guild", guildId }, () => guild.edit({ verificationLevel: 2 })); // 2 is MEDIUM

    return {
      unverifiedRoleId: unverifiedRole.id,
      verifiedRoleId: verifiedRole.id,
      verificationChannelId: verificationChannel.id,
      instructionsForUser: "Add Carl-bot or Wick to manage the verification reaction/captcha in the verification channel."
    };
  });

  registry.register({
    name: "create_welcome_flow",
    description: "Create welcome flow",
    inputSchema: zodToJsonSchema(CreateWelcomeFlowInput) as any
  }, async (args, discordClient, limiter) => {
    return { instructionsForUser: "Use a bot like Carl-bot to post welcome messages." };
  });

  registry.register({
    name: "create_self_assignable_roles",
    description: "Create reaction roles",
    inputSchema: zodToJsonSchema(CreateSelfAssignableRolesInput) as any
  }, async (args, discordClient, limiter) => {
    return { instructionsForUser: "Use a bot like Carl-bot to create the reaction role message." };
  });
}
