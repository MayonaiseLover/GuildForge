/**
 * PureFrame Role Permission Fix
 * The roles were all created with identical default permissions (2248473465835073).
 * This script sets proper granular permissions per role tier.
 */
import { Client, GatewayIntentBits, PermissionFlagsBits as P } from 'discord.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.TARGET_GUILD_ID;
if (!TOKEN || !GUILD_ID) { console.error('Missing env vars'); process.exit(1); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function safe(label, fn) {
  try { const r = await fn(); console.log(`  ✓ ${label}`); return r; }
  catch (e) { console.log(`  ✗ ${label}: ${e.message}`); return null; }
}

async function fixRoles() {
  console.log(`✅ Bot: ${client.user.tag}`);
  const guild = await client.guilds.fetch(GUILD_ID);
  const roles = await guild.roles.fetch();
  console.log(`🎯 ${guild.name} — ${roles.size} roles\n`);

  // Build lookup by role name (case-insensitive, match partial after emoji)
  const findRole = (search) => {
    for (const [, r] of roles) {
      const clean = r.name.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[\uFE00-\uFE0F]|[\u200D]|[⚙🔧🛡💡💎🏆🧪🌟🔬📡🔰📢🎁🎉🐍🦀📱🎬🤖✅🔇]/gu, '').trim();
      if (clean.toLowerCase() === search.toLowerCase()) return r;
    }
    return null;
  };

  // ── Role Permission Map ──
  // Each role gets ONLY the permissions it needs
  const permMap = [
    {
      name: 'Founder',
      perms: P.Administrator,
    },
    {
      name: 'Admin',
      perms: P.ManageGuild | P.ManageChannels | P.ManageRoles | P.ManageMessages |
             P.BanMembers | P.KickMembers | P.ManageWebhooks | P.ManageEmojisAndStickers |
             P.ViewAuditLog | P.MentionEveryone | P.ManageEvents | P.ModerateMembers |
             P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.EmbedLinks |
             P.AttachFiles | P.Connect | P.Speak | P.MuteMembers | P.DeafenMembers | P.MoveMembers,
    },
    {
      name: 'Moderator',
      perms: P.KickMembers | P.BanMembers | P.ManageMessages | P.ManageNicknames |
             P.MuteMembers | P.DeafenMembers | P.MoveMembers | P.ViewAuditLog |
             P.ModerateMembers | P.SendMessages | P.ViewChannel | P.ReadMessageHistory |
             P.EmbedLinks | P.AttachFiles | P.Connect | P.Speak | P.ManageEvents,
    },
    {
      name: 'Helper',
      perms: P.ManageMessages | P.ManageNicknames | P.ViewAuditLog | P.SendMessages |
             P.ViewChannel | P.ReadMessageHistory | P.EmbedLinks | P.AttachFiles |
             P.Connect | P.Speak | P.MuteMembers,
    },
    {
      name: 'Server Booster',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.UseExternalEmojis |
             P.UseExternalStickers | P.AddReactions | P.Connect | P.Speak | P.Stream |
             P.UseVAD | P.CreatePublicThreads | P.CreatePrivateThreads |
             P.ViewChannel | P.ReadMessageHistory | P.ChangeNickname,
    },
    {
      name: 'Contributor',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.UseExternalEmojis |
             P.AddReactions | P.CreatePublicThreads | P.ViewChannel | P.ReadMessageHistory |
             P.Connect | P.Speak | P.UseVAD | P.ChangeNickname,
    },
    {
      name: 'Beta Tester',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.AddReactions |
             P.ViewChannel | P.ReadMessageHistory | P.Connect | P.Speak | P.UseVAD,
    },
    {
      name: 'Legendary',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.UseExternalEmojis |
             P.AddReactions | P.ViewChannel | P.ReadMessageHistory | P.Connect | P.Speak,
    },
    {
      name: 'Researcher',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.AddReactions |
             P.ViewChannel | P.ReadMessageHistory | P.Connect | P.Speak | P.UseVAD,
    },
    {
      name: 'Explorer',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.AddReactions |
             P.ViewChannel | P.ReadMessageHistory | P.Connect | P.Speak,
    },
    {
      name: 'Newcomer',
      perms: P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.AddReactions |
             P.Connect | P.Speak | P.UseVAD,
    },
    // Ping roles — notification only, no special perms
    { name: 'Announcements', perms: P.ViewChannel | P.ReadMessageHistory },
    { name: 'Giveaway Ping', perms: P.ViewChannel | P.ReadMessageHistory },
    { name: 'Event Ping', perms: P.ViewChannel | P.ReadMessageHistory },
    // Tech roles — same as member level
    { name: 'Python', perms: P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.AddReactions | P.Connect | P.Speak },
    { name: 'Rust', perms: P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.AddReactions | P.Connect | P.Speak },
    { name: 'Mobile Dev', perms: P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.AddReactions | P.Connect | P.Speak },
    { name: 'Video Processing', perms: P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.AddReactions | P.Connect | P.Speak },
    { name: 'AI/ML', perms: P.SendMessages | P.ViewChannel | P.ReadMessageHistory | P.AddReactions | P.Connect | P.Speak },
    // Verified — full member access
    {
      name: 'Verified',
      perms: P.SendMessages | P.EmbedLinks | P.AttachFiles | P.AddReactions |
             P.UseExternalEmojis | P.ViewChannel | P.ReadMessageHistory |
             P.Connect | P.Speak | P.UseVAD | P.CreatePublicThreads | P.ChangeNickname,
    },
    // Muted — deny everything
    { name: 'Muted', perms: P.ViewChannel | P.ReadMessageHistory },
  ];

  console.log('🛡️ Setting role permissions...\n');
  let fixed = 0;

  for (const entry of permMap) {
    const role = findRole(entry.name);
    if (!role) {
      console.log(`  ⏭️ "${entry.name}" — not found`);
      continue;
    }
    if (role.managed) {
      console.log(`  ⏭️ "${role.name}" — managed by integration (skip)`);
      continue;
    }

    const currentPerms = role.permissions.bitfield;
    const targetPerms = typeof entry.perms === 'bigint' ? entry.perms : BigInt(entry.perms);

    if (currentPerms === targetPerms) {
      console.log(`  ✔️ "${role.name}" — already correct`);
      continue;
    }

    await safe(`"${role.name}" → set ${Object.keys(P).filter(k => (targetPerms & P[k]) === P[k]).length} specific perms`, () =>
      role.setPermissions(targetPerms)
    );
    fixed++;
    await sleep(400);
  }

  // ── Lock @everyone to bare minimum ──
  console.log('\n🔒 Restricting @everyone...');
  const everyone = guild.roles.everyone;
  await safe('@everyone → read-only + view', () =>
    everyone.setPermissions(
      P.ViewChannel | P.ReadMessageHistory | P.AddReactions
    )
  );

  // ── Apply Muted deny overwrites ──
  const mutedRole = findRole('Muted');
  if (mutedRole) {
    console.log('\n🔇 Applying Muted overwrites to all channels...');
    const channels = await guild.channels.fetch();
    for (const [, ch] of channels) {
      if (!ch) continue;
      if ([0, 2, 4, 13, 15].includes(ch.type)) { // text, voice, category, stage, forum
        await safe(`Muted deny → #${ch.name}`, () =>
          ch.permissionOverwrites.edit(mutedRole, {
            SendMessages: false,
            AddReactions: false,
            CreatePublicThreads: false,
            Speak: false,
            Connect: false,
            SendMessagesInThreads: false,
          })
        );
        await sleep(200);
      }
    }
  }

  console.log(`\n✅ Done — ${fixed} roles updated`);
}

client.once('ready', () => fixRoles().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }));
client.login(TOKEN);
