"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "/templates", label: "Templates" },
  { href: "https://github.com/guildforge/guildforge", label: "Self-Host", external: true },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between p-6 max-w-7xl mx-auto">
      <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
        <Image src="/logo.png" alt="GuildForge" width={32} height={32} className="rounded-lg" />
        GuildForge
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        {NAV_LINKS.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              {link.label}
            </a>
          ) : (
            <a key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </a>
          )
        )}
        <Link href="/login">
          <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-0 text-white">Log In</Button>
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Toggle navigation"
      >
        <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 z-50 md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-6 gap-4">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-300 hover:text-white transition-colors py-2 text-lg font-medium"
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-300 hover:text-white transition-colors py-2 text-lg font-medium"
                >
                  {link.label}
                </a>
              )
            )}
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">Log In with Discord</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
