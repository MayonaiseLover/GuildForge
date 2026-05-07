import React from "react";
import { BuildPlan, PlanChange } from "@guildforge/plan-schema";

export type ExecutionState = Record<string, "pending" | "in-progress" | "completed" | "failed">;

export function PreviewTree({ plan, executionState, changes = [] }: { plan: BuildPlan; executionState: ExecutionState; changes?: PlanChange[] }) {
  if (!plan) return <div>No plan provided</div>;

  const getStateColor = (key: string) => {
    const state = executionState[key] || "pending";
    if (state === "completed") return "text-green-400";
    if (state === "failed") return "text-red-400";
    if (state === "in-progress") return "text-yellow-400 animate-pulse";
    
    const isAdded = changes.some(c => (c.kind === "add_channel" && c.channel.key === key) || (c.kind === "add_role" && c.role.key === key) || (c.kind === "add_category" && c.category.key === key));
    const isDeleted = changes.some(c => (c.kind === "delete_channel" && c.channelKey === key) || (c.kind === "delete_role" && c.roleKey === key) || (c.kind === "delete_category" && c.categoryKey === key));
    const isModified = changes.some(c => (c.kind === "modify_channel" && c.channelKey === key) || (c.kind === "modify_role" && c.roleKey === key));
    
    if (isAdded) return "text-green-500 bg-green-500/10 rounded px-1";
    if (isDeleted) return "text-red-500 line-through bg-red-500/10 rounded px-1";
    if (isModified) return "text-yellow-500 bg-yellow-500/10 rounded px-1";

    return "text-slate-400";
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className={getStateColor("serverSettings")}>●</span>
        <h3 className="font-bold text-lg text-white">Server Settings</h3>
      </div>

      <div className="pl-4 border-l border-slate-800 flex flex-col space-y-2">
        <h4 className="font-semibold text-slate-300">Roles</h4>
        {plan.roles?.map((r) => (
          <div key={r.key} className="flex items-center space-x-2">
             <span className={getStateColor(r.key)}>●</span>
             <span className={`text-sm ${getStateColor(r.key).includes("line-through") ? "text-slate-500" : "text-slate-400"}`}>@{r.name}</span>
          </div>
        ))}
        {changes.filter(c => c.kind === "add_role").map(c => {
          if (c.kind !== "add_role") return null;
          return (
            <div key={c.role.key} className="flex items-center space-x-2">
              <span className={getStateColor(c.role.key)}>●</span>
              <span className="text-sm text-green-400 bg-green-500/10 rounded px-1">@{c.role.name}</span>
            </div>
          );
        })}
      </div>

      <div className="pl-4 border-l border-slate-800 flex flex-col space-y-4">
        <h4 className="font-semibold text-slate-300">Categories & Channels</h4>
        {plan.categories?.map((c) => (
          <div key={c.key} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
               <span className={getStateColor(c.key)}>●</span>
               <span className={`text-sm font-semibold uppercase ${getStateColor(c.key).includes("line-through") ? "text-slate-500" : "text-white"}`}>{c.name}</span>
            </div>
            <div className="pl-4 flex flex-col space-y-1">
              {c.channels?.map((ch) => (
                <div key={ch.key} className="flex items-center space-x-2">
                   <span className={getStateColor(ch.key)}>●</span>
                   <span className={`text-sm ${getStateColor(ch.key).includes("line-through") ? "text-slate-500" : "text-slate-400"}`}># {ch.name} ({ch.type})</span>
                </div>
              ))}
              {changes.filter(chg => chg.kind === "add_channel" && (chg.category === c.key || chg.category === c.name)).map(chg => {
                if (chg.kind !== "add_channel") return null;
                return (
                  <div key={chg.channel.key} className="flex items-center space-x-2">
                    <span className={getStateColor(chg.channel.key)}>●</span>
                    <span className="text-sm text-green-400 bg-green-500/10 rounded px-1"># {chg.channel.name} ({chg.channel.type})</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {changes.filter(c => c.kind === "add_category").map(c => {
          if (c.kind !== "add_category") return null;
          return (
            <div key={c.category.key} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className={getStateColor(c.category.key)}>●</span>
                <span className="text-sm font-semibold text-green-400 bg-green-500/10 rounded px-1 uppercase">{c.category.name}</span>
              </div>
              <div className="pl-4 flex flex-col space-y-1">
                {c.category.channels?.map((ch) => (
                  <div key={ch.key} className="flex items-center space-x-2">
                    <span className={getStateColor(ch.key)}>●</span>
                    <span className="text-sm text-green-400 bg-green-500/10 rounded px-1"># {ch.name} ({ch.type})</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
