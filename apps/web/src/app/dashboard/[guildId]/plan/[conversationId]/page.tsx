"use client";

import { useEffect, useState, use } from "react";
import { PreviewTree, ExecutionState } from "../../../../../components/PreviewTree";
import { ChatPanel, ChatMessage } from "../../../../../components/ChatPanel";
import { BotSetupPanel } from "../../../../../components/BotSetupPanel";
import { PlanChange, BuildPlan } from "@guildforge/plan-schema";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORIES = ["gaming","dev","community","study","nft","agency","other"] as const;

function SaveAsTemplateModal({ plan, onClose }: { plan: BuildPlan; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("community");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) { setErr("Name and description are required."); return; }
    setSaving(true); setErr(null);
    const res = await fetch(`${API}/templates`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        category,
        tags: tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
        planJson: plan,
        isPublic: true
      })
    });
    setSaving(false);
    if (res.status === 403) { setErr("Template publishing requires a Pro or Studio plan. Upgrade at /pricing."); return; }
    if (!res.ok) { setErr("Failed to save template."); return; }
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Save as Template</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {saved ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="text-emerald-400 font-semibold">Template published!</p>
            <p className="text-slate-400 text-sm">It&apos;s now live in the template gallery.</p>
            <div className="flex gap-3 justify-center">
              <a href="/templates" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">View Gallery</a>
              <button onClick={onClose} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors">Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <input
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Template name (e.g. Gaming Community Starter)"
                value={name} onChange={e => setName(e.target.value)}
              />
              <textarea
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                rows={3}
                placeholder="Describe what this template is for..."
                value={description} onChange={e => setDescription(e.target.value)}
              />
              <select
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                value={category} onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Tags, comma-separated (e.g. fps, esports, lfg)"
                value={tags} onChange={e => setTags(e.target.value)}
              />
            </div>
            {err && <p className="text-rose-400 text-sm">{err}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? "Publishing..." : "Publish Template"}
              </button>
              <button onClick={onClose} className="px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-400 text-sm rounded-xl">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlanExecutionPage({ params }: { params: Promise<{ guildId: string, conversationId: string }> }) {
  const { conversationId, guildId } = use(params);
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [executionState, setExecutionState] = useState<ExecutionState>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PlanChange[]>([]);
  const [nextPlan, setNextPlan] = useState<BuildPlan | null>(null);

  const [planId, setPlanId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    fetch(`${API}/conversations/${conversationId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data?.buildPlans?.[0]) {
          setPlan(data.buildPlans[0].planJson);
          setPlanId(data.buildPlans[0].id);
        }
        if (data?.messages) {
          setMessages(data.messages);
        }
      })
      .catch(e => setError(e.message));
  }, [conversationId]);

  const handleSendMessage = async (content: string) => {
    const tempId = Date.now().toString();
    setMessages(m => [...m, { id: tempId, role: "user", content }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`${API}/conversations/${conversationId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error(`Chat error: ${res.status}`);
      const data = await res.json();
      
      setMessages(m => [...m, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        toolCalls: data.diff?.changes || []
      }]);

      if (data.diff?.changes && data.diff.changes.length > 0) {
        setPendingChanges(data.diff.changes);
        setNextPlan(data.plan);
      } else if (data.plan) {
        setPlan(data.plan.planJson || data.plan);
        if (data.plan.id) setPlanId(data.plan.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const applyChanges = () => {
    if (nextPlan) {
      const np = nextPlan as Record<string, unknown>;
      setPlan((np.planJson as BuildPlan) || nextPlan);
      if (np.id) setPlanId(np.id as string);
      setPendingChanges([]);
      setNextPlan(null);
    }
  };

  const handleExecute = async () => {
    if (!planId) {
      setError("No plan available to execute");
      return;
    }

    setIsExecuting(true);
    setLogs(prev => [...prev, "Authorizing deployment..."]);

    // Pre-flight: send a HEAD-equivalent to catch 429/403 before opening SSE
    try {
      const check = await fetch(`${API}/plans/${planId}/execute`, {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "text/event-stream" }
      });

      if (!check.ok) {
        const body = await check.json().catch(() => ({}));
        if (check.status === 429) {
          setError(`${body.message || "Build limit reached"} → Upgrade at /pricing`);
        } else if (check.status === 403) {
          setError("Access denied. This plan doesn't belong to your account.");
        } else {
          setError(body.error || `Server error (${check.status})`);
        }
        setIsExecuting(false);
        return;
      }
    } catch {
      // Network error — let SSE handle it
    }

    setLogs(prev => [...prev, "Starting deployment..."]);

    // Subscribe to SSE
    // For cross-origin SSE with cookies, the API must set Access-Control-Allow-Credentials
    const eventSource = new EventSource(`${API}/plans/${planId}/execute`, { withCredentials: true });
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "started") {
        setLogs(prev => [...prev, `[INIT] Starting deployment of ${data.totalOps} operations...`]);
      } else if (data.type === "phase") {
        setLogs(prev => [...prev, `[PHASE] ${data.name.toUpperCase()} - ${data.description}`]);
      } else if (data.type === "operation") {
        // Find the specific key this operation relates to for the preview tree. This is an approximation since we don't send keys back, but we can update state globally.
        setExecutionState(s => ({ ...s, global: data.status })); 
        
        let prefix = "⏳";
        if (data.status === "ok") prefix = "✅";
        if (data.status === "failed") prefix = "❌";
        if (data.status === "skipped") prefix = "⏭️";
        
        // We only add new log entries for non-pending or if it's a phase
        if (data.status !== "pending") {
           setLogs(prev => [...prev, `${prefix} [${data.tool}] ${data.summary}`]);
        }
      } else if (data.type === "completed") {
        setLogs(prev => [...prev, `[DONE] ${data.summary}`]);
        eventSource.close();
        setIsExecuting(false);
      } else if (data.type === "failed") {
        setLogs(prev => [...prev, `[FATAL] Deployment failed: ${data.error}`]);
        eventSource.close();
        setIsExecuting(false);
      }
    };
    
    eventSource.onerror = (e) => {
      console.error("SSE Error:", e);
      eventSource.close();
      setIsExecuting(false);
      setLogs(prev => [...prev, "[SYS] Connection closed."]);
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex h-screen overflow-hidden">
      {/* Left Pane: Chat */}
      <div className="w-1/3 flex flex-col border-r border-slate-800">
        <ChatPanel 
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
        />
      </div>

      {/* Right Pane: Preview Tree */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deploy Guild Plan</h1>
          <p className="text-slate-400">Review your server architecture before deploying. Live updates will stream as the AI provisions the resources on Discord.</p>
        </div>
        
        {plan ? <PreviewTree plan={plan} executionState={executionState} changes={pendingChanges} /> : <div>Loading plan...</div>}

        <div className="flex gap-3 items-center flex-wrap">
          {pendingChanges.length > 0 && (
            <button 
              onClick={applyChanges}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white transition-all shadow-lg shadow-emerald-500/20"
            >
              Apply {pendingChanges.length} Changes
            </button>
          )}

          <button 
            onClick={handleExecute}
            disabled={isExecuting || !plan || pendingChanges.length > 0}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
          >
            {isExecuting ? "Deploying Architecture..." : "Execute Build"}
          </button>

          {plan && !isExecuting && (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
            >
              📋 Save as Template
            </button>
          )}

          {error && <div className="text-rose-500 text-sm">{error}</div>}
        </div>

        {showTemplateModal && plan && (
          <SaveAsTemplateModal plan={plan} onClose={() => setShowTemplateModal(false)} />
        )}

        {/* Execution Theater */}
        <div className="bg-black/80 backdrop-blur-md border border-slate-800 rounded-xl p-0 flex flex-col min-h-[300px] overflow-hidden shadow-2xl relative ring-1 ring-white/5">
          <div className="flex items-center px-4 py-2 bg-slate-900/80 border-b border-slate-800">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="mx-auto text-xs font-mono text-slate-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Execution Theater
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs md:text-sm">
            {logs.map((log, idx) => {
              const isPhase = log.startsWith("[PHASE]");
              const isDone = log.startsWith("[DONE]");
              const isError = log.startsWith("[FATAL]") || log.startsWith("❌");
              
              let colorClass = "text-slate-400";
              if (isPhase) colorClass = "text-indigo-400 font-bold mt-2";
              else if (isDone) colorClass = "text-emerald-400 font-bold mt-4 border-t border-emerald-900/50 pt-2";
              else if (isError) colorClass = "text-rose-400";
              else if (log.startsWith("✅")) colorClass = "text-emerald-300/80";
              else if (log.startsWith("⏭️")) colorClass = "text-slate-500";

              return (
                <div key={idx} className={`${colorClass} flex items-start space-x-2 slide-in-bottom`}>
                   {!isPhase && !isDone && !isError && <span className="text-slate-600 select-none">❯</span>}
                   <span>{log}</span>
                </div>
              );
            })}
            {logs.length === 0 && <div className="text-slate-600 italic">Awaiting deployment authorization...</div>}
          </div>
          {isExecuting && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
              <div className="h-full bg-indigo-500 animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
            </div>
          )}
        </div>

        {plan && <BotSetupPanel plan={plan} guildId={guildId} />}
      </div>
    </div>
  );
}
