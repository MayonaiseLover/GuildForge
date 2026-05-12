"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Settings, Crown, Shield, Eye, ArrowLeft, Loader2, Copy, Check, Trash2, UserPlus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  plan: string;
  memberCount: number;
  guildCount: number;
  myRole: string;
  owner: { id: string; username: string; avatar: string | null };
}

const API = process.env.NEXT_PUBLIC_API_URL;

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-amber-400" />,
  admin: <Shield className="w-4 h-4 text-indigo-400" />,
  member: <Users className="w-4 h-4 text-slate-400" />,
  viewer: <Eye className="w-4 h-4 text-slate-500" />,
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTeams = () => {
    fetch(`${API}/teams`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTeams(data); })
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/teams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (res.ok) {
        setShowCreate(false);
        setName("");
        setSlug("");
        fetchTeams();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async (teamId: string, email: string) => {
    const res = await fetch(`${API}/teams/${teamId}/invite`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.inviteUrl) setInviteUrl(data.inviteUrl);
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    await fetch(`${API}/teams/${teamId}`, { method: "DELETE", credentials: "include" });
    fetchTeams();
  };

  const copyInvite = () => {
    if (inviteUrl) navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Team Workspaces</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition"
          >
            <Plus className="w-4 h-4" /> New Team
          </button>
        </div>

        {/* Invite URL Toast */}
        {inviteUrl && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-400 font-medium">Invite link generated!</p>
              <p className="text-xs text-slate-400 font-mono mt-1 truncate max-w-md">{inviteUrl}</p>
            </div>
            <button onClick={copyInvite} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm transition">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreate && (
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Create a New Team</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Team Name</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }}
                  placeholder="My Awesome Team"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-awesome-team"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={creating || !name || !slug} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition disabled:opacity-50">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Team"}
                </button>
                <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team List */}
        {teams.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-16 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400 mb-2">No teams yet</p>
            <p className="text-sm text-slate-500">Create a team to collaborate with others on Discord server builds.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-lg">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{team.name}</h3>
                      <p className="text-sm text-slate-400 font-mono">/{team.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      {ROLE_ICONS[team.myRole]} <span className="capitalize">{team.myRole}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      <span className="text-white font-medium">{team.memberCount}</span> members ·{" "}
                      <span className="text-white font-medium">{team.guildCount}</span> servers
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      {["owner", "admin"].includes(team.myRole) && (
                        <>
                          <button
                            onClick={() => { const email = prompt("Enter email to invite:"); if (email) handleInvite(team.id, email); }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition"
                            title="Invite member"
                          >
                            <UserPlus className="w-4 h-4 text-indigo-400" />
                          </button>
                          <Link href={`/teams/${team.id}`} className="p-2 hover:bg-slate-700 rounded-lg transition">
                            <Settings className="w-4 h-4 text-slate-400" />
                          </Link>
                        </>
                      )}
                      {team.myRole === "owner" && (
                        <button onClick={() => handleDelete(team.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
