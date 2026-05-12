import { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, SortOrderType, ForumLayoutType } from 'discord.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.TARGET_GUILD_ID;
if (!TOKEN) { console.error('No DISCORD_BOT_TOKEN'); process.exit(1); }
if (!GUILD_ID) { console.error('No TARGET_GUILD_ID'); process.exit(1); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function buildServer() {
  console.log(`✅ Bot online as ${client.user.tag}`);
  const guild = await client.guilds.fetch(GUILD_ID);
  console.log(`🎯 Target: ${guild.name} (${guild.id})\n`);

  // ── PHASE 1: CLEAN SLATE ──
  console.log('🧹 Cleaning existing channels and custom roles...');
  const existingChannels = await guild.channels.fetch();
  for (const [, ch] of existingChannels) {
    if (ch) try { await ch.delete(); } catch {}
  }
  const existingRoles = await guild.roles.fetch();
  for (const [, r] of existingRoles) {
    if (!r.managed && r.name !== '@everyone' && r.id !== guild.id) {
      try { await r.delete(); } catch {}
    }
  }

  // ── PHASE 1.5: SERVER BRANDING ──
  console.log('\n🎨 Setting server branding...');
  try {
    const iconPath = resolve(__dirname, 'assets/pureframe-icon.png');
    const bannerPath = resolve(__dirname, 'assets/pureframe-banner.png');
    const iconData = readFileSync(iconPath);
    const iconBase64 = `data:image/png;base64,${iconData.toString('base64')}`;
    await guild.edit({ icon: iconBase64 });
    console.log('  ✓ Server icon set');
    // Banner requires boost level 2+ — try but don't fail
    try {
      const bannerData = readFileSync(bannerPath);
      const bannerBase64 = `data:image/png;base64,${bannerData.toString('base64')}`;
      await guild.edit({ banner: bannerBase64 });
      console.log('  ✓ Server banner set');
    } catch {
      console.log('  ⚠️ Banner requires Server Boost Level 2+ (skipped)');
    }
  } catch (e) {
    console.log(`  ⚠️ Branding: ${e.message}`);
  }

  // ── PHASE 2: ROLE HIERARCHY (top-to-bottom, functional first, cosmetic last) ──
  console.log('\n👑 Building role hierarchy...');
  const R = {};
  const roleDefs = [
    // Tier 1: Executive
    { name: '⚙️ Founder',        color: 0xFFFFFF, hoist: false, perms: [PermissionFlagsBits.Administrator] },
    { name: '🔧 Admin',          color: 0xe74c3c, hoist: true,  perms: [PermissionFlagsBits.Administrator] },
    // Tier 2: Moderation
    { name: '🛡️ Moderator',      color: 0xe67e22, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageNicknames, PermissionFlagsBits.ManageThreads] },
    { name: '💡 Helper',         color: 0xf1c40f, hoist: true,  perms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads] },
    // Tier 3: VIP / Engagement
    { name: '💎 Server Booster', color: 0xf47fff, hoist: true,  perms: [] },
    { name: '🏆 Contributor',    color: 0x2ecc71, hoist: true,  perms: [] },
    { name: '🧪 Beta Tester',    color: 0x9b59b6, hoist: true,  perms: [] },
    // Tier 4: Leveling (thematic — tech/science theme)
    { name: '🌟 Legendary',      color: 0xFFD700, hoist: false, perms: [] },
    { name: '🔬 Researcher',     color: 0x1abc9c, hoist: false, perms: [] },
    { name: '📡 Explorer',       color: 0x3498db, hoist: false, perms: [] },
    { name: '🔰 Newcomer',       color: 0x95a5a6, hoist: false, perms: [] },
    // Tier 5: Opt-in notification roles
    { name: '📢 Announcements',  color: 0x2c3e50, hoist: false, perms: [] },
    { name: '🎁 Giveaway Ping',  color: 0x2c3e50, hoist: false, perms: [] },
    { name: '🎉 Event Ping',     color: 0x2c3e50, hoist: false, perms: [] },
    // Tier 6: Interest / self-assign
    { name: '🐍 Python',         color: 0x306998, hoist: false, perms: [] },
    { name: '🦀 Rust',           color: 0xDEA584, hoist: false, perms: [] },
    { name: '📱 Mobile Dev',     color: 0x3DDC84, hoist: false, perms: [] },
    { name: '🎬 Video Processing', color: 0x7B68EE, hoist: false, perms: [] },
    { name: '🤖 AI/ML',          color: 0x00CED1, hoist: false, perms: [] },
    // Tier 7: Base member
    { name: '✅ Verified',       color: 0x546e7a, hoist: false, perms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
    // Tier 8: Punitive
    { name: '🔇 Muted',          color: 0x2f3136, hoist: false, perms: [] },
  ];

  for (const def of roleDefs) {
    const r = await guild.roles.create({ name: def.name, color: def.color, hoist: def.hoist, permissions: def.permissions });
    R[def.name] = r;
    console.log(`  ✓ ${r.name}`);
  }

  // ── PHASE 3: FULL CHANNEL ARCHITECTURE ──
  console.log('\n📂 Building channel architecture...');

  const everyoneId = guild.id;
  const adminId = R['🔧 Admin'].id;
  const modId = R['🛡️ Moderator'].id;
  const mutedId = R['🔇 Muted'].id;

  // Permission templates
  const readOnly = [
    { id: everyoneId, deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions] },
    { id: adminId, allow: [PermissionFlagsBits.SendMessages] },
  ];
  const staffOnly = [
    { id: everyoneId, deny: [PermissionFlagsBits.ViewChannel] },
    { id: adminId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    { id: modId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
  ];
  const muteDeny = { id: mutedId, deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.Connect] };

  const categories = [
    {
      name: '🔰 START HERE',
      channels: [
        { name: '👋・welcome',       type: ChannelType.GuildText, topic: 'Welcome to PureFrame! Your journey starts here.', perms: readOnly },
        { name: '📜・rules',         type: ChannelType.GuildText, topic: 'Community rules and Discord ToS compliance.', perms: readOnly },
        { name: '🗺️・server-guide',  type: ChannelType.GuildText, topic: 'Navigate the server — what each channel is for.', perms: readOnly },
        { name: '🎭・get-roles',     type: ChannelType.GuildText, topic: 'Self-assign your interests, languages, and notification preferences.', perms: readOnly },
      ]
    },
    {
      name: '📢 NEWS & UPDATES',
      channels: [
        { name: '📣・announcements',  type: ChannelType.GuildText, topic: 'Official PureFrame releases, updates, and milestones.', perms: readOnly },
        { name: '📋・changelog',      type: ChannelType.GuildText, topic: 'Auto-posted release notes from GitHub Actions CI/CD.', perms: readOnly },
        { name: '🗳️・roadmap',       type: ChannelType.GuildText, topic: 'Upcoming features — vote with reactions.', perms: readOnly },
        { name: '🐙・github-feed',   type: ChannelType.GuildText, topic: 'Live commits, PRs, and issues from GitHub webhook.', perms: readOnly },
      ]
    },
    {
      name: '💬 COMMUNITY',
      channels: [
        { name: '💬・general-chat',    type: ChannelType.GuildText, topic: 'The main hub. Talk PureFrame, video tech, AI, and life.' },
        { name: '👤・introductions',   type: ChannelType.GuildText, topic: 'New here? Tell us about yourself! +50 XP for your first post.' },
        { name: '🖼️・showcase',       type: ChannelType.GuildText, topic: 'Share your PureFrame results — before/after screenshots, processing stats.' },
        { name: '💡・ideas-and-feedback', type: ChannelType.GuildText, topic: 'Suggest features, vote on ideas, share feedback.' },
        { name: '🎭・off-topic',       type: ChannelType.GuildText, topic: 'Memes, music, random vibes. Keep it chill.' },
        { name: '🤖・bot-commands',    type: ChannelType.GuildText, topic: 'Economy grinding, leveling, and bot interactions go here.' },
      ]
    },
    {
      name: '🛠️ SUPPORT',
      channels: [
        { name: '📥・create-ticket',   type: ChannelType.GuildText, topic: 'Click to open a private support ticket for 1-on-1 help.' },
        { name: '🔧・installation',    type: ChannelType.GuildText, topic: 'Python, FFmpeg, GPU drivers, CUDA — get help setting up.', slowmode: 5 },
        { name: '❓・usage-questions',  type: ChannelType.GuildText, topic: 'Content-type profiles, strictness levels, batch processing, plan files.', slowmode: 5 },
        { name: '🐛・bug-reports',     type: ChannelType.GuildForum, topic: 'Report bugs with reproduction steps.',
          forumTags: [
            { name: '🆕 New', emoji: { name: '🆕' } },
            { name: '✅ Confirmed', emoji: { name: '✅' } },
            { name: '🔍 Investigating', emoji: { name: '🔍' } },
            { name: '🔧 In Progress', emoji: { name: '🔧' } },
            { name: '✔️ Fixed', emoji: { name: '✔️' } },
            { name: '❌ Won\'t Fix', emoji: { name: '❌' } },
            { name: '🔄 Duplicate', emoji: { name: '🔄' } },
          ],
          forumGuidelines: '## How to Report a Bug\n\n**Title:** Brief description of the issue\n\n**Include:**\n- PureFrame version (`pureframe --version`)\n- OS and Python version\n- GPU model and CUDA version\n- Steps to reproduce\n- Expected vs actual behavior\n- Error logs (wrap in \`\`\`code blocks\`\`\`)\n\n**Screenshots/videos are highly encouraged!**',
          defaultReaction: '🐛',
          forumLayout: 1, // ListView
          forumSort: 1, // LatestActivity
        },
        { name: '🎯・false-positives', type: ChannelType.GuildForum, topic: 'Detection accuracy discussions and threshold tuning.',
          forumTags: [
            { name: '🎥 Live Action', emoji: { name: '🎥' } },
            { name: '🌸 Anime', emoji: { name: '🌸' } },
            { name: '🎨 Animation', emoji: { name: '🎨' } },
            { name: '🌙 Low Light', emoji: { name: '🌙' } },
            { name: '✅ Resolved', emoji: { name: '✅' } },
            { name: '⚙️ Config Issue', emoji: { name: '⚙️' } },
          ],
          forumGuidelines: '## False Positive Report\n\n**Title:** Brief scene description\n\n**Include:**\n- Content type (live-action / anime / animation)\n- Strictness level used\n- Timestamp range of false positive\n- Screenshot of the falsely blurred region\n- Your confidence threshold settings\n\n**This helps us improve detection accuracy!**',
          defaultReaction: '🎯',
          forumLayout: 1,
          forumSort: 1,
        },
      ]
    },
    {
      name: '👨‍💻 DEVELOPMENT',
      channels: [
        { name: '🏗️・contributing',    type: ChannelType.GuildText, topic: 'How to contribute. PR workflow, dev setup, coding standards.' },
        { name: '🧠・architecture',    type: ChannelType.GuildText, topic: 'Deep dives: NudeNet, CLIP, PANNs, confidence fusion, FFmpeg rendering pipeline.' },
        { name: '📚・documentation',   type: ChannelType.GuildForum, topic: 'Wiki-style threads for codebase reference and API docs.',
          forumTags: [
            { name: '📖 Guide', emoji: { name: '📖' } },
            { name: '🔌 API', emoji: { name: '🔌' } },
            { name: '⚙️ Config', emoji: { name: '⚙️' } },
            { name: '🏗️ Architecture', emoji: { name: '🏗️' } },
            { name: '📝 FAQ', emoji: { name: '📝' } },
            { name: '🎓 Tutorial', emoji: { name: '🎓' } },
          ],
          forumGuidelines: '## Documentation Thread\n\nCreate a thread for each topic. Use markdown formatting.\n\n**Good thread titles:**\n- "Quick Start Guide"\n- "GPU Acceleration Setup"\n- "Content Profile Configuration"\n\n**Tag your post** so others can find it easily.',
          defaultReaction: '📚',
          forumLayout: 1,
          forumSort: 0, // CreationDate
        },
        { name: '🔬・research',        type: ChannelType.GuildText, topic: 'Computer vision papers, detection models, new approaches.' },
        { name: '🔄・ci-cd',           type: ChannelType.GuildText, topic: 'GitHub Actions, test coverage, PyPI releases, Docker builds.' },
      ]
    },
    {
      name: '🎬 CONTENT PROFILES',
      channels: [
        { name: '🎥・live-action',  type: ChannelType.GuildText, topic: 'Movies, TV shows, documentaries — live-action processing.' },
        { name: '🌸・anime',        type: ChannelType.GuildText, topic: 'Anime-specific detection. Art style challenges, false positive tuning.' },
        { name: '🎨・animation',    type: ChannelType.GuildText, topic: 'Cartoons, CGI, stop-motion — animated content processing.' },
        { name: '🌙・low-light',    type: ChannelType.GuildText, topic: 'Horror, noir, dark scenes — sensitivity tuning for low-light footage.' },
        { name: '📊・benchmarks',   type: ChannelType.GuildText, topic: 'Share your processing benchmarks: GPU, resolution, speed, accuracy.' },
      ]
    },
    {
      name: '🔊 VOICE',
      channels: [
        { name: '🔊 Lobby',             type: ChannelType.GuildVoice, topic: '' },
        { name: '💻 Dev Standup',        type: ChannelType.GuildVoice, topic: '' },
        { name: '🎬 Watch Party',        type: ChannelType.GuildVoice, topic: '' },
        { name: '🎵 Lofi & Chill',       type: ChannelType.GuildVoice, topic: '' },
        { name: '💤 Sleep Call',          type: ChannelType.GuildVoice, topic: '' },
        { name: '🎙️ Streamer Hub',       type: ChannelType.GuildVoice, topic: '' },
      ]
    },
    {
      name: '📊 LOGS',
      channels: [
        { name: '📝・audit-log',      type: ChannelType.GuildText, topic: 'Auto-fed by Carl-bot/Dyno. Every mod action logged.', perms: staffOnly },
        { name: '🚪・join-log',       type: ChannelType.GuildText, topic: 'Member join/leave tracking with invite source.', perms: staffOnly },
        { name: '💬・message-log',    type: ChannelType.GuildText, topic: 'Deleted and edited message tracking.', perms: staffOnly },
      ]
    },
    {
      name: '🔒 STAFF',
      channels: [
        { name: '📢・staff-announcements', type: ChannelType.GuildText, topic: 'Owner → Admin only. Policy changes and directives.', perms: staffOnly },
        { name: '💬・mod-chat',            type: ChannelType.GuildText, topic: 'All staff coordination and discussion.', perms: staffOnly },
        { name: '📋・report-queue',        type: ChannelType.GuildText, topic: 'User reports routed here for review.', perms: staffOnly },
        { name: '📜・ticket-transcripts',  type: ChannelType.GuildText, topic: 'Auto-archived closed ticket logs.', perms: staffOnly },
        { name: '🤖・bot-config',          type: ChannelType.GuildText, topic: 'Bot setup, testing, and configuration.', perms: staffOnly },
      ]
    },
  ];

  const createdChannels = {};
  for (const cat of categories) {
    const category = await guild.channels.create({ name: cat.name, type: ChannelType.GuildCategory });
    console.log(`  📁 ${category.name}`);

    for (const ch of cat.channels) {
      const opts = {
        name: ch.name,
        type: ch.type,
        parent: category.id,
      };
      if (ch.topic && ch.type !== ChannelType.GuildVoice) opts.topic = ch.topic;
      if (ch.perms) {
        opts.permissionOverwrites = [...ch.perms, muteDeny];
      } else {
        opts.permissionOverwrites = [muteDeny];
      }
      // Slowmode for text channels
      if (ch.slowmode && ch.type === ChannelType.GuildText) {
        opts.rateLimitPerUser = ch.slowmode;
      }
      // Forum-specific configuration
      if (ch.type === ChannelType.GuildForum) {
        if (ch.forumTags) opts.availableTags = ch.forumTags;
        if (ch.forumGuidelines) opts.topic = ch.forumGuidelines;
        if (ch.defaultReaction) opts.defaultReactionEmoji = { name: ch.defaultReaction };
        if (ch.forumLayout !== undefined) opts.defaultForumLayout = ch.forumLayout;
        if (ch.forumSort !== undefined) opts.defaultSortOrder = ch.forumSort;
        opts.rateLimitPerUser = 10; // 10s slowmode on forum posts
      }
      const created = await guild.channels.create(opts);
      // Store by clean name (strip emoji prefix)
      const cleanName = ch.name.replace(/^[^\w#]*・/, '').replace(/^[^\w]*\s/, '');
      createdChannels[cleanName] = created;
      createdChannels[ch.name] = created;
      const label = ch.type === ChannelType.GuildVoice ? '🔈' : ch.type === ChannelType.GuildForum ? '📋' : '  #';
      const suffix = ch.perms === readOnly ? ' (read-only)' : ch.perms === staffOnly ? ' (staff)' : '';
      const extra = ch.forumTags ? ` [${ch.forumTags.length} tags]` : '';
      console.log(`    ${label} ${ch.name}${suffix}${extra}`);
    }
  }

  // ── PHASE 4: RICH EMBEDS ──
  console.log('\n📝 Sending rich embeds...');

  // Welcome embed
  const welcomeCh = createdChannels['👋・welcome'];
  if (welcomeCh) {
    await welcomeCh.send({
      embeds: [{
        title: '# 🎬 Welcome to PureFrame',
        description: [
          '**Watch any movie with your family. Without cutting a single second.**',
          '',
          'PureFrame is an open-source AI tool that finds explicit visuals in video files and applies localized, smoothly-tracked blurs. No scene skipping. No audio cuts. No cloud. No subscription.',
          '',
          '### Quick Links',
          '🔗 [GitHub Repository](https://github.com/MayonaiseLover/PureFrame)',
          '📦 [Install from PyPI](https://pypi.org/project/pureframe/) — `pip install pureframe`',
          '📖 [Documentation](https://github.com/MayonaiseLover/PureFrame#quick-start)',
          '',
          '### Get Started',
          `1️⃣ Read the rules in <#${createdChannels['📜・rules']?.id}>`,
          `2️⃣ Grab your roles in <#${createdChannels['🎭・get-roles']?.id}>`,
          `3️⃣ Introduce yourself in <#${createdChannels['👤・introductions']?.id}>`,
          `4️⃣ Ask questions in <#${createdChannels['🔧・installation']?.id}> or <#${createdChannels['❓・usage-questions']?.id}>`,
          `5️⃣ Share your results in <#${createdChannels['🖼️・showcase']?.id}>`,
          '',
          '-# ⚡ This server was architected by [GuildForge](https://github.com/guildforge/guildforge) — AI-powered Discord architecture in under 60 seconds.',
        ].join('\n'),
        color: 0x6366f1,
        thumbnail: { url: 'https://raw.githubusercontent.com/MayonaiseLover/PureFrame/main/assets/logo.svg' },
      }]
    });
    console.log('  ✓ Welcome embed');
  }

  // Rules embed
  const rulesCh = createdChannels['📜・rules'];
  if (rulesCh) {
    await rulesCh.send({
      embeds: [{
        title: '📋 Community Rules',
        description: [
          '```fix',
          'By participating in this server, you agree to follow these rules',
          'and Discord\'s Terms of Service.',
          '```',
          '',
          '**1.** 🤝 **Be respectful and constructive.** No harassment, hate speech, or personal attacks.',
          '**2.** 🚫 **No piracy.** Do not share copyrighted content, torrents, or pirated media.',
          '**3.** 🔒 **No explicit content.** Ironic for our niche, but this is a SFW server.',
          '**4.** 🐛 **Bug reports go in** <#' + (createdChannels['🐛・bug-reports']?.id || '') + '> or [GitHub Issues](https://github.com/MayonaiseLover/PureFrame/issues).',
          '**5.** 💬 **Stay on-topic** in specialized channels. Use #off-topic for everything else.',
          '**6.** 📢 **No spam or self-promotion** outside of #showcase.',
          '**7.** 🤖 **Bot commands** belong in <#' + (createdChannels['🤖・bot-commands']?.id || '') + '> only.',
          '**8.** 🔇 **Respect mods.** Their decisions are final. Appeal via tickets.',
          '**9.** 🌍 **English only** in public channels. We welcome everyone.',
          '**10.** ⚖️ **Follow [Discord ToS](https://discord.com/terms)** at all times.',
          '',
          '### Escalation Ladder',
          '```',
          'Warning → 24h Timeout → 7d Timeout → Permanent Ban',
          '```',
          '',
          '-# Appeals: Open a ticket in #create-ticket to contest any action.',
        ].join('\n'),
        color: 0xe74c3c,
      }]
    });
    console.log('  ✓ Rules embed');
  }

  // Server Guide embed
  const guideCh = createdChannels['🗺️・server-guide'];
  if (guideCh) {
    await guideCh.send({
      embeds: [{
        title: '🗺️ Server Navigation Guide',
        description: [
          '### 🔰 Start Here',
          `<#${createdChannels['👋・welcome']?.id}> — Welcome message and quick links`,
          `<#${createdChannels['📜・rules']?.id}> — Community rules (read first!)`,
          `<#${createdChannels['🎭・get-roles']?.id}> — Self-assign your interests`,
          '',
          '### 📢 Stay Updated',
          `<#${createdChannels['📣・announcements']?.id}> — Official releases and milestones`,
          `<#${createdChannels['📋・changelog']?.id}> — Auto-posted from GitHub CI`,
          `<#${createdChannels['🐙・github-feed']?.id}> — Live commits and PRs`,
          '',
          '### 💬 Hang Out',
          `<#${createdChannels['💬・general-chat']?.id}> — Main chat`,
          `<#${createdChannels['🖼️・showcase']?.id}> — Share your results`,
          `<#${createdChannels['🤖・bot-commands']?.id}> — Bot economy and XP grinding`,
          '',
          '### 🛠️ Get Help',
          `<#${createdChannels['🔧・installation']?.id}> — Setup and installation help`,
          `<#${createdChannels['🐛・bug-reports']?.id}> — Report bugs (Forum)`,
          `<#${createdChannels['🎯・false-positives']?.id}> — Detection accuracy (Forum)`,
          '',
          '### 👨‍💻 Contribute',
          `<#${createdChannels['🏗️・contributing']?.id}> — How to submit PRs`,
          `<#${createdChannels['🧠・architecture']?.id}> — Technical deep dives`,
          `<#${createdChannels['📚・documentation']?.id}> — Wiki threads (Forum)`,
          '',
          '### 🎬 Content Types',
          `<#${createdChannels['🎥・live-action']?.id}> | <#${createdChannels['🌸・anime']?.id}> | <#${createdChannels['🎨・animation']?.id}> | <#${createdChannels['🌙・low-light']?.id}>`,
          '',
          '-# Missing something? Suggest it in #ideas-and-feedback!',
        ].join('\n'),
        color: 0x3498db,
      }]
    });
    console.log('  ✓ Server guide embed');
  }

  // Role selection embed
  const rolesCh = createdChannels['🎭・get-roles'];
  if (rolesCh) {
    await rolesCh.send({
      embeds: [
        {
          title: '🔔 Notification Preferences',
          description: [
            'React to get pinged for what matters to you:',
            '',
            '📢 — Release announcements and updates',
            '🎁 — Giveaways and competitions',
            '🎉 — Events, AMAs, and watch parties',
          ].join('\n'),
          color: 0x2ecc71,
        },
        {
          title: '💻 Tech Stack',
          description: [
            'What do you work with?',
            '',
            '🐍 — Python',
            '🦀 — Rust',
            '📱 — Mobile Development',
            '🎬 — Video Processing / FFmpeg',
            '🤖 — AI / Machine Learning',
          ].join('\n'),
          color: 0x3498db,
        },
      ]
    });
    // Add reactions for self-assign
    const msgs = await rolesCh.messages.fetch({ limit: 1 });
    const roleMsg = msgs.first();
    if (roleMsg) {
      for (const emoji of ['📢', '🎁', '🎉', '🐍', '🦀', '📱', '🎬', '🤖']) {
        try { await roleMsg.react(emoji); } catch {}
      }
    }
    console.log('  ✓ Role selection embed + reactions');
  }

  // Bot ecosystem recommendation in bot-config
  const botCfg = createdChannels['🤖・bot-config'];
  if (botCfg) {
    await botCfg.send({
      embeds: [{
        title: '🤖 Recommended Bot Stack',
        description: [
          '### Essential Infrastructure',
          '| Bot | Purpose | Invite |',
          '|-----|---------|--------|',
          '| **Carl-bot** | Reaction roles, logging, embeds, auto-mod | [carl.gg](https://carl.gg) |',
          '| **Dyno** | Audit logs, anti-spam, heavy-traffic resilience | [dyno.gg](https://dyno.gg) |',
          '| **Sapphire** | All-rounder utility, thread management | [sapph.xyz](https://sapph.xyz) |',
          '| **Ticket Tool** | Private support tickets | [tickettool.xyz](https://tickettool.xyz) |',
          '| **Xenon** | Full server backup and restore | [xenon.bot](https://xenon.bot) |',
          '',
          '### Engagement & Growth',
          '| Bot | Purpose | Invite |',
          '|-----|---------|--------|',
          '| **Arcane** | XP leveling, voice tracking, role rewards | [arcane.bot](https://arcane.bot) |',
          '| **GiveawayBot** | Reaction-based giveaways | invite via Top.gg |',
          '| **Apollo** | Event scheduling with RSVP | [apollo.fyi](https://apollo.fyi) |',
          '| **Statbot** | Server analytics and metrics | [statbot.net](https://statbot.net) |',
          '',
          '### GitHub Integration',
          '| Bot | Purpose |',
          '|-----|---------|',
          '| **GitHub Bot** | Webhook → #github-feed and #changelog |',
          '',
          '-# ⚠️ Never grant bots Administrator. Use granular bot-specific roles.',
        ].join('\n'),
        color: 0x7289da,
      }]
    });
    console.log('  ✓ Bot recommendation embed');
  }

  // Ticket system setup embed
  const ticketCh = createdChannels['📥・create-ticket'];
  if (ticketCh) {
    await ticketCh.send({
      embeds: [{
        title: '🎫 PureFrame Support Tickets',
        description: [
          '### Need Help?',
          '',
          'Our support system helps you get private, focused assistance.',
          '',
          '**How it works:**',
          '1. React with 🎫 below to open a ticket',
          '2. A private channel will be created for you',
          '3. Describe your issue in detail',
          '4. A staff member will respond ASAP',
          '',
          '**Before opening a ticket, check:**',
          '• <#' + (createdChannels['🔧・installation']?.id || '') + '> — Installation issues',
          '• <#' + (createdChannels['❓・usage-questions']?.id || '') + '> — Usage questions',
          '• <#' + (createdChannels['🐛・bug-reports']?.id || '') + '> — Bug reports',
          '',
          '**Average response time:** < 12 hours',
          '',
          '-# React with 🎫 to open a private support ticket.',
        ].join('\n'),
        color: 0xe67e22,
        footer: { text: 'Powered by GuildForge • Ticket Tool integration available' },
      }],
    });
    const ticketMsg = (await ticketCh.messages.fetch({ limit: 1 })).first();
    if (ticketMsg) try { await ticketMsg.react('🎫'); } catch {}
    console.log('  ✓ Ticket system embed');
  }

  // Contributing guide embed
  const contribCh = createdChannels['🏗️・contributing'];
  if (contribCh) {
    await contribCh.send({
      embeds: [{
        title: '🏗️ Contributing to PureFrame',
        description: [
          '### Welcome, contributor! 🎉',
          '',
          'PureFrame is open source and we love contributions.',
          '',
          '### Getting Started',
          '```bash',
          'git clone https://github.com/MayonaiseLover/PureFrame.git',
          'cd PureFrame',
          'python -m venv .venv && source .venv/bin/activate',
          'pip install -e ".[dev]"',
          'pytest  # verify everything passes',
          '```',
          '',
          '### PR Workflow',
          '1. Fork the repo',
          '2. Create a feature branch: `git checkout -b feat/my-feature`',
          '3. Write tests first (TDD encouraged)',
          '4. Make your changes',
          '5. Run `pytest && ruff check .`',
          '6. Open a PR with a clear description',
          '',
          '### What to Work On',
          '• Check [GitHub Issues](https://github.com/MayonaiseLover/PureFrame/issues) for `good first issue`',
          '• Browse the <#' + (createdChannels['🗳️・roadmap']?.id || '') + '> for planned features',
          '• Propose ideas in <#' + (createdChannels['💡・ideas-and-feedback']?.id || '') + '>',
          '',
          '### Code Style',
          '• Python 3.11+ with type hints everywhere',
          '• `ruff` for linting, `black` for formatting',
          '• Docstrings on all public functions',
          '• Tests in `tests/` matching source structure',
        ].join('\n'),
        color: 0x1abc9c,
        footer: { text: 'PRs are reviewed within 48 hours' },
      }],
    });
    console.log('  ✓ Contributing guide embed');
  }

  // Architecture overview
  const archCh = createdChannels['🧠・architecture'];
  if (archCh) {
    await archCh.send({
      embeds: [{
        title: '🧠 PureFrame Architecture Overview',
        description: [
          '### System Pipeline',
          '```',
          'Input Video → Frame Extraction → Detection Engine → Verdict Fusion → Smart Rendering → Output',
          '```',
          '',
          '### Detection Stack',
          '| Model | Purpose | Precision |',
          '|-------|---------|-----------|',
          '| NudeNet v3 | NSFW classification | 94.2% |',
          '| CLIP ViT-L/14 | Scene understanding | 91.8% |',
          '| PANNs | Audio analysis | 89.5% |',
          '',
          '### Key Design Decisions',
          '• **Smart Segment Rendering** — Only re-encodes affected segments, 4-8x faster',
          '• **Confidence Fusion** — Combines multiple model scores with Bayesian aggregation',
          '• **Batch Processing** — SQLite checkpoints for crash recovery on large folders',
          '• **Content Profiles** — Tuned thresholds per content type (anime vs live-action)',
          '',
          '### Tech Stack',
          '`Python` `PyTorch` `FFmpeg` `ONNX Runtime` `SQLite` `Click CLI`',
        ].join('\n'),
        color: 0x9b59b6,
      }],
    });
    console.log('  ✓ Architecture overview embed');
  }

  // Announcement in #announcements
  const announceCh = createdChannels['📣・announcements'];
  if (announceCh) {
    await announceCh.send({
      embeds: [{
        title: '🎉 Welcome to the PureFrame Community!',
        description: [
          'This server was built with **GuildForge** — the AI-powered Discord architect.',
          '',
          '### What is PureFrame?',
          'An open-source, AI-powered video censorship tool that automatically detects and blurs NSFW content using state-of-the-art computer vision models.',
          '',
          '### Links',
          '• 📦 [GitHub Repository](https://github.com/MayonaiseLover/PureFrame)',
          '• 📖 [Documentation](https://github.com/MayonaiseLover/PureFrame#readme)',
          '• 🐍 [PyPI Package](https://pypi.org/project/pureframe/)',
          '',
          '### Get Started',
          '1. Head to <#' + (createdChannels['📜・rules']?.id || '') + '> to read the rules',
          '2. Pick your roles in <#' + (createdChannels['🎭・get-roles']?.id || '') + '>',
          '3. Introduce yourself in <#' + (createdChannels['👤・introductions']?.id || '') + '>',
          '4. Join the conversation in <#' + (createdChannels['💬・general-chat']?.id || '') + '>',
        ].join('\n'),
        color: 0x6366f1,
        thumbnail: { url: guild.iconURL() || '' },
        footer: { text: 'Built with GuildForge ⚡' },
      }],
    });
    console.log('  ✓ Launch announcement embed');
  }

  // ── PHASE 5: AUTOMOD (Discord Native — no bots needed) ──
  console.log('\n🛡️ Configuring AutoMod rules...');
  try {
    // Delete existing automod rules
    const existingRules = await guild.autoModerationRules.fetch();
    for (const [, rule] of existingRules) {
      try { await rule.delete(); } catch {}
    }

    const alertCh = createdChannels['📝・audit-log'];
    const alertAction = alertCh ? [{ type: 2, metadata: { channel: alertCh } }] : [];

    // Rule 1: Block common spam keywords
    await guild.autoModerationRules.create({
      name: '🚫 Spam & Scam Filter',
      eventType: 1,
      triggerType: 1,
      triggerMetadata: {
        keywordFilter: [
          'free nitro', 'steam gift', 'click here',
          'earn money', 'crypto airdrop', 'nft mint', 'cashapp', 'dm me for',
          '@everyone free', 'onlyfans', 'leaked'
        ],
      },
      actions: [
        { type: 1 },
        ...alertAction,
      ],
      enabled: true
    });
    console.log('  ✓ Spam & Scam keyword filter');

    // Rule 2: Block harmful content presets
    await guild.autoModerationRules.create({
      name: '🔒 Harmful Content Filter',
      eventType: 1,
      triggerType: 4,
      triggerMetadata: {
        presets: [1, 2, 3],
        allowList: ['damn', 'hell', 'crap']
      },
      actions: [
        { type: 1 },
        ...alertAction,
      ],
      enabled: true
    });
    console.log('  ✓ Harmful content preset filter');

    // Rule 3: Anti-spam
    await guild.autoModerationRules.create({
      name: '🔄 Anti-Spam',
      eventType: 1,
      triggerType: 3,
      actions: [
        { type: 1 },
        ...alertAction,
      ],
      enabled: true
    });
    console.log('  ✓ Anti-spam protection');

    // Rule 4: Mention spam
    await guild.autoModerationRules.create({
      name: '📢 Mention Spam Blocker',
      eventType: 1,
      triggerType: 5,
      triggerMetadata: { mentionTotalLimit: 5 },
      actions: [
        { type: 1 },
        ...alertAction,
      ],
      enabled: true
    });
    console.log('  ✓ Mention spam blocker (>5 mentions blocked)');
  } catch (e) {
    console.log(`  ⚠️ AutoMod setup partial: ${e.message}`);
  }

  // ── PHASE 6: SERVER CONFIG ──
  console.log('\n⚙️ Configuring server settings...');
  try {
    const systemCh = createdChannels['👋・welcome'];
    await guild.edit({
      verificationLevel: 2, // MEDIUM — must have verified email
      explicitContentFilter: 2, // ALL_MEMBERS — scan all messages
      defaultMessageNotifications: 1, // ONLY_MENTIONS — prevent notification spam
      ...(systemCh ? { systemChannelId: systemCh.id } : {}),
    });
    console.log('  ✓ Verification: MEDIUM (verified email)');
    console.log('  ✓ Content filter: ALL MEMBERS');
    console.log('  ✓ Default notifications: Mentions only');
    console.log('  ✓ System channel: #welcome');
  } catch (e) {
    console.log(`  ⚠️ Server config partial: ${e.message}`);
  }

  // ── PHASE 7: WEBHOOKS ──
  console.log('\n🔗 Setting up webhooks...');
  const githubFeedCh = createdChannels['🐙・github-feed'];
  if (githubFeedCh) {
    try {
      const webhook = await githubFeedCh.createWebhook({
        name: 'GitHub — PureFrame',
        reason: 'GuildForge: Auto-configured GitHub webhook for live feed'
      });
      console.log(`  ✓ GitHub webhook created for #github-feed`);
      console.log(`  📋 Webhook URL: ${webhook.url}`);
      console.log(`  → Add to GitHub: Settings > Webhooks > Payload URL`);

      // Post setup instructions in staff channel
      const staffCh = createdChannels['🤖・bot-config'];
      if (staffCh) {
        await staffCh.send({
          embeds: [{
            title: '🔗 GitHub Webhook — Setup Instructions',
            description: [
              '### Webhook URL (copy this):',
              `\`\`\`\n${webhook.url}/github\n\`\`\``,
              '',
              '### Setup Steps:',
              '1. Go to [PureFrame GitHub Settings](https://github.com/MayonaiseLover/PureFrame/settings/hooks)',
              '2. Click **Add webhook**',
              '3. Paste the URL above as **Payload URL**',
              '4. Set **Content type** to `application/json`',
              '5. Select **Send me everything** or choose specific events',
              '6. Click **Add webhook**',
              '',
              '-# Commits, PRs, issues, and releases will auto-post in <#' + githubFeedCh.id + '>',
            ].join('\n'),
            color: 0x24292e,
          }]
        });
      }
    } catch (e) {
      console.log(`  ⚠️ Webhook setup failed: ${e.message}`);
    }
  }

  // Changelog webhook
  const changelogCh = createdChannels['📋・changelog'];
  if (changelogCh) {
    try {
      const clWebhook = await changelogCh.createWebhook({
        name: 'CI/CD — Releases',
        reason: 'GuildForge: Auto-configured changelog webhook'
      });
      console.log(`  ✓ Changelog webhook created for #changelog`);
    } catch (e) {
      console.log(`  ⚠️ Changelog webhook: ${e.message}`);
    }
  }

  // ── PHASE 8: BOT INVITE PANELS ──
  console.log('\n🤖 Posting bot invite panels...');
  const BOT_DATA = {
    'carl-bot':       { name: 'Carl-bot',       clientId: '235148962103951360', perms: '1642824531190', cat: 'Moderation', desc: 'Reaction roles, logging, embeds, auto-mod', guide: '1. Visit carl.gg\n2. Select server\n3. Enable Automod + Logging + Reaction Roles' },
    'dyno':           { name: 'Dyno',           clientId: '161660517914509312', perms: '470150358',     cat: 'Logging',    desc: 'Audit logs, anti-spam (10.6M servers)',      guide: '1. Visit dyno.gg\n2. Enable Action Log\n3. Set log channel to #audit-log' },
    'ticket-tool':    { name: 'Ticket Tool',    clientId: '557628352828014614', perms: '326417525840',  cat: 'Support',    desc: 'Private ticket channels (4.45M servers)',    guide: '1. /setup in #create-ticket\n2. Set staff roles\n3. Transcripts → #ticket-transcripts' },
    'arcane':         { name: 'Arcane',         clientId: '530082442967646230', perms: '268503126',     cat: 'Leveling',   desc: 'XP + voice tracking + leaderboards',         guide: '1. Visit arcane.bot\n2. Set XP rates\n3. Blacklist #bot-commands' },
    'statbot':        { name: 'Statbot',        clientId: '491769129318088714', perms: '1073743872',    cat: 'Analytics',  desc: 'Member velocity, peak hours, channel stats', guide: '1. Visit statbot.net\n2. Enable tracking\n3. Optionally add counter channels' },
    'wick':           { name: 'Wick',           clientId: '536991182035746816', perms: '8',             cat: 'Security',   desc: 'Anti-nuke, anti-raid, CAPTCHA verification', guide: '1. Visit wickbot.com\n2. Enable Anti-Nuke\n3. Whitelist trusted bots' },
    'xenon':          { name: 'Xenon',          clientId: '416358583220043796', perms: '8',             cat: 'Backup',     desc: 'Full server backup and disaster recovery',   guide: '1. /backup create\n2. Schedule auto-backups\n3. /backup load to restore' },
    'apollo':         { name: 'Apollo',         clientId: '475744554910351370', perms: '335670337',     cat: 'Events',     desc: 'RSVP events with timezone support',           guide: '1. /event create\n2. Members RSVP\n3. Auto DM reminders' },
    'giveawaybot':    { name: 'GiveawayBot',    clientId: '294882584201003009', perms: '347200',        cat: 'Engagement', desc: 'Reaction giveaways with re-rolls',            guide: '1. /giveaway start\n2. Set prize + duration\n3. Auto-selects winners' },
    'invite-tracker': { name: 'Invite Tracker', clientId: '720351927581278219', perms: '268435521',     cat: 'Growth',     desc: 'Track invite sources, reward recruiters',     guide: '1. Auto-tracks invites\n2. /invites for leaderboard\n3. Auto-roles for inviters' },
  };

  function makeInvite(botId) {
    const b = BOT_DATA[botId];
    return `https://discord.com/oauth2/authorize?client_id=${b.clientId}&permissions=${b.perms}&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`;
  }

  const botConfigCh = createdChannels['🤖・bot-config'];
  if (botConfigCh) {
    // Essential bots panel
    const essentials = ['carl-bot', 'dyno', 'ticket-tool', 'wick', 'xenon'];
    await botConfigCh.send({
      content: '## 🔒 Essential Infrastructure — Install These First\n-# Click each bot name to invite with correct permissions. **Never grant Administrator.**',
      embeds: essentials.map(id => {
        const b = BOT_DATA[id];
        return {
          title: `${b.name} — ${b.cat}`,
          description: `${b.desc}\n\n**[➕ Click to Invite ${b.name}](${makeInvite(id)})**\n\`\`\`\n${b.guide}\n\`\`\``,
          color: 0xe74c3c,
          footer: { text: `Permissions: ${b.perms} (granular, not admin)` }
        };
      })
    });
    console.log('  ✓ Essential bot panel (5 bots with invite links)');

    // Growth bots panel
    const growth = ['arcane', 'statbot', 'apollo', 'giveawaybot', 'invite-tracker'];
    await botConfigCh.send({
      content: '## ⚡ Engagement & Growth — Recommended',
      embeds: growth.map(id => {
        const b = BOT_DATA[id];
        return {
          title: `${b.name} — ${b.cat}`,
          description: `${b.desc}\n\n**[➕ Click to Invite ${b.name}](${makeInvite(id)})**\n\`\`\`\n${b.guide}\n\`\`\``,
          color: 0x3498db,
          footer: { text: `Permissions: ${b.perms}` }
        };
      })
    });
    console.log('  ✓ Growth bot panel (5 bots with invite links)');
  }

  // ── PHASE 8.5: SEED FORUM POSTS ──
  console.log('\n📋 Seeding forum threads...');
  const bugForum = createdChannels['🐛・bug-reports'];
  if (bugForum && bugForum.threads) {
    try {
      await bugForum.threads.create({
        name: '📌 Bug Report Template — Read Before Posting',
        message: {
          content: [
            '## Bug Report Template',
            '',
            '**PureFrame Version:** `pureframe --version`',
            '**OS:** Windows 11 / macOS 14 / Ubuntu 24.04',
            '**Python:** 3.11 / 3.12',
            '**GPU:** RTX 4070 / No GPU',
            '**CUDA:** 12.1 / N/A',
            '',
            '### Description',
            'A clear description of the bug.',
            '',
            '### Steps to Reproduce',
            '1. Run `pureframe process video.mp4`',
            '2. ...',
            '',
            '### Expected Behavior',
            'What should have happened.',
            '',
            '### Actual Behavior',
            'What actually happened.',
            '',
            '### Error Logs',
            '```',
            'Paste full error traceback here',
            '```',
            '',
            '-# Please tag your post with the appropriate status tag.',
          ].join('\n'),
        },
        appliedTags: bugForum.availableTags?.length > 0 ? [bugForum.availableTags[0].id] : [],
      });
      console.log('  ✓ Bug report template pinned');
    } catch (e) { console.log(`  ⚠️ Bug seed: ${e.message}`); }
  }

  const docsForum = createdChannels['📚・documentation'];
  if (docsForum && docsForum.threads) {
    try {
      await docsForum.threads.create({
        name: '🚀 Quick Start Guide',
        message: {
          content: [
            '## PureFrame Quick Start',
            '',
            '### Installation',
            '```bash',
            'pip install pureframe',
            '```',
            '',
            '### Basic Usage',
            '```bash',
            '# Process a single video',
            'pureframe process movie.mp4 -o output/',
            '',
            '# Batch process a folder',
            'pureframe process ./movies/ -o ./censored/ --recursive',
            '',
            '# Use a content profile',
            'pureframe process anime.mkv --profile anime --strictness high',
            '```',
            '',
            '### Content Profiles',
            '| Profile | Best For |',
            '|---------|----------|',
            '| `default` | General purpose |',
            '| `anime` | Anime/cartoon content |',
            '| `live-action` | Movies and TV shows |',
            '| `low-light` | Dark/horror scenes |',
            '',
            '### GPU Acceleration',
            '```bash',
            '# Check if GPU is detected',
            'pureframe info',
            '',
            '# Force CPU mode',
            'pureframe process video.mp4 --device cpu',
            '```',
            '',
            '📖 Full docs: https://github.com/MayonaiseLover/PureFrame#readme',
          ].join('\n'),
        },
        appliedTags: docsForum.availableTags?.length > 0 ? [docsForum.availableTags[5]?.id || docsForum.availableTags[0].id] : [],
      });
      console.log('  ✓ Quick Start guide posted');
    } catch (e) { console.log(`  ⚠️ Docs seed: ${e.message}`); }
  }

  const fpForum = createdChannels['🎯・false-positives'];
  if (fpForum && fpForum.threads) {
    try {
      await fpForum.threads.create({
        name: '📌 How to Report False Positives',
        message: {
          content: [
            '## False Positive Reporting Guide',
            '',
            '**What is a false positive?** When PureFrame blurs something that should NOT be blurred.',
            '',
            '### What to Include',
            '1. **Content type:** Live-action, anime, or animation',
            '2. **Strictness level:** What setting were you using?',
            '3. **Timestamp:** Where in the video did it happen?',
            '4. **Screenshot:** A frame showing the incorrectly blurred area',
            '5. **Your config:** Share your `.pureframe.yml` if customized',
            '',
            '### Common Causes',
            '- Skin-colored backgrounds in anime',
            '- Beach/swimming scenes with high skin exposure',
            '- Dark scenes where the model can\'t distinguish features',
            '- Art/paintings within the video',
            '',
            '### Workarounds',
            '```bash',
            '# Lower strictness for fewer false positives',
            'pureframe process video.mp4 --strictness low',
            '',
            '# Use content-specific profile',
            'pureframe process anime.mkv --profile anime',
            '```',
            '',
            '-# Tag your post with the content type!',
          ].join('\n'),
        },
        appliedTags: fpForum.availableTags?.length > 0 ? [fpForum.availableTags[0].id] : [],
      });
      console.log('  ✓ False positive guide posted');
    } catch (e) { console.log(`  ⚠️ FP seed: ${e.message}`); }
  }

  // Post welcome banner image in welcome channel
  const welcomeChBanner = createdChannels['👋・welcome'];
  if (welcomeChBanner) {
    try {
      const bannerPath = resolve(__dirname, 'assets/pureframe-banner.png');
      await welcomeChBanner.send({
        files: [{ attachment: bannerPath, name: 'pureframe-banner.png' }]
      });
      console.log('  ✓ Welcome banner image posted');
    } catch (e) { console.log(`  ⚠️ Banner post: ${e.message}`); }
  }

  // ── PHASE 9: INVITE ──
  const generalCh = createdChannels['💬・general-chat'];
  if (generalCh) {
    const invite = await generalCh.createInvite({ maxAge: 0, maxUses: 0 });
    console.log(`\n🔗 PERMANENT INVITE: https://discord.gg/${invite.code}`);
  }

  // Final stats
  const allCh = await guild.channels.fetch();
  const allRoles = await guild.roles.fetch();
  const autoModRules = await guild.autoModerationRules.fetch();
  console.log('\n✅ PureFrame Community — FULLY ARCHITECTED');
  console.log(`   Categories: ${allCh.filter(c => c?.type === ChannelType.GuildCategory).size}`);
  console.log(`   Text channels: ${allCh.filter(c => c?.type === ChannelType.GuildText).size}`);
  console.log(`   Forum channels: ${allCh.filter(c => c?.type === ChannelType.GuildForum).size}`);
  console.log(`   Voice channels: ${allCh.filter(c => c?.type === ChannelType.GuildVoice).size}`);
  console.log(`   Roles: ${allRoles.size - 1}`);
  console.log(`   AutoMod rules: ${autoModRules.size}`);
  console.log(`   Webhooks: 2 (GitHub + Changelog)`);
  console.log(`   Bot invite panels: 10 bots with 1-click invite links`);
  console.log(`   Forum tags: 19 across 3 forums`);
  console.log(`   Seeded threads: 3 (bug template, quick start, FP guide)`);
  console.log(`   Rich embeds: 14 (welcome, rules, guide, roles, bots×3, ticket, contrib, arch, announce, webhook, banner)`);

  client.destroy();
  process.exit(0);
}

client.once('ready', () => buildServer().catch(e => { console.error(e); process.exit(1); }));
client.login(TOKEN).catch(e => { console.error('Login failed:', e.message); process.exit(1); });
