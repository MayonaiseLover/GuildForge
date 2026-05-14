// ── PARTICLE SYSTEM ──
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - .5) * .3; this.vy = (Math.random() - .5) * .3;
    this.r = Math.random() * 1.5 + .5; this.a = Math.random() * .4 + .1;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(139,92,246,${this.a})`; ctx.fill();
  }
}
for (let i = 0; i < 80; i++) particles.push(new Particle());
function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  // connect nearby
  for (let i = 0; i < particles.length; i++)
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(139,92,246,${.08 * (1 - dist / 120)})`;
        ctx.stroke();
      }
    }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ── TYPEWRITER ──
const prompts = [
  "A competitive gaming server with ranked voice channels and LFG",
  "An NFT community with holder verification and alpha leaks",
  "A dev team workspace with GitHub webhooks and sprint channels",
  "A college study group with Math, Physics, and CS forums",
  "An art community with portfolio showcase and commission system",
  "A music production server with DAW-specific channels and collabs"
];
const input = document.getElementById('prompt-input');
let promptIdx = 0, charIdx = 0, deleting = false, typeTimer;
function typewrite() {
  const current = prompts[promptIdx];
  if (!deleting) {
    input.setAttribute('placeholder', current.slice(0, charIdx++));
    if (charIdx > current.length) { deleting = true; typeTimer = setTimeout(typewrite, 2000); return; }
    typeTimer = setTimeout(typewrite, 40 + Math.random() * 30);
  } else {
    input.setAttribute('placeholder', current.slice(0, charIdx--));
    if (charIdx < 0) { deleting = false; promptIdx = (promptIdx + 1) % prompts.length; charIdx = 0; typeTimer = setTimeout(typewrite, 500); return; }
    typeTimer = setTimeout(typewrite, 20);
  }
}
typewrite();

// ── LIVE BUILDER SIMULATION ──
const sidebar = document.getElementById('discord-sidebar-content');
const chat = document.getElementById('discord-chat');
const terminal = document.getElementById('terminal-body');
const serverName = document.getElementById('server-name');

const scenarios = {
  gaming: {
    name: "⚔️ Ranked Arena",
    categories: [
      { name: "📋 INFO", channels: [
        { name: "welcome", icon: "#", type: "text" },
        { name: "rules", icon: "#", type: "text" },
        { name: "roles", icon: "#", type: "text" }
      ]},
      { name: "💬 GENERAL", channels: [
        { name: "general-chat", icon: "#", type: "text" },
        { name: "memes", icon: "#", type: "text" },
        { name: "clips", icon: "#", type: "text" }
      ]},
      { name: "🏆 RANKED", channels: [
        { name: "find-team", icon: "#", type: "text" },
        { name: "scrims", icon: "#", type: "text" },
        { name: "tournaments", icon: "#", type: "text" }
      ]},
      { name: "🔊 VOICE", channels: [
        { name: "Team Alpha", icon: "🔊", type: "voice" },
        { name: "Team Bravo", icon: "🔊", type: "voice" },
        { name: "Ranked Queue", icon: "🔊", type: "voice" },
        { name: "Coaching", icon: "🔊", type: "voice" }
      ]}
    ],
    roles: ["@Champion", "@Diamond", "@Platinum", "@Coach", "@Team Captain"],
    embeds: [
      { title: "🏆 Welcome to Ranked Arena!", desc: "Compete, climb, and dominate. Check #rules then grab your rank role!" },
      { title: "🛡️ AutoMod Active", desc: "Spam filter · Mention limits · Invite blocking — keeping it clean." }
    ]
  },
  dev: {
    name: "💻 DevForge HQ",
    categories: [
      { name: "📌 CORE", channels: [
        { name: "announcements", icon: "#", type: "text" },
        { name: "roadmap", icon: "#", type: "text" }
      ]},
      { name: "💻 ENGINEERING", channels: [
        { name: "frontend", icon: "#", type: "text" },
        { name: "backend", icon: "#", type: "text" },
        { name: "devops", icon: "#", type: "text" },
        { name: "code-review", icon: "#", type: "text" }
      ]},
      { name: "📝 FORUMS", channels: [
        { name: "bugs", icon: "📝", type: "text" },
        { name: "feature-requests", icon: "📝", type: "text" },
        { name: "architecture", icon: "📝", type: "text" }
      ]},
      { name: "🔊 HUDDLES", channels: [
        { name: "Standup", icon: "🔊", type: "voice" },
        { name: "Pair Programming", icon: "🔊", type: "voice" }
      ]}
    ],
    roles: ["@Lead", "@Senior", "@Mid", "@Junior", "@DevOps", "@QA"],
    embeds: [
      { title: "🚀 Sprint Dashboard", desc: "GitHub webhook active · PR reviews auto-posted · CI/CD alerts enabled." },
      { title: "📋 Onboarding", desc: "1. Read #roadmap → 2. Pick your stack role → 3. Introduce yourself!" }
    ]
  }
};

