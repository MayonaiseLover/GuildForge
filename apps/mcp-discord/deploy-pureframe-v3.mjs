/**
 * PureFrame Discord Server Update Script v3
 * Uses GuildForge's enhanced MCP tools to upgrade the existing PureFrame server
 * with the new enterprise features: better forums, embeds, AutoMod, branding tools.
 * 
 * Usage: DISCORD_BOT_TOKEN=xxx TARGET_GUILD_ID=xxx node deploy-pureframe-v3.mjs
 */

import { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, SortOrderType, ForumLayoutType } from 'discord.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.TARGET_GUILD_ID;
if (!TOKEN) { console.error('No DISCORD_BOT_TOKEN'); process.exit(1); }
if (!GUILD_ID) { console.error('No TARGET_GUILD_ID'); process.exit(1); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ── Helpers ──
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function safeAction(label, fn) {
  try {
    const result = await fn();
    console.log(`  ✓ ${label}`);
    return result;
  } catch (e) {
    console.log(`  ⚠️ ${label}: ${e.message}`);
    return null;
  }
}

async function updateServer() {
  console.log(`✅ Bot online as ${client.user.tag}`);
  const guild = await client.guilds.fetch(GUILD_ID);
  console.log(`🎯 Target: ${guild.name} (${guild.id})\n`);

  // Fetch all existing channels
  const channels = await guild.channels.fetch();
  const allChannels = new Map();
  for (const [id, ch] of channels) {
    if (ch) allChannels.set(ch.name.toLowerCase(), ch);
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 1: Upgrade Forums with Full Enterprise Config
  // ═══════════════════════════════════════════════════════
  console.log('📋 Phase 1: Upgrading Forums...');

  // Find existing forums and upgrade them
  for (const [, ch] of allChannels) {
    if (ch.type === ChannelType.GuildForum) {
      console.log(`  📌 Upgrading forum: #${ch.name}`);

      // Determine tags based on forum purpose
      let tags = [];
      if (ch.name.includes('bug') || ch.name.includes('issue')) {
        tags = [
          { name: '🐛 Bug', emoji: null },
          { name: '🔄 In Progress', emoji: null },
          { name: '✅ Resolved', emoji: null },
          { name: '❌ Closed', emoji: null },
          { name: '🔴 Critical', emoji: null },
          { name: '🟡 Medium', emoji: null },
          { name: '🟢 Low', emoji: null },
          { name: '❓ Needs Info', emoji: null },
        ];
      } else if (ch.name.includes('feature') || ch.name.includes('idea')) {
        tags = [
          { name: '💡 Idea', emoji: null },
          { name: '🗳️ Under Review', emoji: null },
          { name: '✅ Accepted', emoji: null },
          { name: '🚀 In Development', emoji: null },
          { name: '❌ Declined', emoji: null },
          { name: '📋 Planned', emoji: null },
        ];
      } else if (ch.name.includes('doc') || ch.name.includes('guide')) {
        tags = [
          { name: '📖 Guide', emoji: null },
          { name: '🔧 Tutorial', emoji: null },
          { name: '📚 Reference', emoji: null },
          { name: '🎓 Advanced', emoji: null },
          { name: '🆕 Getting Started', emoji: null },
        ];
      } else if (ch.name.includes('showcase') || ch.name.includes('show')) {
        tags = [
          { name: '🖼️ Screenshot', emoji: null },
          { name: '🎬 Video', emoji: null },
          { name: '🔧 Tool', emoji: null },
          { name: '🎨 Design', emoji: null },
          { name: '⭐ Featured', emoji: null },
        ];
      }

      if (tags.length > 0) {
        await safeAction(`Tags for #${ch.name}`, () =>
          ch.edit({
            availableTags: tags,
            defaultSortOrder: ch.name.includes('bug') ? SortOrderType.CreationDate : SortOrderType.LatestActivity,
            defaultForumLayout: ch.name.includes('showcase') ? ForumLayoutType.Gallery : ForumLayoutType.List,
          })
        );
      }

      // Seed posts if forum is empty
      const threads = await ch.threads.fetchActive();
      if (threads.threads.size === 0) {
        console.log(`    📝 Seeding #${ch.name}...`);

        if (ch.name.includes('bug') || ch.name.includes('issue')) {
          await safeAction('Bug Template Post', async () => {
            const thread = await ch.threads.create({
              name: '📋 Bug Report Template',
              message: {
                content: [
                  '## Bug Report Template',
                  '',
                  '**Use this format when reporting bugs:**',
                  '',
                  '### Environment',
                  '- OS: (e.g., Windows 11, macOS 14, Ubuntu 24.04)',
                  '- Python version: ',
                  '- PureFrame version: ',
                  '',
                  '### Description',
                  'A clear description of the bug.',
                  '',
                  '### Steps to Reproduce',
                  '1. ',
                  '2. ',
                  '3. ',
                  '',
                  '### Expected Behavior',
                  'What should have happened.',
                  '',
                  '### Actual Behavior',
                  'What actually happened.',
                  '',
                  '### Logs/Screenshots',
                  'Paste relevant logs or attach screenshots.',
                  '',
                  '---',
                  '*This template helps us investigate and fix issues faster.*',
                ].join('\n')
              }
            });
            await thread.pin();
          });
        }

        if (ch.name.includes('feature') || ch.name.includes('idea')) {
          await safeAction('Feature Request Template', async () => {
            const thread = await ch.threads.create({
              name: '📋 How to Submit Feature Requests',
              message: {
                content: [
                  '## Feature Request Guidelines',
                  '',
                  '**We love hearing your ideas!** Use this format:',
                  '',
                  '### The Problem',
                  'What problem does this feature solve?',
                  '',
                  '### Proposed Solution',
                  'How do you envision it working?',
                  '',
                  '### Alternatives',
                  'Any workarounds you\'ve tried?',
                  '',
                  '### Use Case',
                  'Who benefits from this? How common is the need?',
                  '',
                  '---',
                  '*React with 👍 to upvote features you want!*',
                ].join('\n')
              }
            });
            await thread.pin();
          });
        }

        if (ch.name.includes('doc') || ch.name.includes('guide')) {
          await safeAction('Quick Start Guide', async () => {
            await ch.threads.create({
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
                  'pureframe process video.mp4 --output clean.mp4',
                  '',
                  '# Batch process a folder',
                  'pureframe batch ./videos --output ./clean',
                  '',
                  '# Resume an interrupted job',
                  'pureframe resume ./clean',
                  '```',
                  '',
                  '### Configuration',
                  '```yaml',
                  '# pureframe.yaml',
                  'confidence_threshold: 0.85',
                  'blur_strength: 25',
                  'mode: smart_segment',
                  '```',
                  '',
                  '### Need Help?',
                  'Check the other guides or ask in #support!',
                ].join('\n')
              }
            });
          });
        }
      }
      await sleep(1000);
    }
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 2: Enhanced AutoMod
  // ═══════════════════════════════════════════════════════
  console.log('\n🛡️ Phase 2: Upgrading AutoMod...');

  // Check existing rules
  const existingRules = await guild.autoModerationRules.fetch();
  const ruleNames = new Set([...existingRules.values()].map(r => r.name));

  if (!ruleNames.has('Anti-Scam & Phishing')) {
    await safeAction('Anti-Scam Filter', () =>
      guild.autoModerationRules.create({
        name: 'Anti-Scam & Phishing',
        eventType: 1,
        triggerType: 1, // Keyword
        triggerMetadata: {
          keywordFilter: [
            'free nitro', 'steam gift', 'click here to claim', 'airdrop link',
            'verify your wallet', 'free discord nitro', 'csgo skins free',
            'discord-gift.com', 'discordgift.site', '@everyone http',
            'earn money fast', 'crypto doubler', 'send me btc',
          ],
          regexPatterns: [
            'discord\\.gift\\/[a-zA-Z0-9]+',
            'free.*nitro.*https?:',
            'https?:\\/\\/dis[ck]ord[\\.-]',
          ],
        },
        actions: [
          { type: 1 }, // Block message
        ],
        enabled: true,
      })
    );
  }

  if (!ruleNames.has('Content Safety')) {
    await safeAction('Content Safety Presets', () =>
      guild.autoModerationRules.create({
        name: 'Content Safety',
        eventType: 1,
        triggerType: 4, // KeywordPreset
        triggerMetadata: {
          presets: [1, 2, 3], // Profanity, SexualContent, Slurs
          allowList: ['damn', 'hell', 'crap'], // Mild words allowed in dev context
        },
        actions: [
          { type: 1 }, // Block message
        ],
        enabled: true,
      })
    );
  }

  if (!ruleNames.has('Anti-Mention Spam')) {
    await safeAction('Mention Spam Protection', () =>
      guild.autoModerationRules.create({
        name: 'Anti-Mention Spam',
        eventType: 1,
        triggerType: 5, // MentionSpam
        triggerMetadata: {
          mentionTotalLimit: 5,
        },
        actions: [
          { type: 1 }, // Block
          { type: 3, metadata: { durationSeconds: 600 } }, // 10min timeout
        ],
        enabled: true,
      })
    );
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 3: Enhanced Rich Embeds
  // ═══════════════════════════════════════════════════════
  console.log('\n📨 Phase 3: Deploying Enterprise Embeds...');

  // Find key channels
  const findChannel = (name) => {
    for (const [, ch] of allChannels) {
      if (ch.name.toLowerCase().includes(name.toLowerCase()) && ch.type === ChannelType.GuildText) return ch;
    }
    return null;
  };

  // Server Guide embed
  const guideChannel = findChannel('server-guide') || findChannel('guide') || findChannel('welcome');
  if (guideChannel) {
    await safeAction('Server Guide Embed', () =>
      guideChannel.send({
        embeds: [{
          title: '🗺️ Server Navigation Guide',
          description: [
            '## Welcome to PureFrame Community!',
            '',
            '### 📍 Start Here',
            '> 📜 **#rules** — Community guidelines',
            '> 🎭 **#roles** — Pick your interests',
            '> 👋 **#introductions** — Say hello!',
            '',
            '### 💬 Community',
            '> 💬 **#general** — Main discussion',
            '> ❓ **#support** — Get help',
            '> 💡 **#ideas** — Share feature requests',
            '',
            '### 🔧 Development',
            '> 🐛 **#bug-reports** — Report issues',
            '> 📋 **#changelog** — Latest updates',
            '> 🏗️ **#contributing** — Help build PureFrame',
            '',
            '### 🎤 Voice',
            '> Drop into any voice channel to chat!',
          ].join('\n'),
          color: 0x5865F2,
          footer: { text: 'PureFrame Community • Built with GuildForge' },
        }],
      })
    );
  }

  // Contributing guide
  const contribChannel = findChannel('contributing') || findChannel('contrib');
  if (contribChannel) {
    await safeAction('Contributing Guide', () =>
      contribChannel.send({
        embeds: [{
          title: '🤝 Contributing to PureFrame',
          description: [
            '## How to Contribute',
            '',
            '### Getting Started',
            '```bash',
            '# Fork & clone',
            'git clone https://github.com/YOUR_USER/PureFrame.git',
            'cd PureFrame',
            '',
            '# Create virtual environment',
            'python -m venv venv && source venv/bin/activate',
            '',
            '# Install in dev mode',
            'pip install -e ".[dev]"',
            '',
            '# Run tests',
            'pytest --cov',
            '```',
            '',
            '### Contribution Flow',
            '1. 🔍 Find an issue or create one',
            '2. 🌿 Branch from `main`: `git checkout -b feat/my-feature`',
            '3. 🧪 Write tests first (TDD)',
            '4. 💻 Implement your changes',
            '5. ✅ Ensure `pytest --cov` passes',
            '6. 📝 Open a PR with clear description',
            '',
            '### Areas We Need Help',
            '• 🎯 Detection model improvements',
            '• 🎨 UI/UX for desktop app',
            '• 📚 Documentation and tutorials',
            '• 🌍 Internationalization',
            '• 🧪 Test coverage expansion',
          ].join('\n'),
          color: 0x2ecc71,
          footer: { text: 'Every contribution matters!' },
        }],
      })
    );
  }

  // Architecture overview
  const archChannel = findChannel('architecture') || findChannel('arch');
  if (archChannel) {
    await safeAction('Architecture Overview', () =>
      archChannel.send({
        embeds: [{
          title: '🏗️ PureFrame Architecture',
          description: [
            '## System Overview',
            '```',
            '┌──────────────┐     ┌───────────────┐',
            '│   CLI/GUI    │────▶│  Orchestrator  │',
            '│  Interface   │     │   Pipeline     │',
            '└──────────────┘     └───────┬───────┘',
            '                             │',
            '         ┌──────────┬────────┼────────┐',
            '         ▼          ▼        ▼        ▼',
            '    ┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐',
            '    │Detector │ │Render│ │Batch │ │Check │',
            '    │ Engine  │ │Engine│ │Queue │ │point │',
            '    └─────────┘ └──────┘ └──────┘ └──────┘',
            '```',
            '',
            '### Key Components',
            '**Detector** — ML-based content analysis with confidence scoring',
            '**Renderer** — Smart segment re-encoding for minimal quality loss',
            '**Batch Queue** — Concurrent folder processing with priority',
            '**Checkpoint** — SQLite-backed crash recovery and job resumption',
            '',
            '### Tech Stack',
            '`Python 3.10+` · `PyTorch` · `FFmpeg` · `SQLite` · `Click CLI`',
          ].join('\n'),
          color: 0x9b59b6,
          footer: { text: 'See ARCHITECTURE.md for full details' },
        }],
      })
    );
  }

  // Announcement / launch embed
  const announceChannel = findChannel('announcement') || findChannel('news');
  if (announceChannel) {
    await safeAction('Community Launch Announcement', () =>
      announceChannel.send({
        embeds: [{
          title: '🚀 Welcome to PureFrame Community!',
          description: [
            '## We\'re Live!',
            '',
            'This server is the official home of **PureFrame** — the intelligent video content censorship tool built for privacy, safety, and professional content management.',
            '',
            '### What\'s Here',
            '🐛 **Bug Reports** — Help us squash bugs with tagged forum posts',
            '💡 **Feature Requests** — Vote on what gets built next',
            '📚 **Documentation** — Guides, tutorials, and API reference',
            '🤝 **Contributing** — Join the development effort',
            '🎤 **Voice Channels** — Live coding sessions and discussions',
            '',
            '### Get Started',
            '1. Read the **#rules**',
            '2. Pick your **roles** in #roles',
            '3. Introduce yourself in **#introductions**',
            '4. Star us on [GitHub](https://github.com/MayonaiseLover/PureFrame)! ⭐',
            '',
            '*This server was automatically deployed by [GuildForge](https://github.com/guildforge/guildforge) — the AI Discord architect.*',
          ].join('\n'),
          color: 0xe74c3c,
          footer: { text: '🏗️ Built with GuildForge • Enterprise Discord Architecture' },
        }],
      })
    );
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 4: "Built with GuildForge" watermark
  // ═══════════════════════════════════════════════════════
  console.log('\n⚔️ Phase 4: GuildForge Branding...');

  // Find or create a bot-config/meta channel
  let metaChannel = findChannel('bot-config') || findChannel('server-info');
  if (!metaChannel) {
    // Find the staff category
    let staffCat = null;
    for (const [, ch] of allChannels) {
      if (ch.type === ChannelType.GuildCategory && ch.name.toLowerCase().includes('staff')) {
        staffCat = ch;
        break;
      }
    }

    metaChannel = await safeAction('Create #server-info', () =>
      guild.channels.create({
        name: '📊・server-info',
        type: ChannelType.GuildText,
        parent: staffCat?.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        ],
      })
    );
  }

  if (metaChannel) {
    await safeAction('GuildForge Attribution', () =>
      metaChannel.send({
        embeds: [{
          title: '⚔️ Powered by GuildForge',
          description: [
            'This server\'s architecture was designed and deployed by **GuildForge** — the AI-powered Discord server architect.',
            '',
            '### Deployment Stats',
            `• **Server:** ${guild.name}`,
            `• **Channels:** ${allChannels.size}`,
            `• **Deployed:** ${new Date().toISOString().split('T')[0]}`,
            `• **Version:** GuildForge v3.0`,
            '',
            '### Features Deployed',
            '✅ Role hierarchy with granular permissions',
            '✅ Forum channels with tags & templates',
            '✅ AutoMod (scam filter + content safety + mention spam)',
            '✅ Rich embeds (welcome, guides, architecture)',
            '✅ Bot ecosystem panel with 1-click invites',
            '✅ Webhook integrations',
            '',
            '[Get GuildForge](https://github.com/guildforge/guildforge) • MIT Licensed',
          ].join('\n'),
          color: 0xf39c12,
          footer: { text: 'GuildForge • Describe your server. Get it built in 60 seconds.' },
        }],
      })
    );
  }

  // ═══════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('  ✅ PureFrame Discord Update Complete!');
  console.log('═'.repeat(60));
  console.log(`  📋 Forums upgraded with enterprise tags & seed posts`);
  console.log(`  🛡️ AutoMod rules enforced (scam, content, mentions)`);
  console.log(`  📨 Rich embeds deployed (guide, contributing, architecture, launch)`);
  console.log(`  ⚔️ GuildForge attribution embedded`);
  console.log('═'.repeat(60));
}

client.once('ready', () => updateServer().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }));
client.login(TOKEN);
