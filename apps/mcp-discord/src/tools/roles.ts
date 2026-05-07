import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { MCPDiscordError } from "../errors.js";
import {
  CreateRoleInput, UpdateRoleInput, DeleteRoleInput,
  ReorderRolesInput, AssignRoleToMemberInput, ListRolesInput
} from "../schemas/role.js";

export function registerRoleTools(registry: ToolRegistry) {
  registry.register({
    name: "create_role",
    description: "Create a role",
    inputSchema: zodToJsonSchema(CreateRoleInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, name, color, hoist, mentionable, permissions, position } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const client = await discordClient.getClient();
    
    const botMember = await guild.members.fetch(client.user!.id);
    const botHighest = botMember.roles.highest.position;
    if (position !== undefined && position >= botHighest) {
      throw new MCPDiscordError("BOT_HIERARCHY_INSUFFICIENT", `Cannot create role at position ${position}. Bot highest role is at ${botHighest}.`);
    }

    const role = await limiter.run({ scope: "guild", guildId }, () =>
      guild.roles.create({ name, color, hoist, mentionable, permissions, position })
    );
    return { id: role.id, name: role.name };
  });

  registry.register({
    name: "update_role",
    description: "Update a role",
    inputSchema: zodToJsonSchema(UpdateRoleInput) as any
  }, async (args, discordClient, limiter) => {
    const { roleId, partial } = args as any;
    const client = await discordClient.getClient();
    // find the guild to run rate limits, we'll scan client's guilds
    for (const guild of client.guilds.cache.values()) {
      if (guild.roles.cache.has(roleId)) {
        const botMember = await guild.members.fetch(client.user!.id);
        const botHighest = botMember.roles.highest.position;
        const role = guild.roles.cache.get(roleId)!;
        if (role.position >= botHighest) {
          throw new MCPDiscordError("BOT_HIERARCHY_INSUFFICIENT", `Cannot edit role ${role.name}. It is higher or equal to bot's highest role.`);
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const updated = await limiter.run({ scope: "guild", guildId: guild.id }, () => role.edit(partial));
        return { id: updated.id, name: updated.name };
      }
    }
    throw new Error("Role not found");
  });

  registry.register({
    name: "delete_role",
    description: "Delete a role",
    inputSchema: zodToJsonSchema(DeleteRoleInput) as any
  }, async (args, discordClient, limiter) => {
    const { roleId, reason } = args as any;
    const client = await discordClient.getClient();
    for (const guild of client.guilds.cache.values()) {
      if (guild.roles.cache.has(roleId)) {
        const botMember = await guild.members.fetch(client.user!.id);
        const role = guild.roles.cache.get(roleId)!;
        if (role.position >= botMember.roles.highest.position) {
          throw new MCPDiscordError("BOT_HIERARCHY_INSUFFICIENT", `Cannot delete role ${role.name}. It is higher or equal to bot's highest role.`);
        }

        await limiter.run({ scope: "guild", guildId: guild.id }, () => role.delete(reason));
        return { id: roleId, deleted: true };
      }
    }
    throw new Error("Role not found");
  });

  registry.register({
    name: "reorder_roles",
    description: "Reorder roles",
    inputSchema: zodToJsonSchema(ReorderRolesInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, orderedRoleIds } = args as any;
    const guild = await discordClient.getGuild(guildId);
    
    // Convert ordered IDs into { role: id, position: index }
    const positions = orderedRoleIds.map((id: string, index: number) => ({ role: id, position: index + 1 }));
    await limiter.run({ scope: "guild", guildId }, () => guild.roles.setPositions(positions));
    return { ok: true };
  });

  registry.register({
    name: "assign_role_to_member",
    description: "Assign role to member",
    inputSchema: zodToJsonSchema(AssignRoleToMemberInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, memberId, roleId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    const member = await guild.members.fetch(memberId);
    await limiter.run({ scope: "guild", guildId }, () => member.roles.add(roleId));
    return { ok: true };
  });

  registry.register({
    name: "list_roles",
    description: "List roles in guild",
    inputSchema: zodToJsonSchema(ListRolesInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    const guild = await discordClient.getGuild(guildId);
    return guild.roles.cache.map(r => ({
      id: r.id,
      name: r.name,
      position: r.position,
      color: r.hexColor,
      permissions: r.permissions.bitfield.toString()
    }));
  });
}
