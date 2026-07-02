"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Link as LinkIcon, Sparkles, Copy, Check, ShieldAlert, Loader2 } from "lucide-react";

export default function CreateLink() {
  const router = useRouter();
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError("");
    
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: longUrl.trim(),
          slug: customSlug.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create link");
        return;
      }

      router.push(`/dashboard/links/${data.link.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18102b] text-[#f5f3ff]">
      
      {/* Top Navbar */}
      <header className="border-b border-[#2b1f47]/50 bg-[#120b22] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2 font-bold text-sm text-[#834dfb]">
            <LinkIcon size={14} />
            <span>LinkPlanet</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Create new short URL
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Shorten long links and track the number of visits they get.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-[8px] p-4 text-sm text-red-400 mb-6">
            <ShieldAlert size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container Card - conforming to 20px card radius, #120c22 bg, border-[#2b1f47]/50 */}
        <div className="bg-[#120c22] border border-[#2b1f47]/50 rounded-[20px] p-5 shadow-xl mb-8">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            {/* Long Destination URL */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: "var(--font-syne)" }}>
                Destination URL
              </label>
              <input
                type="url"
                required
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/your-very-long-url-here"
                className="w-full p-3 bg-[#0e0818] border border-[#2b1f47]/50 rounded-[8px] outline-none text-white focus:border-[#834dfb] transition-all text-sm font-sans"
              />
              <span className="text-sm text-zinc-500">
                The long destination page where users will be redirected.
              </span>
            </div>

            {/* Custom Slug */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500" style={{ fontFamily: "var(--font-syne)" }}>
                Custom Endpoint (optional)
              </label>
              <div className="flex items-center">
                <span className="p-3 bg-[#0e0818] border border-r-0 border-[#2b1f47]/50 rounded-l-[8px] text-zinc-500 text-sm font-mono whitespace-nowrap">
                  /
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-custom-endpoint"
                  className="w-full p-3 bg-[#0e0818] border border-[#2b1f47]/50 rounded-r-[8px] outline-none text-[#834dfb] focus:border-[#834dfb] transition-all text-sm font-mono"
                />
              </div>
              <span className="text-sm text-zinc-500">
                Custom text for the short URL slug (e.g. /promo). Leave blank to auto-generate.
              </span>
            </div>

            {/* CTA Button - conforming to 8px button radius, bg-[#834dfb] */}
            <button
              type="submit"
              disabled={isGenerating || !longUrl.trim()}
              className="mt-2 py-3 px-4 bg-[#834dfb] hover:bg-[#743deb] text-white rounded-[8px] text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Short URL
                </>
              )}
            </button>

          </form>
        </div>

      </main>

    </div>
  );
}
