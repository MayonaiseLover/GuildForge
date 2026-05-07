"use client";

import { useEffect, useState, use } from "react";
import { PreviewTree, ExecutionState } from "../../../../../components/PreviewTree";
import { ChatPanel, ChatMessage } from "../../../../../components/ChatPanel";
import { BotSetupPanel } from "../../../../../components/BotSetupPanel";
import { PlanChange, BuildPlan } from "@guildforge/plan-schema";

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

  useEffect(() => {
    fetch(`http://localhost:3001/conversations/${conversationId}`)
      .then(res => res.json())
      .then(data => {
         if (data?.buildPlans?.[0]) {
           setPlan(data.buildPlans[0].planJson);
           setPlanId(data.buildPlans[0].id);
         }
         if (data?.messages) {
           setMessages(data.messages);
         }
      })
      .catch(e => console.error(e));
  }, [conversationId]);

  const handleSendMessage = async (content: string) => {
    const tempId = Date.now().toString();
    setMessages(m => [...m, { id: tempId, role: "user", content }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
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

  const handleExecute = () => {
    if (!planId) {
      console.error("No plan ID available to execute");
      setError("No plan available to execute");
      return;
    }
    
    setIsExecuting(true);
    setLogs(prev => [...prev, "Starting deployment..."]);
    
    // Subscribe to SSE
    const eventSource = new EventSource(`http://localhost:3001/plans/${planId}/execute`); 
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "started") {
        setExecutionState(s => ({ ...s, [data.key]: "in-progress" }));
        setLogs(prev => [...prev, `[Started] ${data.step} - ${data.key}`]);
      } else if (data.type === "completed") {
        setExecutionState(s => ({ ...s, [data.key]: "completed" }));
        setLogs(prev => [...prev, `[Completed] ${data.step} - ${data.key}`]);
      } else if (data.type === "failed") {
        setExecutionState(s => ({ ...s, [data.key]: "failed" }));
        setLogs(prev => [...prev, `[Failed] ${data.step} - ${data.key} - ${data.error}`]);
      }
    };
    
    eventSource.onerror = (e) => {
      console.error("SSE Error:", e);
      eventSource.close();
      setIsExecuting(false);
      setLogs(prev => [...prev, "Deployment finished or connection lost."]);
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

        <div className="flex gap-4 items-center">
          {pendingChanges.length > 0 && (
            <button 
              onClick={applyChanges}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-all shadow-lg animate-pulse"
            >
              Apply {pendingChanges.length} Changes
            </button>
          )}

          <button 
            onClick={handleExecute}
            disabled={isExecuting || !plan || pendingChanges.length > 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-all disabled:opacity-50"
          >
            {isExecuting ? "Deploying..." : "Execute Build"}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col min-h-[200px]">
          <h3 className="font-bold text-lg mb-4 text-slate-300">Execution Logs</h3>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs text-slate-400">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
            {logs.length === 0 && <span className="italic">Awaiting deployment...</span>}
          </div>
        </div>

        {plan && <BotSetupPanel plan={plan} guildId={guildId} />}
      </div>
    </div>
  );
}
