import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">GF</div>
          GuildForge
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="https://github.com/guildforge/guildforge" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Self-Host</a>
          <Link href="/login">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-0 text-white">Log In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
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
          <a href="#demo">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300">
              Try Live Demo (Sandbox)
            </Button>
          </a>
        </div>

        {/* 10-second Screen Recording Placeholder */}
        <div className="w-full relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-indigo-400 border-b-8 border-b-transparent ml-1"></div>
              </div>
              <p className="text-slate-400 font-medium">Watch 10-second Speedrun</p>
            </div>
          </div>
        </div>
      </main>

      {/* Before / After Section */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">The Difference is Night and Day</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Messy Organic Server", desc: "Channels everywhere. Confusing roles. Zero verification.", type: "before" },
              { title: "GuildForge Architected", desc: "Clean categories. Safe verification gates. Beautiful structure.", type: "after" },
              { title: "Bot Hell", desc: "6 different bots with overlapping commands.", type: "before" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${item.type === 'before' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {item.type}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
                <div className="mt-6 aspect-[4/3] bg-slate-950 rounded-lg border border-slate-800/50 flex items-center justify-center text-slate-600">
                  Visual representation
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">Built for any Community</h2>
        <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">Throw any prompt at it. GuildForge understands the intricate details of what makes a Discord server actually good.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "An NFT community with verification gates and holder-only alpha channels.",
            "A college study group with specific text channels for Math, Physics, and CS.",
            "A competitive gaming server with locked team voice channels.",
            "A professional software dev community with GitHub webhooks and tech-stack roles.",
            "A local neighborhood watch with strict verification and emergency pings.",
            "A 10,000+ member content creator server with tiered VIP access."
          ].map((prompt, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0"></div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300">
                  &quot;{prompt}&quot;
                </div>
              </div>
              <div className="h-24 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-xl border border-indigo-500/10 flex items-end p-4">
                <span className="text-xs font-mono text-indigo-400">→ Built in ~42s</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works / Architecture */}
      <section id="how-it-works" className="py-24 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Powered by the Model Context Protocol</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                GuildForge isn&apos;t just a web app. The core engine is built as a standalone MCP server (`@guildforge/mcp-discord`) that allows advanced AI models like Claude 4.5 Sonnet to interact directly with the Discord API as tool calls.
              </p>
              <div className="space-y-6">
                {[
                  { title: "Standalone MCP Package", desc: "Integrate directly into Claude Desktop or Cursor." },
                  { title: "Reactive Preview Tree", desc: "See the generated architecture before it touches Discord." },
                  { title: "Agentic Iteration", desc: "Chat with the AI to tweak the plan (&apos;make the gaming role mentionable&apos;)." }
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
              <p>➜ npx @guildforge/mcp-discord</p>
              <p className="text-slate-500 mt-2">Starting Discord MCP server...</p>
              <p className="text-emerald-400 mt-2">✓ Registered tool: create_category</p>
              <p className="text-emerald-400">✓ Registered tool: create_text_channel</p>
              <p className="text-emerald-400">✓ Registered tool: update_permissions</p>
              <p className="text-slate-500 mt-4">Waiting for LLM agent instructions...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 text-slate-300 text-sm">
              <li className="flex gap-2">✓ 3 server builds per month</li>
              <li className="flex gap-2">✓ Standard LLM routing</li>
              <li className="flex gap-2 text-slate-500">✗ Priority execution queue</li>
            </ul>
            <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Get Started</Button>
          </div>
          {/* Pro */}
          <div className="bg-slate-900 rounded-2xl p-8 border-2 border-indigo-500 relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$9</span>
              <span className="text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 text-slate-300 text-sm">
              <li className="flex gap-2">✓ Unlimited server builds</li>
              <li className="flex gap-2">✓ Claude 4.5 Sonnet routing</li>
              <li className="flex gap-2">✓ Advanced bot auto-config</li>
            </ul>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Upgrade to Pro</Button>
          </div>
          {/* Studio */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Studio</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 text-slate-300 text-sm">
              <li className="flex gap-2">✓ Everything in Pro</li>
              <li className="flex gap-2">✓ API Access</li>
              <li className="flex gap-2">✓ Whitelabel bot deployment</li>
            </ul>
            <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Contact Sales</Button>
          </div>
        </div>
      </section>

      {/* CTA / Self-host */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-indigo-950/20 text-center border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Own your infrastructure</h2>
          <p className="text-xl text-slate-400 mb-10">GuildForge is open-source. Run the monorepo yourself, or integrate our MCP server into your existing agentic workflows.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://github.com/guildforge/guildforge" target="_blank" rel="noreferrer">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">
                View on GitHub
              </Button>
            </a>
            <a href="https://www.npmjs.com/package/@guildforge/mcp-discord" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8">
                NPM Package
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6 text-left">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h4 className="text-lg font-bold text-white mb-2">Can it configure roles and permissions safely?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Yes. The AI generates explicit permission overrides per channel based on its semantic understanding of your prompt, preventing public access to private zones.</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <h4 className="text-lg font-bold text-white mb-2">Is the MCP server really standalone?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Absolutely. The package `@guildforge/mcp-discord` is fully decoupled from the web application and can be plugged into Cursor, Cline, or Claude Desktop instantly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-bold text-white">GF</div>
            <span className="font-bold text-white">GuildForge</span>
            <span className="text-slate-500 text-sm ml-4">© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="https://discord.gg/placeholder" className="hover:text-white transition-colors">Join our Discord (Built by GF)</a>
            <a href="https://github.com/guildforge/guildforge" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://twitter.com/guildforge" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
