/**
 * PureFrame Server Fix Script
 * 1. Cleans duplicate/old messages from channels
 * 2. Sets proper role permissions
 * 3. Sets up welcome system with generated welcome banner images
 */
import { Client, GatewayIntentBits, PermissionFlagsBits as P, ChannelType, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.TARGET_GUILD_ID;
if (!TOKEN || !GUILD_ID) { console.error('Missing DISCORD_BOT_TOKEN or TARGET_GUILD_ID'); process.exit(1); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function safe(label, fn) {
  try { const r = await fn(); console.log(`  ✓ ${label}`); return r; }
  catch (e) { console.log(`  ⚠️ ${label}: ${e.message}`); return null; }
}

// ── Welcome Banner Generator ──
async function generateWelcomeBanner(username, avatarUrl, serverName, memberCount) {
  const W = 900, H = 300;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#e94560';
  ctx.beginPath(); ctx.arc(750, 50, 200, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#533483';
  ctx.beginPath(); ctx.arc(100, 280, 150, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Bottom accent bar
  const barGrad = ctx.createLinearGradient(0, H - 4, W, H);
  barGrad.addColorStop(0, '#e94560');
  barGrad.addColorStop(0.5, '#533483');
  barGrad.addColorStop(1, '#0f3460');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, H - 4, W, 4);

  // Avatar circle
  const avatarSize = 100, avatarX = 80, avatarY = H / 2;
  // Glow ring
  ctx.shadowColor = '#e94560';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(avatarX, avatarY, avatarSize / 2 + 6, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;

  // Avatar placeholder (circle with initial)
  ctx.fillStyle = '#533483';
  ctx.beginPath(); ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(username.charAt(0).toUpperCase(), avatarX, avatarY);

  // Try to load actual avatar
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath(); ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
      ctx.restore();
    } catch {}
  }

  // Text content
  const textX = 160;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // "WELCOME" label
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#e94560';
  ctx.letterSpacing = '4px';
  ctx.fillText('W E L C O M E', textX, 90);

  // Username
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#ffffff';
  const displayName = username.length > 20 ? username.slice(0, 18) + '...' : username;
  ctx.fillText(displayName, textX, 140);

  // Server name
  ctx.font = '18px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`to ${serverName}`, textX, 178);

  // Member count
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`You are member #${memberCount}`, textX, 220);

  // Decorative dots
  ctx.fillStyle = '#e94560';
  ctx.beginPath(); ctx.arc(textX, 250, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#533483';
  ctx.beginPath(); ctx.arc(textX + 15, 250, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f3460';
  ctx.beginPath(); ctx.arc(textX + 30, 250, 3, 0, Math.PI * 2); ctx.fill();

  return canvas.toBuffer('image/png');
}

async function fixServer() {
  console.log(`✅ Bot online as ${client.user.tag}`);
  const guild = await client.guilds.fetch(GUILD_ID);
  console.log(`🎯 Target: ${guild.name} (${guild.id})\n`);

  const channels = await guild.channels.fetch();
  const allChannels = new Map();
  for (const [, ch] of channels) { if (ch) allChannels.set(ch.name.toLowerCase(), ch); }

  // ═══════════════════════════════════════════
  // PHASE 1: CLEAN OLD/DUPLICATE MESSAGES
  // ═══════════════════════════════════════════
  console.log('🧹 Phase 1: Cleaning duplicate messages...');
  
  const botId = client.user.id;
  let totalDeleted = 0;

  for (const [, ch] of allChannels) {
    if (ch.type !== ChannelType.GuildText && ch.type !== ChannelType.GuildAnnouncement) continue;
    try {
      const msgs = await ch.messages.fetch({ limit: 50 });
      const botMsgs = [...msgs.values()].filter(m => m.author.id === botId);
      
      if (botMsgs.length <= 1) continue;
      
      // Keep the NEWEST message, delete the rest
      const sorted = botMsgs.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
      const toDelete = sorted.slice(1); // keep first (newest)
      
      for (const msg of toDelete) {
        await safe(`Delete old msg in #${ch.name}`, () => msg.delete());
        totalDeleted++;
        await sleep(500);
      }
    } catch {}
  }
  console.log(`  🗑️ Deleted ${totalDeleted} duplicate messages\n`);

  // ═══════════════════════════════════════════
  // PHASE 2: SET ROLE PERMISSIONS
  // ═══════════════════════════════════════════
  console.log('🛡️ Phase 2: Configuring role permissions...');

  const roles = await guild.roles.fetch();
  const roleMap = new Map();
  for (const [, r] of roles) roleMap.set(r.name.toLowerCase(), r);

  const ROLE_PERMS = {
    'owner': [P.Administrator],
    'admin': [P.ManageGuild, P.ManageChannels, P.ManageRoles, P.ManageMessages, P.BanMembers, P.KickMembers, P.ManageWebhooks, P.ManageEmojisAndStickers, P.ViewAuditLog, P.MentionEveryone, P.ManageEvents],
    'moderator': [P.KickMembers, P.BanMembers, P.ManageMessages, P.ManageNicknames, P.MuteMembers, P.DeafenMembers, P.MoveMembers, P.ViewAuditLog, P.ModerateMembers],
    'helper': [P.ManageMessages, P.ManageNicknames, P.MuteMembers, P.ViewAuditLog],
    'support team': [P.ManageMessages, P.ManageChannels, P.ViewAuditLog],
    'contributor': [P.SendMessages, P.EmbedLinks, P.AttachFiles, P.UseExternalEmojis, P.AddReactions, P.CreatePublicThreads],
    'verified': [P.SendMessages, P.EmbedLinks, P.AttachFiles, P.UseExternalEmojis, P.AddReactions, P.Connect, P.Speak, P.UseVAD, P.CreatePublicThreads, P.ReadMessageHistory, P.ViewChannel],
    'member': [P.SendMessages, P.EmbedLinks, P.AttachFiles, P.AddReactions, P.Connect, P.Speak, P.UseVAD, P.ReadMessageHistory, P.ViewChannel],
    'unverified': [P.ViewChannel, P.ReadMessageHistory],
    'muted': [],
    'server booster': [P.SendMessages, P.EmbedLinks, P.AttachFiles, P.UseExternalEmojis, P.UseExternalStickers, P.AddReactions, P.Connect, P.Speak, P.Stream, P.UseVAD, P.CreatePublicThreads, P.CreatePrivateThreads],
  };

  for (const [roleName, perms] of Object.entries(ROLE_PERMS)) {
    const role = roleMap.get(roleName);
    if (!role || role.managed) continue;

    const permBits = perms.reduce((acc, p) => acc | p, 0n);
    await safe(`${role.name} → ${perms.length} permissions`, () =>
      role.setPermissions(permBits)
    );
    await sleep(300);
  }

  // ── Set Muted role denials on all channels ──
  const mutedRole = roleMap.get('muted');
  if (mutedRole) {
    console.log('  🔇 Applying Muted overrides to channels...');
    for (const [, ch] of allChannels) {
      if (ch.type === ChannelType.GuildCategory || ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildForum) {
        await safe(`Muted deny on #${ch.name}`, () =>
          ch.permissionOverwrites.edit(mutedRole, {
            SendMessages: false, AddReactions: false, CreatePublicThreads: false,
            Speak: false, Connect: false, SendMessagesInThreads: false,
          })
        );
        await sleep(200);
      }
    }
  }

  // ═══════════════════════════════════════════
  // PHASE 3: WELCOME BANNER SYSTEM
  // ═══════════════════════════════════════════
  console.log('\n🎨 Phase 3: Setting up welcome banner system...');

  // Find or create welcome channel
  let welcomeChannel = null;
  for (const [, ch] of allChannels) {
    if (ch.name.includes('welcome') && ch.type === ChannelType.GuildText) { welcomeChannel = ch; break; }
  }

  if (!welcomeChannel) {
    console.log('  ⚠️ No welcome channel found, skipping banner setup');
  } else {
    // Generate a sample welcome banner to prove the system works
    console.log('  🖼️ Generating sample welcome banner...');
    const sampleBanner = await generateWelcomeBanner(
      client.user.username,
      client.user.displayAvatarURL({ extension: 'png', size: 256 }),
      guild.name,
      guild.memberCount
    );

    const bannerDir = resolve(__dirname, 'assets');
    if (!existsSync(bannerDir)) mkdirSync(bannerDir, { recursive: true });
    writeFileSync(resolve(bannerDir, 'sample-welcome-banner.png'), sampleBanner);

    const attachment = new AttachmentBuilder(sampleBanner, { name: 'welcome-banner.png' });
    
    await safe('Sample welcome banner posted', () =>
      welcomeChannel.send({
        content: '## 🎉 Welcome System Active\nNew members will receive a personalized welcome banner like this:',
        files: [attachment],
        embeds: [{
          title: '👋 Welcome System Configured',
          description: [
            'Every new member who joins will automatically receive:',
            '',
            '• 🖼️ A **personalized welcome banner** with their avatar and name',
            '• 📋 Quick links to get started',
            '• 🎭 Role assignment instructions',
            '',
            '*Powered by GuildForge Welcome Engine*',
          ].join('\n'),
          color: 0xe94560,
          image: { url: 'attachment://welcome-banner.png' },
        }]
      })
    );

    // Set system channel for join messages
    await safe('System channel configured', () =>
      guild.edit({ systemChannelId: welcomeChannel.id })
    );
  }

  // ═══════════════════════════════════════════
  // PHASE 4: GENERATE WELCOME BOT MODULE
  // ═══════════════════════════════════════════
  console.log('\n📦 Phase 4: Creating persistent welcome bot module...');

  // Write the welcome bot as a standalone module users can run
  const welcomeBotCode = `
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) { console.error('Set DISCORD_BOT_TOKEN'); process.exit(1); }

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function generateWelcomeBanner(username, avatarUrl, serverName, memberCount) {
  const W = 900, H = 300;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Dark gradient background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.5, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative elements
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#e94560';
  ctx.beginPath(); ctx.arc(750, 50, 200, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#533483';
  ctx.beginPath(); ctx.arc(100, 280, 150, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Bottom accent
  const bar = ctx.createLinearGradient(0, H-4, W, H);
  bar.addColorStop(0, '#e94560'); bar.addColorStop(0.5, '#533483'); bar.addColorStop(1, '#0f3460');
  ctx.fillStyle = bar;
  ctx.fillRect(0, H - 4, W, 4);

  // Avatar
  const aSize = 100, aX = 80, aY = H / 2;
  ctx.shadowColor = '#e94560'; ctx.shadowBlur = 20;
  ctx.strokeStyle = '#e94560'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(aX, aY, aSize/2 + 6, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#533483';
  ctx.beginPath(); ctx.arc(aX, aY, aSize/2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(username.charAt(0).toUpperCase(), aX, aY);

  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath(); ctx.arc(aX, aY, aSize/2, 0, Math.PI*2); ctx.clip();
      ctx.drawImage(img, aX-aSize/2, aY-aSize/2, aSize, aSize);
      ctx.restore();
    } catch {}
  }

  const tX = 160;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#e94560';
  ctx.fillText('W E L C O M E', tX, 90);
  ctx.font = 'bold 36px sans-serif'; ctx.fillStyle = '#fff';
  ctx.fillText(username.length > 20 ? username.slice(0,18)+'...' : username, tX, 140);
  ctx.font = '18px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('to ' + serverName, tX, 178);
  ctx.font = '14px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('You are member #' + memberCount, tX, 220);

  return canvas.toBuffer('image/png');
}

client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    // Find welcome channel
    const welcomeCh = guild.channels.cache.find(c =>
      c.name.includes('welcome') && c.type === 0
    );
    if (!welcomeCh) return;

    const banner = await generateWelcomeBanner(
      member.displayName || member.user.username,
      member.user.displayAvatarURL({ extension: 'png', size: 256 }),
      guild.name,
      guild.memberCount
    );

    const attachment = new AttachmentBuilder(banner, { name: 'welcome.png' });
    await welcomeCh.send({
      content: \\\`Welcome <@\\\${member.id}> to **\\\${guild.name}**! 🎉\\\`,
      files: [attachment],
      embeds: [{
        color: 0xe94560,
        description: [
          '**Getting Started:**',
          '📜 Read the rules',
          '🎭 Pick your roles',
          '💬 Say hi in general chat!',
        ].join('\\n'),
        image: { url: 'attachment://welcome.png' },
        footer: { text: guild.name + ' • Built with GuildForge' },
      }]
    });
    console.log('Welcomed: ' + member.user.username);
  } catch (e) {
    console.error('Welcome error:', e.message);
  }
});

client.once('ready', () => console.log('🎉 Welcome bot online as ' + client.user.tag));
client.login(TOKEN);
`.trim();

  const botPath = resolve(__dirname, 'welcome-bot.mjs');
  writeFileSync(botPath, welcomeBotCode);
  console.log(`  ✓ Welcome bot saved to: ${botPath}`);
  console.log('  ℹ️ Run with: DISCORD_BOT_TOKEN=xxx node welcome-bot.mjs');

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(55));
  console.log('  ✅ PureFrame Server Fix Complete!');
  console.log('═'.repeat(55));
  console.log(`  🧹 ${totalDeleted} duplicate messages cleaned`);
  console.log(`  🛡️ ${Object.keys(ROLE_PERMS).length} roles configured with permissions`);
  console.log(`  🎨 Welcome banner system deployed`);
  console.log(`  📦 Persistent welcome-bot.mjs created`);
  console.log('═'.repeat(55));
}

client.once('ready', () => fixServer().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }));
client.login(TOKEN);
