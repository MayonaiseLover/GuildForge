import { ToolRegistry } from "./index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChannelType, PermissionsBitField } from "discord.js";
import { SnapshotStore } from "../snapshots/store.js";
import { randomUUID } from "crypto";
import {
  SnapshotGuildInput, RestoreSnapshotInput, DiffSnapshotInput, ListSnapshotsInput
} from "../schemas/guild.js";

export function registerSnapshotTools(registry: ToolRegistry) {
  const store = new SnapshotStore();

  // ── SNAPSHOT ──────────────────────────────────────────────────────────────
  registry.register({
    name: "snapshot_guild",
    description: "Take a full snapshot of the guild structure (channels, roles, permissions) before making any changes. Required before any destructive operations.",
    inputSchema: zodToJsonSchema(SnapshotGuildInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId, label } = args as any;
    const guild = await discordClient.getGuild(guildId);

    const data = {
      id: guild.id,
      name: guild.name,
      verificationLevel: guild.verificationLevel,
      defaultNotifications: guild.defaultMessageNotifications,
      contentFilter: guild.explicitContentFilter,
      channels: guild.channels.cache.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId,
        position: "position" in c ? c.position : 0,
        topic: "topic" in c ? (c as any).topic : null,
        nsfw: "nsfw" in c ? (c as any).nsfw : false,
        rateLimitPerUser: "rateLimitPerUser" in c ? (c as any).rateLimitPerUser : 0,
        permissionOverwrites: "permissionOverwrites" in c
          ? Array.from((c as any).permissionOverwrites.cache.values()).map((o: any) => ({
              id: o.id, type: o.type,
              allow: o.allow.bitfield.toString(),
              deny: o.deny.bitfield.toString()
            }))
          : []
      })),
      roles: guild.roles.cache.map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        hoist: r.hoist,
        position: r.position,
        permissions: r.permissions.bitfield.toString(),
        mentionable: r.mentionable
      }))
    };

    const snapshotId = randomUUID();
    await store.save(guildId, snapshotId, data, label);
    return { snapshotId, label, channelCount: data.channels.length, roleCount: data.roles.length };
  });

  // ── LIST ──────────────────────────────────────────────────────────────────
  registry.register({
    name: "list_snapshots",
    description: "List all snapshots for a guild",
    inputSchema: zodToJsonSchema(ListSnapshotsInput) as any
  }, async (args, discordClient, limiter) => {
    const { guildId } = args as any;
    return store.list(guildId);
  });

  // ── DIFF ──────────────────────────────────────────────────────────────────
  registry.register({
    name: "diff_snapshot_vs_current",
    description: "Compare a snapshot against the current live guild state. Returns added/removed/modified channels and roles so you can detect rogue admin changes.",
    inputSchema: zodToJsonSchema(DiffSnapshotInput) as any
  }, async (args, discordClient, limiter) => {
    const { snapshotId } = args as any;

    // Find the snapshot — search all guild subdirectories
    const snapshot = await store.findById(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} not found`);

    const guildId = snapshot.guildId;
    const saved = snapshot.data;
    const guild = await discordClient.getGuild(guildId);

    // Build current state maps
    const currentChannels = new Map(guild.channels.cache.map(c => [c.id, c]));
    const currentRoles = new Map(guild.roles.cache.map(r => [r.id, r]));
    const savedChannelIds = new Set(saved.channels.map((c: any) => c.id));
    const savedRoleIds = new Set(saved.roles.map((r: any) => r.id));

    const removedChannels = saved.channels
      .filter((c: any) => !currentChannels.has(c.id))
      .map((c: any) => ({ id: c.id, name: c.name, type: c.type }));

    const addedChannels = Array.from(currentChannels.values())
      .filter(c => !savedChannelIds.has(c.id))
      .map(c => ({ id: c.id, name: c.name, type: c.type }));

    const removedRoles = saved.roles
      .filter((r: any) => !currentRoles.has(r.id) && r.name !== "@everyone")
      .map((r: any) => ({ id: r.id, name: r.name }));

    const addedRoles = Array.from(currentRoles.values())
      .filter(r => !savedRoleIds.has(r.id) && r.name !== "@everyone")
      .map(r => ({ id: r.id, name: r.name }));

    // Check permission drift on surviving channels
    const permissionDrift: any[] = [];
    for (const savedCh of saved.channels as any[]) {
      const live = currentChannels.get(savedCh.id);
      if (!live || !("permissionOverwrites" in live)) continue;
      const liveOverwrites = Array.from((live as any).permissionOverwrites.cache.values())
        .map((o: any) => ({ id: o.id, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() }));
      const savedMap = new Map(savedCh.permissionOverwrites.map((o: any) => [o.id, o]));
      const liveMap = new Map(liveOverwrites.map((o: any) => [o.id, o]));
      const drifted = liveOverwrites.filter(lo => {
        const s = savedMap.get(lo.id) as any;
        return s && (s.allow !== lo.allow || s.deny !== lo.deny);
      });
      if (drifted.length > 0) {
        permissionDrift.push({ channelId: savedCh.id, channelName: savedCh.name, driftedOverwrites: drifted.length });
      }
    }

    const clean = removedChannels.length === 0 && removedRoles.length === 0 && permissionDrift.length === 0;
    return {
      snapshotId,
      guildId,
      clean,
      summary: clean
        ? "✅ Server structure matches snapshot — no rogue changes detected."
        : `⚠️ Drift detected: ${removedChannels.length} removed channels, ${removedRoles.length} removed roles, ${permissionDrift.length} channels with permission drift.`,
      removedChannels,
      addedChannels,
      removedRoles,
      addedRoles,
      permissionDrift
    };
  });

  // ── RESTORE ──────────────────────────────────────────────────────────────
  registry.register({
    name: "restore_snapshot",
    description: "Restore a guild to a previous snapshot state. Recreates deleted roles and channels, restores permission overwrites. Use dryRun=true to preview what would be restored.",
    inputSchema: zodToJsonSchema(RestoreSnapshotInput) as any
  }, async (args, discordClient, limiter) => {
    const { snapshotId, dryRun = false } = args as any;

    const snapshot = await store.findById(snapshotId);
    if (!snapshot) throw new Error(`Snapshot ${snapshotId} not found`);

    const guildId = snapshot.guildId;
    const saved = snapshot.data;
    const guild = await discordClient.getGuild(guildId);

    const currentChannelIds = new Set(guild.channels.cache.keys());
    const currentRoleIds = new Set(guild.roles.cache.keys());

    const ops: string[] = [];
    const restoredRoleIds = new Map<string, string>(); // old id → new id

    // ── 1. Restore deleted roles (sorted by position ASC to preserve hierarchy)
    const missingRoles = saved.roles
      .filter((r: any) => !currentRoleIds.has(r.id) && r.name !== "@everyone")
      .sort((a: any, b: any) => a.position - b.position);

    for (const r of missingRoles) {
      ops.push(`CREATE ROLE: "${r.name}" (color: ${r.color})`);
      if (!dryRun) {
        const newRole = await limiter.run({ scope: "guild", guildId }, () =>
          guild.roles.create({
            name: r.name,
            color: r.color === "#000000" ? undefined : r.color,
            hoist: r.hoist,
            mentionable: r.mentionable,
            permissions: BigInt(r.permissions)
          })
        );
        restoredRoleIds.set(r.id, newRole.id);
      }
    }

    // ── 2. Restore deleted categories first
    const missingCategories = saved.channels
      .filter((c: any) => c.type === ChannelType.GuildCategory && !currentChannelIds.has(c.id))
      .sort((a: any, b: any) => a.position - b.position);

    const restoredCatIds = new Map<string, string>(); // old id → new id
    for (const cat of missingCategories) {
      ops.push(`CREATE CATEGORY: "${cat.name}"`);
      if (!dryRun) {
        const newCat = await limiter.run({ scope: "guild", guildId }, () =>
          guild.channels.create({ name: cat.name, type: ChannelType.GuildCategory, position: cat.position })
        );
        restoredCatIds.set(cat.id, newCat.id);
      }
    }

    // ── 3. Restore deleted text/voice/forum channels
    const missingChannels = saved.channels
      .filter((c: any) => c.type !== ChannelType.GuildCategory && !currentChannelIds.has(c.id))
      .sort((a: any, b: any) => a.position - b.position);

    for (const ch of missingChannels) {
      const parentId = ch.parentId
        ? (restoredCatIds.get(ch.parentId) || ch.parentId)
        : undefined;

      const typeLabel =
        ch.type === ChannelType.GuildVoice ? "VOICE" :
        ch.type === ChannelType.GuildForum ? "FORUM" :
        ch.type === ChannelType.GuildAnnouncement ? "ANNOUNCEMENT" : "TEXT";

      ops.push(`CREATE ${typeLabel} CHANNEL: "${ch.name}" (parent: ${ch.parentId || "none"})`);

      if (!dryRun) {
        const permissionOverwrites = (ch.permissionOverwrites || []).map((o: any) => ({
          id: restoredRoleIds.get(o.id) || o.id,
          type: o.type,
          allow: BigInt(o.allow),
          deny: BigInt(o.deny)
        }));

        const createOpts: any = {
          name: ch.name,
          type: ch.type,
          parent: parentId,
          position: ch.position,
          permissionOverwrites
        };
        if (ch.topic) createOpts.topic = ch.topic;
        if (ch.nsfw) createOpts.nsfw = ch.nsfw;
        if (ch.rateLimitPerUser) createOpts.rateLimitPerUser = ch.rateLimitPerUser;

        await limiter.run({ scope: "guild", guildId }, () =>
          guild.channels.create(createOpts)
        );
      }
    }

    // ── 4. Restore permission overwrites on surviving channels that drifted
    for (const savedCh of saved.channels as any[]) {
      if (!currentChannelIds.has(savedCh.id)) continue; // already handled above
      const liveCh = guild.channels.cache.get(savedCh.id);
      if (!liveCh || !("permissionOverwrites" in liveCh)) continue;

      const liveOverwrites = (liveCh as any).permissionOverwrites.cache;
      let drifted = false;
      for (const savedO of savedCh.permissionOverwrites || []) {
        const liveO = liveOverwrites.get(savedO.id);
        if (!liveO || liveO.allow.bitfield.toString() !== savedO.allow || liveO.deny.bitfield.toString() !== savedO.deny) {
          drifted = true;
          break;
        }
      }
      if (!drifted) continue;

      ops.push(`RESTORE PERMISSIONS: #${savedCh.name}`);
      if (!dryRun) {
        for (const o of savedCh.permissionOverwrites || []) {
          await limiter.run({ scope: "global" }, () =>
            (liveCh as any).permissionOverwrites.edit(
              restoredRoleIds.get(o.id) || o.id,
              {
                allow: new PermissionsBitField(BigInt(o.allow)),
                deny: new PermissionsBitField(BigInt(o.deny))
              }
            )
          );
        }
      }
    }

    return {
      dryRun,
      snapshotId,
      guildId,
      operationsCount: ops.length,
      operations: ops,
      status: dryRun
        ? `DRY RUN complete — ${ops.length} operations would be performed.`
        : ops.length === 0
          ? "✅ Server already matches snapshot — nothing to restore."
          : `✅ Restored ${ops.length} operations from snapshot.`
    };
  });
}