let building = false;
const buildBtn = document.getElementById('build-btn');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function addTerminalLine(text, cls = '') {
  const line = document.createElement('div');
  line.className = 'line';
  const ts = new Date().toISOString().split('T')[1].split('.')[0];
  line.innerHTML = `<span class="ts">[${ts}]</span> ${text}`;
  // remove old cursor
  terminal.querySelectorAll('.cursor').forEach(c => c.remove());
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function addCursor() {
  const c = document.createElement('span');
  c.className = 'cursor';
  terminal.appendChild(c);
}

function addChannel(catEl, ch, delay) {
  const div = document.createElement('div');
  div.className = `channel ${ch.type === 'voice' ? 'voice' : ''} new`;
  div.style.animationDelay = `${delay}ms`;
  div.innerHTML = `<span class="icon">${ch.icon}</span> ${ch.name}`;
  catEl.appendChild(div);
}

function addMessage(author, text, type = 'bot', embed = null) {
  const msg = document.createElement('div');
  msg.className = 'discord-msg';
  const initial = author[0].toUpperCase();
  let embedHtml = embed ? `<div class="embed"><strong>${embed.title}</strong><br/>${embed.desc}</div>` : '';
  msg.innerHTML = `
    <div class="avatar ${type}">${type === 'bot' ? '⚔' : '⚙'}</div>
    <div class="content">
      <div class="author ${type}">${author}</div>
      <div class="text">${text}</div>
      ${embedHtml}
    </div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function runBuild(scenario) {
  if (building) return;
  building = true;
  const s = scenarios[scenario];

  // Clear
  sidebar.innerHTML = '';
  chat.innerHTML = '';
  terminal.innerHTML = '';
  serverName.textContent = s.name;

  // Phase 1: Snapshot
  addTerminalLine('<span class="info">▶ PHASE 1:</span> Pre-flight snapshot');
  await sleep(400);
  addTerminalLine('<span class="tool">⚡ snapshot_guild</span> → <span class="ok">✓ captured 0ch / 0r</span>');
  addMessage('GuildForge', '📸 Snapshot saved. Starting build...', 'system');
  await sleep(600);

  // Phase 2: Roles
  addTerminalLine('<span class="info">▶ PHASE 2:</span> Creating roles');
  await sleep(300);
  for (const role of s.roles) {
    addTerminalLine(`<span class="tool">⚡ create_role</span> → ${role} <span class="ok">✓</span>`);
    addMessage('GuildForge', `Created role ${role}`, 'system');
    await sleep(250);
  }
  addTerminalLine(`<span class="tool">⚡ reorder_roles</span> → <span class="ok">✓ hierarchy set</span>`);
  await sleep(400);

  // Phase 3: Channels
  addTerminalLine('<span class="info">▶ PHASE 3:</span> Building channel structure');
  await sleep(300);
  let chCount = 0;
  for (const cat of s.categories) {
    addTerminalLine(`<span class="tool">⚡ create_category</span> → ${cat.name} <span class="ok">✓</span>`);
    const catDiv = document.createElement('div');
    const catLabel = document.createElement('div');
    catLabel.className = 'category';
    catLabel.textContent = cat.name;
    catDiv.appendChild(catLabel);
    sidebar.appendChild(catDiv);
    await sleep(300);

    for (const ch of cat.channels) {
      const toolName = ch.type === 'voice' ? 'create_voice_channel' : 'create_text_channel';
      addTerminalLine(`<span class="tool">⚡ ${toolName}</span> → #${ch.name} <span class="ok">✓</span>`);
      addChannel(catDiv, ch, 0);
      chCount++;
      await sleep(180);
    }

    addTerminalLine(`<span class="tool">⚡ update_permissions</span> → ${cat.name} <span class="ok">✓ ${s.roles.length} overwrites</span>`);
    await sleep(200);
  }

  // Phase 4: AutoMod
  addTerminalLine('<span class="info">▶ PHASE 4:</span> Security & AutoMod');
  await sleep(300);
  addTerminalLine('<span class="tool">⚡ configure_automod</span> → spam filter <span class="ok">✓</span>');
  await sleep(200);
  addTerminalLine('<span class="tool">⚡ configure_automod</span> → mention raid <span class="ok">✓</span>');
  await sleep(200);
  addTerminalLine('<span class="tool">⚡ configure_server</span> → verification: HIGH <span class="ok">✓</span>');
  await sleep(400);

  // Phase 5: Content
  addTerminalLine('<span class="info">▶ PHASE 5:</span> Deploying content & embeds');
  await sleep(300);
  for (const embed of s.embeds) {
    addTerminalLine(`<span class="tool">⚡ send_embed</span> → "${embed.title}" <span class="ok">✓</span>`);
    addMessage('GuildForge', '', 'bot', embed);
    await sleep(400);
  }

  // Phase 6: Bot Panel
  addTerminalLine('<span class="info">▶ PHASE 6:</span> Bot integration panel');
  await sleep(300);
  addTerminalLine('<span class="tool">⚡ post_bot_invite_panel</span> → 3 bots recommended <span class="ok">✓</span>');
  await sleep(300);

  // Done
  addTerminalLine('');
  addTerminalLine(`<span class="ok">═══════════════════════════════════════</span>`);
  addTerminalLine(`<span class="ok">✅ BUILD COMPLETE</span> — ${chCount} channels · ${s.roles.length} roles · 2 AutoMod rules`);
  addTerminalLine(`<span class="ok">═══════════════════════════════════════</span>`);
  addCursor();

  addMessage('GuildForge', `🎉 **Build complete!** ${chCount} channels, ${s.roles.length} roles, AutoMod configured, embeds deployed. Your server is ready!`, 'bot');

  building = false;
}

