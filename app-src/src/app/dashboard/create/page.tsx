"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Link as LinkIcon, Sparkles, Copy, Check, ShieldAlert, Loader2 } from "lucide-react";

export default function CreateLink() {
  const router = useRouter();
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.origin);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError("");
    setGeneratedLink("");
    
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

      setGeneratedLink(`${host}/${data.link.slug}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-haiti text-zinc-900 dark:text-chalk transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 dark:border-[#2b1f47]/50 bg-white dark:bg-[#120b22] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-[#f5f3ff] font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-400 dark:text-electric/80">
            <LinkIcon size={14} />
            <span>LinkPlanet</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create new short URL</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Shorten long links and track the number of visits they get.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 mb-6">
            <ShieldAlert size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white dark:bg-[#120b22] border border-zinc-200 dark:border-[#2b1f47]/50 rounded-2xl shadow-sm p-6 mb-8">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            {/* Long Destination URL */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Destination URL
              </label>
              <input
                type="url"
                required
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/your-very-long-url-here"
                className="w-full p-3 bg-zinc-50 dark:bg-[#1e1732] border border-zinc-200 dark:border-[#2b1f47]/40 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-electric focus:ring-1 focus:ring-electric/20 transition-all text-sm"
              />
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                The long destination page where users will be redirected.
              </span>
            </div>

            {/* Custom Slug */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Custom Endpoint (optional)
              </label>
              <div className="flex items-center">
                <span className="p-3 bg-zinc-100 dark:bg-[#1e1732] border border-r-0 border-zinc-200 dark:border-[#2b1f47]/40 rounded-l-xl text-zinc-500 dark:text-zinc-400 text-sm font-mono whitespace-nowrap">
                  /
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-custom-endpoint"
                  className="w-full p-3 bg-zinc-50 dark:bg-[#1e1732] border border-zinc-200 dark:border-[#2b1f47]/40 rounded-r-xl outline-none focus:border-zinc-400 dark:focus:border-electric focus:ring-1 focus:ring-electric/20 transition-all text-sm"
                />
              </div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Custom text for the short URL slug (e.g. /promo). Leave blank to auto-generate.
              </span>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !longUrl.trim()}
              className="mt-2 py-3 px-4 bg-zinc-900 dark:bg-electric hover:bg-zinc-800 dark:hover:bg-electric/90 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Result Card */}
        {generatedLink && (
          <div className="bg-emerald-500/10 dark:bg-[#2b1f47]/30 border border-emerald-500/20 dark:border-[#2b1f47]/40 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Successfully Generated!
              </span>
              <p className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                {generatedLink}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 self-start sm:self-auto transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy URL
                </>
              )}
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
