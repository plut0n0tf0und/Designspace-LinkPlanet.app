"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2, Sparkles, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError("Access Denied: The password you entered is incorrect. Double-check your spelling or consult your hint.");
        triggerShake();
      }
    } catch {
      setError("Connection Failed: Unable to reach the server. Please check your network connection and try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 overflow-hidden select-none">
      
      {/* Load Spline Web Component Script */}
      <Script 
        type="module" 
        src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js" 
        strategy="afterInteractive"
      />

      {/* Full-Screen Interactive 3D Spline Scene */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto select-none opacity-90 transition-opacity duration-1000">
          <spline-viewer url="https://prod.spline.design/IFweu3cI4HJQU3Wj/scene.splinecode" className="w-full h-full"></spline-viewer>
        </div>
      )}

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950 pointer-events-none z-5" />

      {/* Liquid Glass Login Card Overlay */}
      <div 
        className={`w-full max-w-sm bg-zinc-950/35 backdrop-blur-3xl border border-white/10 hover:border-white/15 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.85)] p-8 flex flex-col items-center z-10 transition-all duration-300 ${
          shake ? "animate-shake border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : ""
        }`}
      >
        {/* Brand Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-semibold text-zinc-300 tracking-wide mb-8 shadow-sm">
          <Sparkles size={11} className="text-zinc-400 animate-pulse" />
          <span>LinkPlanet Link Manager</span>
        </div>

        {/* Floating Lock Icon with Inner Shadow */}
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center mb-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
          <Lock size={18} className="text-zinc-300" />
        </div>

        {/* Title and Instruction Header */}
        <h1 className="text-xl font-light tracking-[0.25em] text-white text-center mb-1">
          SECURE PORTAL
        </h1>
        <p className="text-[11px] text-zinc-400 text-center mb-8 tracking-wide">
          Provide authorization credentials to proceed.
        </p>

        {/* UX-compliant Error Alert */}
        {error && (
          <div className="w-full flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs leading-relaxed text-red-300 mb-6 animate-fadeIn">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pl-1">
              Security Password
            </label>
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3.5 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-white/30 rounded-xl text-white placeholder-zinc-600 text-center tracking-widest text-lg font-mono focus:ring-1 focus:ring-white/10 outline-none transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-2 w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Elegant Pill Hint Badge */}
          <div className="self-center flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-zinc-400 font-medium tracking-wide">
            <Info size={11} className="text-zinc-500" />
            <span>Hint: <span className="font-semibold text-zinc-200">Katana</span></span>
          </div>

          {/* Verify / Unlock CTA */}
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full mt-2 py-3.5 px-4 bg-white hover:bg-zinc-100 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:scale-100 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-white/5"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              "Unlock Access"
            )}
          </button>
        </form>
      </div>

      {/* Global CSS keyframe overrides */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
