import React from "react";
import { BuildPlan, PlanChange } from "@guildforge/plan-schema";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Hash, Volume2, Shield, Settings, MessageSquare, AlertCircle, Trash2, PlusCircle, CheckCircle2 } from "lucide-react";

export type ExecutionState = Record<string, "pending" | "in-progress" | "completed" | "failed">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemVariants: any = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }
};

const getIconForChannelType = (type: string) => {
  switch (type) {
    case "voice": return <Volume2 className="w-4 h-4" />;
    case "forum": return <MessageSquare className="w-4 h-4" />;
    default: return <Hash className="w-4 h-4" />;
  }
};

export function PreviewTree({ plan, executionState = {}, changes = [] }: { plan: BuildPlan; executionState?: ExecutionState; changes?: PlanChange[] }) {
  if (!plan) return <div className="text-slate-400 p-4 font-medium animate-pulse">Waiting for AI to generate plan...</div>;

  const getStateProps = (key: string) => {
    const state = executionState[key] || "pending";
    if (state === "completed") return { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-4 h-4" /> };
    if (state === "failed") return { color: "text-rose-400", bg: "bg-rose-500/10", icon: <AlertCircle className="w-4 h-4" /> };
    if (state === "in-progress") return { color: "text-amber-400 animate-pulse", bg: "bg-amber-500/10", icon: <Settings className="w-4 h-4 animate-spin" /> };
    
    const isAdded = changes.some(c => (c.kind === "add_channel" && c.channel.key === key) || (c.kind === "add_role" && c.role.key === key) || (c.kind === "add_category" && c.category.key === key));
    const isDeleted = changes.some(c => (c.kind === "delete_channel" && c.channelKey === key) || (c.kind === "delete_role" && c.roleKey === key) || (c.kind === "delete_category" && c.categoryKey === key));
    const isModified = changes.some(c => (c.kind === "modify_channel" && c.channelKey === key) || (c.kind === "modify_role" && c.roleKey === key));
    
    if (isAdded) return { color: "text-emerald-400", bg: "bg-emerald-500/10 ring-1 ring-emerald-500/20", icon: <PlusCircle className="w-4 h-4" /> };
    if (isDeleted) return { color: "text-rose-500 line-through opacity-50", bg: "bg-rose-500/5", icon: <Trash2 className="w-4 h-4" /> };
    if (isModified) return { color: "text-amber-400", bg: "bg-amber-500/10 ring-1 ring-amber-500/20", icon: <Settings className="w-4 h-4" /> };

    return { color: "text-slate-400", bg: "bg-transparent", icon: null };
  };

  return (
    <div className="flex flex-col p-6 bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden font-sans">
      
      <motion.div layout initial="hidden" animate="visible" className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800/50">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg ring-1 ring-indigo-500/20">
          <Server className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-100 tracking-tight">GuildForge Architecture</h3>
          <p className="text-xs font-medium text-slate-500">Live Infrastructure Preview</p>
        </div>
      </motion.div>

      <div className="flex flex-col space-y-8">
        
        {/* ROLES SECTION */}
        <motion.div layout className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2 text-slate-300 px-1">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h4 className="font-semibold text-sm tracking-wide uppercase">Role Hierarchy</h4>
          </div>
          
          <div className="flex flex-wrap gap-2 pl-6">
            <AnimatePresence mode="popLayout">
              {plan.roles?.map((r) => {
                const s = getStateProps(r.key);
                return (
                  <motion.div key={r.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit"
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${s.bg} ${s.color}`}>
                    {s.icon && s.icon}
                    <span>@{r.name}</span>
                  </motion.div>
                );
              })}
              {changes.filter(c => c.kind === "add_role").map(c => {
                if (c.kind !== "add_role") return null;
                return (
                  <motion.div key={c.role.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit"
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                    <PlusCircle className="w-3 h-3" />
                    <span>@{c.role.name}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CATEGORIES & CHANNELS */}
        <motion.div layout className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 text-slate-300 px-1">
            <Hash className="w-4 h-4 text-indigo-400" />
            <h4 className="font-semibold text-sm tracking-wide uppercase">Channel Topology</h4>
          </div>
          
          <div className="pl-2 flex flex-col space-y-4">
            <AnimatePresence mode="popLayout">
              {plan.categories?.map((c) => {
                const catState = getStateProps(c.key);
                return (
                  <motion.div key={c.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col space-y-2 relative">
                    {/* Category Header */}
                    <div className="flex items-center space-x-2 px-2">
                      {catState.icon && <span className={catState.color}>{catState.icon}</span>}
                      <span className={`text-xs font-bold uppercase tracking-wider ${catState.color === "text-slate-400" ? "text-slate-300" : catState.color}`}>
                        {c.name}
                      </span>
                    </div>

                    {/* Channels List */}
                    <div className="pl-4 ml-2 flex flex-col space-y-1 border-l border-slate-800/60 relative">
                      <AnimatePresence mode="popLayout">
                        {c.channels?.map((ch) => {
                          const chState = getStateProps(ch.key);
                          return (
                            <motion.div key={ch.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit"
                              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chState.bg} ${chState.color === "text-slate-400" ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30" : chState.color}`}>
                              <span className="opacity-70">{getIconForChannelType(ch.type || "text")}</span>
                              <span>{ch.name.toLowerCase().replace(/\s+/g, '-')}</span>
                              {chState.icon && <span className="ml-auto opacity-70">{chState.icon}</span>}
                            </motion.div>
                          );
                        })}
                        {changes.filter(chg => chg.kind === "add_channel" && (chg.category === c.key || chg.category === c.name)).map(chg => {
                          if (chg.kind !== "add_channel") return null;
                          return (
                            <motion.div key={chg.channel.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit"
                              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                              <PlusCircle className="w-4 h-4 opacity-70" />
                              <span>{chg.channel.name.toLowerCase().replace(/\s+/g, '-')}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
              
              {changes.filter(c => c.kind === "add_category").map(c => {
                if (c.kind !== "add_category") return null;
                return (
                  <motion.div key={c.category.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col space-y-2 relative">
                    <div className="flex items-center space-x-2 px-2">
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {c.category.name}
                      </span>
                    </div>
                    <div className="pl-4 ml-2 flex flex-col space-y-1 border-l border-emerald-500/20 relative">
                      {c.category.channels?.map((ch) => (
                        <motion.div key={ch.key} layout variants={itemVariants} initial="hidden" animate="visible" exit="exit"
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/5 text-emerald-400">
                          <span className="opacity-70">{getIconForChannelType(ch.type || "text")}</span>
                          <span>{ch.name.toLowerCase().replace(/\s+/g, '-')}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
