import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LandingNav } from '@/components/LandingNav';
import { PRICING_PLANS } from '@/lib/pricing';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      <LandingNav />

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
          <span className="flex w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          GuildForge v1.0 is live
        </div>
        <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
          Describe your Discord server. <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Get it built in 60 seconds.</span>
        </h1>
        <p className="mb-12 text-xl text-slate-400 max-w-2xl leading-relaxed">
          The AI-powered Discord server architect. Skip the multi-hour setup process. We instantly provision categories, channels, roles, permissions, and bots based on your exact needs.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-[0_0_40px_rgba(79,70,229,0.3)]">
              Start Building Free
            </Button>
          </Link>
          <a href="https://github.com/MayonaiseLover/GuildForge" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300">
              ⭐ View on GitHub
            </Button>
          </a>
        </div>

        {/* Hero Screenshot */}
        <div className="w-full relative rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
          <Image src="/hero-dashboard.png" alt="GuildForge building a Discord server in real-time" width={1024} height={1024} className="w-full h-auto" priority />
        </div>
      </main>

      {/* Before / After */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">The Difference is Night and Day</h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">Stop spending hours clicking through menus. Let the AI architect it for you.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider mb-4 text-rose-400">before</div>
              <h3 className="text-xl font-bold text-white mb-2">Messy Organic Server</h3>
              <p className="text-slate-400 text-sm">Channels everywhere. Confusing roles. Zero verification.</p>
              <div className="mt-6 rounded-lg overflow-hidden border border-slate-800/50">
                <Image src="/before-messy.png" alt="A messy, unorganized Discord server" width={1024} height={1024} className="w-full h-auto" />
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-emerald-500/30">
              <div className="text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">after</div>
              <h3 className="text-xl font-bold text-white mb-2">GuildForge Architected</h3>
              <p className="text-slate-400 text-sm">Clean categories. Safe verification gates. Beautiful structure.</p>
              <div className="mt-6 rounded-lg overflow-hidden border border-emerald-500/20">
                <Image src="/after-clean.png" alt="A clean, professionally organized Discord server" width={1024} height={1024} className="w-full h-auto" />
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider mb-4 text-rose-400">before</div>
              <h3 className="text-xl font-bold text-white mb-2">Bot Hell</h3>
              <p className="text-slate-400 text-sm">6 different bots with overlapping commands flooding every channel.</p>
              <div className="mt-6 rounded-lg overflow-hidden border border-slate-800/50">
                <Image src="/before-bots.png" alt="A Discord server flooded with bot spam" width={1024} height={1024} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">Built for any Community</h2>
        <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">Throw any prompt at it. GuildForge understands what makes a Discord server actually good.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { prompt: "An NFT community with verification gates and holder-only alpha channels.", time: "38s", channels: 14 },
            { prompt: "A college study group with channels for Math, Physics, and CS.", time: "29s", channels: 11 },
            { prompt: "A competitive gaming server with locked team voice channels.", time: "42s", channels: 18 },
            { prompt: "A software dev community with GitHub webhooks and tech-stack roles.", time: "51s", channels: 22 },
            { prompt: "A neighborhood watch with strict verification and emergency pings.", time: "33s", channels: 9 },
            { prompt: "A 10K+ member content creator server with tiered VIP access.", time: "58s", channels: 26 },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 text-xs font-bold">{i + 1}</div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300">
                  &quot;{item.prompt}&quot;
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 rounded-xl border border-indigo-500/10">
                <span className="text-xs font-mono text-emerald-400">✓ Built in ~{item.time}</span>
                <span className="text-xs font-mono text-slate-500">{item.channels} channels</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Powered by the Model Context Protocol</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                GuildForge isn&apos;t just a web app. The core engine is a standalone MCP server that allows AI models like Claude Sonnet to interact directly with the Discord API as tool calls.
              </p>
              <div className="space-y-6">
                {[
                  { title: "Standalone MCP Package", desc: "Integrate directly into Claude Desktop, Cursor, or Cline." },
                  { title: "Reactive Preview Tree", desc: "Visualize the generated architecture before it touches Discord." },
                  { title: "Agentic Iteration", desc: "Chat with the AI to refine your server structure in real-time." },
                  { title: "Full Rollback Support", desc: "Every change is reversible. Snapshots protect your existing server." },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{feature.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 bg-slate-950 p-8 rounded-2xl border border-slate-800 font-mono text-sm text-indigo-300 shadow-2xl">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <p className="text-slate-500">$ npx @guildforge/mcp-discord</p>
              <p className="text-slate-500 mt-2">Starting Discord MCP server...</p>
              <p className="text-emerald-400 mt-2">✓ Registered tool: create_category</p>
              <p className="text-emerald-400">✓ Registered tool: create_text_channel</p>
              <p className="text-emerald-400">✓ Registered tool: create_voice_channel</p>
              <p className="text-emerald-400">✓ Registered tool: create_role</p>
              <p className="text-emerald-400">✓ Registered tool: update_permissions</p>
              <p className="text-emerald-400">✓ Registered tool: take_snapshot</p>
              <p className="text-indigo-400 mt-4">⚡ MCP server ready — waiting for agent...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-slate-400 text-center mb-16">No hidden fees. Cancel anytime.</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-slate-900 rounded-2xl p-8 ${
                plan.highlight
                  ? "border-2 border-indigo-500 relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/10"
                  : "border border-slate-800"
              }`}
            >
              {plan.badge && plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">/{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8 text-slate-300 text-sm">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-2">✓ {f}</li>
                ))}
                {plan.missing.slice(0, 1).map((f) => (
                  <li key={f} className="flex gap-2 text-slate-500">✗ {f}</li>
                ))}
              </ul>
              <Link href={plan.ctaHref}>
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className={`w-full ${
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Self-host CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-indigo-950/20 text-center border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Own your infrastructure</h2>
          <p className="text-xl text-slate-400 mb-10">GuildForge is open-source. Self-host it or plug our MCP server into your existing AI workflows.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://github.com/MayonaiseLover/GuildForge" target="_blank" rel="noreferrer">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">View on GitHub</Button>
            </a>
            <a href="https://www.npmjs.com/package/@guildforge/mcp-discord" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8">npm install</Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6 text-left">
          {[
            { q: "Can it configure roles and permissions safely?", a: "Yes. The AI generates explicit permission overrides per channel based on its semantic understanding of your prompt, preventing public access to private zones." },
            { q: "Is the MCP server really standalone?", a: "Absolutely. The package @guildforge/mcp-discord is fully decoupled from the web app. Plug it into Claude Desktop, Cursor, or Cline with a single npx command." },
            { q: "What if the AI gets something wrong?", a: "Every operation is logged with an undo entry. You can review the plan in the Preview Tree before deploying, and roll back any changes with a single click." },
            { q: "Can I use it on an existing server?", a: "Yes. GuildForge takes a snapshot of your server before making any changes. If you don't like the result, one click reverts everything to its original state." },
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h4 className="text-lg font-bold text-white mb-2">{item.q}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="GuildForge" width={24} height={24} className="rounded" />
            <span className="font-bold text-white">GuildForge</span>
            <span className="text-slate-500 text-sm ml-4">© 2026. MIT License.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="https://discord.gg/fY7vqVk2bd" className="hover:text-white transition-colors">Discord (Built by GF ⚡)</a>
            <a href="https://github.com/MayonaiseLover/GuildForge" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/@guildforge/mcp-discord" className="hover:text-white transition-colors">NPM</a>
            <a href="/docs/getting-started" className="hover:text-white transition-colors">Getting Started</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
