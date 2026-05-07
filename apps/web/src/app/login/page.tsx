"use client";
import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/discord/login`;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <p className="text-slate-400">Redirecting to Discord...</p>
    </div>
  );
}
