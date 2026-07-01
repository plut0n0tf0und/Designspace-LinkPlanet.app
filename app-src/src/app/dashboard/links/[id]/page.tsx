"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Link as LinkIcon } from "lucide-react";

export default function LinkDetails() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0e0818] text-zinc-100">
      {/* Navbar */}
      <header className="border-b border-[#2b1f47]/50 bg-[#120c22]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-[#834dfb]">
            <LinkIcon size={14} />
            <span>LinkPlanet</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#834dfb]/20 border border-[#834dfb]/30 flex items-center justify-center">
            <LinkIcon size={24} className="text-[#834dfb]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Link Analytics</h1>
          <p className="text-zinc-400 text-sm max-w-xs">
            Detailed analytics for link <span className="text-[#834dfb] font-mono">{id}</span> — coming soon.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-5 py-2.5 bg-[#834dfb] hover:bg-[#743deb] text-white text-sm font-semibold rounded-[8px] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
