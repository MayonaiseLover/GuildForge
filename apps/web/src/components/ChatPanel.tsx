"use client";

import React, { useState, useRef, useEffect } from "react";
import { PlanChange } from "@guildforge/plan-schema";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: PlanChange[];
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatPanel({ messages, onSendMessage, isLoading }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput("");
    await onSendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`px-4 py-2 rounded-lg max-w-[85%] ${m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"}`}>
              {m.content || (m.toolCalls && m.toolCalls.length > 0 ? <i className="text-sm opacity-70">Applied plan changes...</i> : null)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 animate-pulse">
              GuildForge is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask GuildForge to tweak your server..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-500">{input.length} chars</span>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
