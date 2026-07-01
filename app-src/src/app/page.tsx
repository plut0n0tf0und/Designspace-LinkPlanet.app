"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Lock, ShieldAlert, Loader2, Sparkles } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
        setError(data.message || "Access Denied. Invalid password.");
        triggerShake();
      }
    } catch {
      setError("Verification failed. Please check connection.");
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
      
      {/* Dynamic Spline 3D Viewer Script */}
      <Script 
        type="module" 
        src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js" 
        strategy="afterInteractive"
      />

      {/* 3D Spline Canvas Background */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto select-none opacity-85">
          <spline-viewer url="https://prod.spline.design/IFweu3cI4HJQU3Wj/scene.splinecode" className="w-full h-full"></spline-viewer>
        </div>
      )}

      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/50 pointer-events-none z-5" />

      {/* Premium Glassmorphic Login Card */}
      <div 
        className={`w-full max-w-sm bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 flex flex-col items-center z-10 transition-all duration-300 ${
          shake ? "animate-shake border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]" : ""
        }`}
      >
        {/* App Branding */}
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-lg mb-6">
          <div className="w-6 h-6 rounded-md bg-white text-zinc-950 flex items-center justify-center shadow-md">
            <Sparkles size={12} />
          </div>
          <span>LinkPlanet</span>
        </div>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center mb-4 shadow-inner">
          <Lock size={20} className="text-zinc-300" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-white text-center mb-1">
          Access Portal
        </h1>
        <p className="text-xs text-zinc-400 text-center mb-6">
          Owner-only gate. Please authenticate to continue.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="w-full flex items-start gap-2.5 bg-red-950/20 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mb-6">
            <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-center tracking-widest text-lg font-mono focus:border-white/30 focus:bg-white/10 outline-none transition-all shadow-inner"
              autoFocus
            />
          </div>

          {/* Hint/Reminder Section */}
          <div className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-medium tracking-wide">
            <span>Hint: <span className="font-semibold text-zinc-200">Katana</span></span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full mt-2 py-3 px-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-white/5"
          >
            {isLoading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Unlock Access"
            )}
          </button>
        </form>
      </div>

      {/* Inline styles for custom shake keyframe animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </main>
  );
}
