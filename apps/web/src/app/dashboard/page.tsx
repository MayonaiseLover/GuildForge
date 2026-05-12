"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  botPresent: boolean;
  inviteUrlIfMissing: string | null;
}

interface User {
  discordId: string;
  username: string;
  avatar: string | null;
  plan: string;
}

function GuildCard({ guild, onSelect }: { guild: Guild; onSelect: (id: string) => void }) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
    : null;

  return (
    <div className="group relative flex flex-col gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-200 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 ring-2 ring-slate-700 group-hover:ring-indigo-500/40 transition-all">
          {iconUrl ? (
            <Image src={iconUrl} alt={guild.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
              {guild.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{guild.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${guild.botPresent ? "bg-emerald-400" : "bg-slate-600"}`} />
            <span className={`text-xs ${guild.botPresent ? "text-emerald-400" : "text-slate-500"}`}>
              {guild.botPresent ? "Bot connected" : "Bot not added"}
            </span>
          </div>
        </div>
      </div>

      {guild.botPresent ? (
        <button
          onClick={() => onSelect(guild.id)}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-md shadow-indigo-500/20"
        >
          Open Forge →
        </button>
      ) : (
        <a
          href={guild.inviteUrlIfMissing || "#"}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-colors text-sm text-center block"
        >
          Add GuildForge Bot →
        </a>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/auth/me`, { credentials: "include" }).then(r => r.json()),
      fetch(`${API}/guilds/`, { credentials: "include" }).then(r => {
        if (!r.ok) throw new Error("Failed to load guilds");
        return r.json();
      }),
    ])
      .then(([meData, guildsData]) => {
        setUser(meData.user);
        setGuilds(guildsData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectGuild = async (guildId: string) => {
    setConnecting(guildId);
    try {
      const res = await fetch(`${API}/guilds/${guildId}/connect`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to connect guild");
      router.push(`/dashboard/${guildId}/onboarding`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect guild");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">⚔️ GuildForge</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <nav className="hidden sm:flex items-center gap-4 text-sm text-slate-400">
                <Link href="/templates" className="hover:text-white transition-colors">Templates</Link>
                <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              </nav>
              <span className="text-sm text-slate-400 hidden sm:block">
                {user.username}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                <div className={`w-1.5 h-1.5 rounded-full ${user.plan === "free" ? "bg-slate-400" : "bg-indigo-400"}`} />
                <span className="text-xs text-slate-400 capitalize">{user.plan}</span>
              </div>
              <button
                onClick={() => fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).then(() => router.push("/"))}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
            <p className="text-slate-400">
              Select a server where you have <span className="text-slate-300 font-medium">Manage Server</span> permission to start building.
            </p>
          </div>
          <Link
            href="/templates"
            className="flex-shrink-0 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            📋 Browse Templates
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-950/50 border border-red-800/50 rounded-2xl text-red-300 text-sm">
            <strong>Error:</strong> {error}
            {error.includes("Unauthorized") && (
              <span> — <a href="/login" className="text-red-400 underline">Log in again</a></span>
            )}
          </div>
        )}

        {!loading && !error && guilds.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">🏰</div>
            <p className="text-lg font-medium text-slate-400">No servers found</p>
            <p className="text-sm mt-1">You need <span className="text-slate-300">Manage Server</span> permission on a Discord server to use GuildForge.</p>
          </div>
        )}

        {!loading && !error && guilds.length > 0 && (
          <>
            {guilds.some(g => g.botPresent) && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Ready to Build</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guilds.filter(g => g.botPresent).map(guild => (
                    <div key={guild.id} className={connecting === guild.id ? "opacity-60 pointer-events-none" : ""}>
                      <GuildCard guild={guild} onSelect={handleSelectGuild} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guilds.some(g => !g.botPresent) && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Add Bot First</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guilds.filter(g => !g.botPresent).map(guild => (
                    <GuildCard key={guild.id} guild={guild} onSelect={handleSelectGuild} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
