"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2, Info } from "lucide-react";

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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#050b0b] overflow-hidden select-none">
      
      {/* Load Spline Web Component Script */}
      <Script 
        type="module" 
        src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js" 
        strategy="afterInteractive"
      />

      {/* Full-Screen Interactive 3D Spline Scene */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto select-none opacity-45">
          <spline-viewer url="https://prod.spline.design/IFweu3cI4HJQU3Wj/scene.splinecode" className="w-full h-full"></spline-viewer>
        </div>
      )}

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-[#050b0b]/60 pointer-events-none z-5" />

      {/* Top Header Label */}
      <div className="absolute top-12 left-0 right-0 text-center z-10">
        <span className="text-[10px] font-bold tracking-[0.45em] text-[#3ca8a1]/40 uppercase">
          LinkPlanet Link Manager
        </span>
      </div>

      {/* Redesigned Login Card */}
      <div 
        className={`w-full max-w-[420px] bg-[#0b1617]/90 border border-[#1b3232]/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] px-10 py-12 flex flex-col items-center z-10 transition-all duration-300 ${
          shake ? "animate-shake border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]" : ""
        }`}
      >
        {/* Centered Floating Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-[#132526] border border-[#1e3435] text-zinc-100 flex items-center justify-center mb-8 shadow-md">
          <Lock size={20} className="text-zinc-200" />
        </div>

        {/* Header Titles */}
        <h1 className="text-3xl font-normal tracking-[0.15em] text-[#e8f1f0] text-center mb-2">
          SECURE PORTAL
        </h1>
        <p className="text-xs text-teal-100/50 text-center mb-10 tracking-wide font-normal">
          Provide authorization credentials to proceed.
        </p>

        {/* Error Alert Box */}
        {error && (
          <div className="w-full flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-xs leading-relaxed text-red-300 mb-6 animate-fadeIn">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col items-center">
          
          {/* Password Section */}
          <div className="w-full flex flex-col gap-2.5 mb-6">
            <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#4b6a6b] pl-1">
              Security Password
            </label>
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••••••"
                className="w-full pl-5 pr-14 py-4 bg-[#050b0b]/60 border border-[#1b3030] rounded-xl text-teal-100 placeholder-[#162a2b] text-center tracking-widest text-lg font-mono focus:border-[#2b4c4c] focus:bg-[#070f0f] focus:ring-1 focus:ring-[#2b4c4c]/30 outline-none transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 w-10 h-10 flex items-center justify-center text-[#385354] hover:text-[#52797a] rounded-lg transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Hint Badge Pill */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#122424]/50 border border-[#1a3030] rounded-full text-[10px] text-teal-100/50 font-medium tracking-wide mb-8 shadow-sm">
            <Info size={11} className="text-[#385354]" />
            <span>Hint: <span className="font-semibold text-teal-200">Katana</span></span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-4 px-4 bg-[#d2e7e5] hover:bg-[#c2dedb] active:scale-[0.98] disabled:bg-[#132526] disabled:text-[#385354] disabled:scale-100 text-[#0b1617] rounded-xl text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#d2e7e5]/5"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Unlock Access"
            )}
          </button>
        </form>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-6 left-8 z-10 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#436465]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3ca8a1] animate-pulse"></span>
        <span>System Encrypted</span>
      </div>
      <div className="absolute bottom-6 right-8 z-10 text-[9px] font-bold uppercase tracking-[0.2em] text-[#436465]">
        Ref: 88-X/Alpha
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