// Auto-start with gaming scenario after 2s
setTimeout(() => runBuild('gaming'), 2000);

// Button handlers
document.getElementById('build-btn').addEventListener('click', () => {
  const val = input.value.toLowerCase();
  if (val.includes('dev') || val.includes('code') || val.includes('github') || val.includes('engineer'))
    runBuild('dev');
  else
    runBuild('gaming');
});
input.addEventListener('keydown', e => { if (e.key === 'Enter') buildBtn.click(); });

// Scenario buttons
document.querySelectorAll('[data-scenario]').forEach(btn => {
  btn.addEventListener('click', () => runBuild(btn.dataset.scenario));
});

// ── SCROLL ANIMATIONS ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.arch-layer, .feature-card, .stat-card').forEach((el, i) => {
  el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
  el.style.transition = `opacity .6s ease-out ${i * .08}s, transform .6s ease-out ${i * .08}s`;
  observer.observe(el);
});
// Add visible class styles
const style = document.createElement('style');
style.textContent = `.feature-card.visible,.stat-card.visible,.arch-layer.visible{opacity:1!important;transform:translateY(0)!important}`;
document.head.appendChild(style);

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current + suffix;
    }, 30);
  });
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); counterObserver.disconnect(); } });
});
const statsSection = document.querySelector('.stats-grid');
if (statsSection) counterObserver.observe(statsSection);
