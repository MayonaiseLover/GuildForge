"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Bell, BellOff, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Loader2, Plus, Shield, Server, TrendingUp, Users } from "lucide-react";

interface HealthData {
  current: {
    id: string;
    status: string;
    memberCount: number | null;
    channelCount: number | null;
    roleCount: number | null;
    boostLevel: number | null;
    onlineCount: number | null;
    issues: Array<{ severity: string; code: string; message: string }> | null;
    checkedAt: string;
  } | null;
  history: Array<{
    status: string;
    memberCount: number | null;
    channelCount: number | null;
    checkedAt: string;
  }>;
}

interface AlertData {
  id: string;
  severity: string;
  title: string;
  message: string;
  acknowledged: boolean;
  createdAt: string;
  rule: { name: string; condition: string };
}

interface AlertRuleData {
  id: string;
  name: string;
  condition: string;
  guildId: string | null;
  isActive: boolean;
  lastTriggered: string | null;
  _count: { alerts: number };
}

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  HEALTHY: { color: "text-emerald-400", icon: <CheckCircle2 className="w-5 h-5" />, label: "Healthy" },
  DEGRADED: { color: "text-amber-400", icon: <AlertTriangle className="w-5 h-5" />, label: "Degraded" },
  CRITICAL: { color: "text-red-400", icon: <XCircle className="w-5 h-5" />, label: "Critical" },
  UNKNOWN: { color: "text-slate-400", icon: <Activity className="w-5 h-5" />, label: "Unknown" },
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function MonitoringPage() {
  const [tab, setTab] = useState<"overview" | "alerts" | "rules">("overview");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [rules, setRules] = useState<AlertRuleData[]>([]);
  const [unackCount, setUnackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // For demo purposes, use a placeholder guildId
  const guildId = "demo-guild";

  useEffect(() => {
    Promise.all([
      fetch(`${API}/monitoring/health/${guildId}`, { credentials: "include" }).then((r) => r.json()).catch(() => null),
      fetch(`${API}/monitoring/alerts?limit=20`, { credentials: "include" }).then((r) => r.json()).catch(() => ({ alerts: [], unacknowledgedCount: 0 })),
      fetch(`${API}/monitoring/rules`, { credentials: "include" }).then((r) => r.json()).catch(() => []),
    ]).then(([h, a, r]) => {
      if (h) setHealth(h);
      if (a?.alerts) { setAlerts(a.alerts); setUnackCount(a.unacknowledgedCount); }
      if (Array.isArray(r)) setRules(r);
      setLoading(false);
    });
  }, []);

  const triggerCheck = async () => {
    setChecking(true);
    try {
      await fetch(`${API}/monitoring/health/${guildId}/check`, {
        method: "POST",
        credentials: "include",
      });
      // Refresh health data
      const h = await fetch(`${API}/monitoring/health/${guildId}`, { credentials: "include" }).then((r) => r.json());
      setHealth(h);
    } finally {
      setChecking(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    await fetch(`${API}/monitoring/alerts/${alertId}/acknowledge`, {
      method: "POST",
      credentials: "include",
    });
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
    setUnackCount((prev) => Math.max(0, prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[health?.current?.status ?? "UNKNOWN"];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Server Monitoring</h1>
          </div>
          <button
            onClick={triggerCheck}
            disabled={checking}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition disabled:opacity-50"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            Run Health Check
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1 mb-8 w-fit">
          {[
            { id: "overview" as const, label: "Overview", icon: <Server className="w-4 h-4" /> },
            { id: "alerts" as const, label: `Alerts ${unackCount > 0 ? `(${unackCount})` : ""}`, icon: <Bell className="w-4 h-4" /> },
            { id: "rules" as const, label: "Alert Rules", icon: <Shield className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${tab === t.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`${statusConfig.color}`}>{statusConfig.icon}</div>
                <div>
                  <h2 className={`text-2xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
                  <p className="text-sm text-slate-400">
                    Last checked: {health?.current?.checkedAt ? new Date(health.current.checkedAt).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Members", value: health?.current?.memberCount ?? "—", icon: <Users className="w-4 h-4" /> },
                  { label: "Channels", value: health?.current?.channelCount ?? "—", icon: <Server className="w-4 h-4" /> },
                  { label: "Roles", value: health?.current?.roleCount ?? "—", icon: <Shield className="w-4 h-4" /> },
                  { label: "Online", value: health?.current?.onlineCount ?? "—", icon: <Activity className="w-4 h-4" /> },
                  { label: "Boost Level", value: health?.current?.boostLevel ?? "—", icon: <TrendingUp className="w-4 h-4" /> },
                ].map((metric) => (
                  <div key={metric.label} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      {metric.icon}
                      <span className="text-xs">{metric.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            {health?.current?.issues && (health.current.issues as Array<{severity: string; code: string; message: string}>).length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Active Issues</h3>
                <div className="space-y-3">
                  {(health.current.issues as Array<{severity: string; code: string; message: string}>).map((issue, i) => (
                    <div key={i} className={`border rounded-lg p-4 ${SEVERITY_COLORS[issue.severity] ?? SEVERITY_COLORS.info}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs opacity-70">{issue.code}</span>
                        <span className="text-xs capitalize opacity-70">• {issue.severity}</span>
                      </div>
                      <p className="text-sm">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Sparkline */}
            {health?.history && health.history.length > 1 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Member Trend (Last 24 checks)</h3>
                <div className="flex items-end gap-1 h-24">
                  {health.history.map((h, i) => {
                    const max = Math.max(...health.history.map((x) => x.memberCount ?? 0));
                    const pct = max > 0 ? ((h.memberCount ?? 0) / max) * 100 : 0;
                    const color = h.status === "HEALTHY" ? "bg-emerald-500" : h.status === "DEGRADED" ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${color} opacity-70 hover:opacity-100 transition`}
                        style={{ height: `${Math.max(pct, 4)}%` }}
                        title={`${h.memberCount ?? 0} members — ${new Date(h.checkedAt).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {tab === "alerts" && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-16 text-center">
                <BellOff className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-lg text-slate-400">No alerts</p>
                <p className="text-sm text-slate-500">Alerts will appear here when monitoring rules are triggered.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-xl p-5 ${SEVERITY_COLORS[alert.severity] ?? SEVERITY_COLORS.info} ${alert.acknowledged ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <span className="text-xs opacity-60 capitalize">• {alert.severity}</span>
                      </div>
                      <p className="text-sm opacity-80 mb-2">{alert.message}</p>
                      <p className="text-xs opacity-50">
                        Rule: {alert.rule.name} · {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition flex-shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rules Tab */}
        {tab === "rules" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition"
              >
                <Plus className="w-4 h-4" /> New Rule
              </Link>
            </div>

            {rules.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-16 text-center">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-lg text-slate-400">No alert rules configured</p>
                <p className="text-sm text-slate-500">Create rules to automatically monitor your servers for issues.</p>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${rule.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-slate-400">
                        Condition: <span className="font-mono text-xs">{rule.condition}</span> ·{" "}
                        {rule._count.alerts} alerts triggered
                        {rule.lastTriggered && ` · Last: ${new Date(rule.lastTriggered).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className={`px-2 py-0.5 rounded text-xs ${rule.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-500"}`}>
                      {rule.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
