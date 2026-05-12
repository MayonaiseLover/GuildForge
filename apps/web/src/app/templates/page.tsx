"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🌐" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "dev", label: "Dev / Tech", emoji: "💻" },
  { id: "community", label: "Community", emoji: "🏘️" },
  { id: "study", label: "Study", emoji: "📚" },
  { id: "nft", label: "NFT / Web3", emoji: "🖼️" },
  { id: "agency", label: "Agency", emoji: "🏢" },
  { id: "other", label: "Other", emoji: "✨" },
];

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "stars", label: "Most Starred" },
  { id: "popular", label: "Most Used" },
];

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  starCount: number;
  useCount: number;
  createdAt: string;
  author: { username: string; avatar: string | null; discordId: string };
}

function TemplateCard({ template, onUse }: { template: Template; onUse: (id: string) => void }) {
  const cat = CATEGORIES.find(c => c.id === template.category);
  return (
    <div className="group relative flex flex-col gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all duration-200">
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
          {cat?.emoji} {cat?.label || template.category}
        </span>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span title="Stars">⭐ {template.starCount}</span>
          <span title="Times used">📦 {template.useCount}</span>
        </div>
      </div>

      {/* Name & description */}
      <div className="flex-1">
        <h3 className="font-semibold text-white mb-1.5 leading-tight line-clamp-1">
          {template.name}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-slate-800 text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-500">
          by <span className="text-slate-300">{template.author.username}</span>
        </span>
        <button
          onClick={() => onUse(template.id)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 w-20 bg-slate-800 rounded-full" />
        <div className="h-4 w-16 bg-slate-800 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-2/3 bg-slate-800 rounded" />
      </div>
      <div className="h-8 w-28 bg-slate-800 rounded-xl ml-auto mt-auto" />
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("stars");
  const [offset, setOffset] = useState(0);
  const LIMIT = 24;

  // Wrap setters to reset offset when filters change
  const setSearchWithReset = (v: string) => { setSearch(v); setOffset(0); };
  const setCategoryWithReset = (v: string) => { setCategory(v); setOffset(0); };
  const setSortWithReset = (v: string) => { setSort(v); setOffset(0); };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      sort,
      limit: String(LIMIT),
      offset: String(offset)
    });
    if (category !== "all") params.set("category", category);
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`${API}/templates?${params}`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setTemplates(data.templates);
      setTotal(data.total);
    }
    setLoading(false);
  }, [category, sort, search, offset]);

  useEffect(() => {
    const t = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(t);
  }, [fetchTemplates]);

  const handleUse = async (templateId: string) => {
    const res = await fetch(`${API}/templates/${templateId}/use`, {
      method: "POST",
      credentials: "include"
    });
    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) return;
    const data = await res.json();
    // Store template plan in sessionStorage for the onboarding wizard to pick up
    sessionStorage.setItem("guildforge_template_plan", JSON.stringify(data.planJson));
    sessionStorage.setItem("guildforge_template_name", data.name);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Dashboard
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="font-bold text-white">Template Gallery</h1>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          + New Server
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Community Server Templates
          </h2>
          <p className="text-slate-400">
            Start with a battle-tested server structure. Customise it in the chat after applying.
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearchWithReset(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <select
            value={sort}
            onChange={e => setSortWithReset(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {SORTS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryWithReset(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-6">
            {total} template{total !== 1 ? "s" : ""}{category !== "all" ? ` in ${CATEGORIES.find(c => c.id === category)?.label}` : ""}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : templates.length === 0
            ? (
              <div className="col-span-full text-center py-20 text-slate-500">
                <div className="text-5xl mb-4">🔍</div>
                <p>No templates found. Try a different search or category.</p>
              </div>
            )
            : templates.map(t => (
              <TemplateCard key={t.id} template={t} onUse={handleUse} />
            ))
          }
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              ← Previous
            </button>
            <span className="flex items-center text-sm text-slate-500 px-3">
              Page {Math.floor(offset / LIMIT) + 1} of {Math.ceil(total / LIMIT)}
            </span>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
