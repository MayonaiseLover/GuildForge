import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
