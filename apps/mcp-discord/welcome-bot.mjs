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
      content: \`Welcome <@\${member.id}> to **\${guild.name}**! 🎉\`,
      files: [attachment],
      embeds: [{
        color: 0xe94560,
        description: [
          '**Getting Started:**',
          '📜 Read the rules',
          '🎭 Pick your roles',
          '💬 Say hi in general chat!',
        ].join('\n'),
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