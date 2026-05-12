"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Summary {
  totalBuilds: number;
  successfulBuilds: number;
  successRate: number;
  totalGuilds: number;
  totalSnapshots: number;
  totalMessages: number;
  recentEvents: Array<{ id: string; eventType: string; createdAt: string; metadata: Record<string, unknown>; guildId?: string }>;
  buildsByMonth: Array<{ month: string; count: number }>;
}

const EVENT_META: Record<string, { icon: string; label: string; color: string }> = {
  DEPLOY: { icon: "🚀", label: "Server deployed", color: "text-emerald-400" },
  DEPLOY_FAILED: { icon: "💥", label: "Deploy failed", color: "text-rose-400" },
  ROLLBACK: { icon: "↩️", label: "Rolled back", color: "text-amber-400" },
  SNAPSHOT: { icon: "📸", label: "Snapshot taken", color: "text-blue-400" },
  PLAN_GENERATED: { icon: "🤖", label: "Plan generated", color: "text-violet-400" },
  TEMPLATE_USED: { icon: "📋", label: "Template used", color: "text-indigo-400" },
  CHAT_MESSAGE: { icon: "💬", label: "Chat message", color: "text-slate-400" },
};

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: string }) {
  return (
    <div className="flex flex-col gap-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function ActivityBar({ month, count, max }: { month: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4;
  const label = month.slice(5); // "MM" from "YYYY-MM"
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-xs text-slate-400 font-medium">{count}</span>
      <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
        <div
          className="w-full rounded-t-md bg-indigo-500/60 hover:bg-indigo-400/80 transition-all duration-300"
          style={{ height: `${pct}%` }}
          title={`${month}: ${count} build${count !== 1 ? "s" : ""}`}
        />
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/analytics/summary`, { credentials: "include" })
      .then(res => {
        if (res.status === 401) { router.push("/login"); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setSummary(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const maxMonthCount = summary
    ? Math.max(...summary.buildsByMonth.map(m => m.count), 1)
    : 1;

  // Fill missing months with 0 so we always show 6 bars
  const chartData = (() => {
    if (!summary) return [];
    const now = new Date();
    const months: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = summary.buildsByMonth.find(m => m.month === key);
      months.push({ month: key, count: found?.count ?? 0 });
    }
    return months;
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Dashboard
        </Link>
        <span className="text-slate-700">/</span>
        <h1 className="font-bold text-white">Analytics</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !summary ? (
          <div className="text-center py-20 text-slate-500">Failed to load analytics.</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon="🚀" label="Total Builds" value={summary.totalBuilds} sub="All time" />
              <StatCard icon="✅" label="Success Rate" value={`${summary.successRate}%`} sub={`${summary.successfulBuilds} completed`} />
              <StatCard icon="🏰" label="Guilds Managed" value={summary.totalGuilds} sub="Active guilds" />
              <StatCard icon="📸" label="Snapshots" value={summary.totalSnapshots} sub="Saved states" />
              <StatCard icon="💬" label="AI Messages" value={summary.totalMessages} sub="Chat interactions" />
              <StatCard
                icon="📅"
                label="This Month"
                value={chartData[chartData.length - 1]?.count ?? 0}
                sub="Builds in current month"
              />
            </div>

            {/* Build activity chart */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <h2 className="text-sm font-semibold text-slate-300 mb-5 uppercase tracking-wider">
                Build Activity — Last 6 Months
              </h2>
              {chartData.every(d => d.count === 0) ? (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No builds yet. Start building to see activity here.
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  {chartData.map(d => (
                    <ActivityBar key={d.month} month={d.month} count={d.count} max={maxMonthCount} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity feed */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <h2 className="text-sm font-semibold text-slate-300 mb-5 uppercase tracking-wider">
                Recent Activity
              </h2>
              {summary.recentEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">No activity yet.</div>
              ) : (
                <div className="space-y-1">
                  {summary.recentEvents.map(event => {
                    const meta = EVENT_META[event.eventType] ?? { icon: "•", label: event.eventType, color: "text-slate-400" };
                    const date = new Date(event.createdAt);
                    const relative = formatRelative(date);
                    return (
                      <div key={event.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                        <span className="text-lg w-7 flex-shrink-0">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                          {(event.metadata as Record<string, string>)?.templateName && (
                            <span className="text-slate-500 text-sm"> — {(event.metadata as Record<string, string>).templateName}</span>
                          )}
                          {(event.metadata as Record<string, number>)?.operations && (
                            <span className="text-slate-500 text-sm"> — {(event.metadata as Record<string, number>).operations} ops</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-600 flex-shrink-0">{relative}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
