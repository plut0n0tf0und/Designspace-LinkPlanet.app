"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2, Info, ChevronRight, Lightbulb } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden select-none bg-[#0c0816]">
      {/* Load Spline Web Component Script */}
      <Script 
        type="module" 
        src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js" 
        strategy="afterInteractive"
      />

      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,_#2a1658_0%,_#120a22_45%,_#06040b_100%)] z-0"></div>

      {/* Cinematic 3D Globe - Positioned large on the right edge */}
      <div className="absolute inset-0 z-10 pointer-events-auto overflow-hidden">
        {mounted && (
          <div className="absolute top-1/2 right-0 w-[800px] h-[800px] md:w-[1100px] md:h-[1100px] transform translate-x-[15%] md:translate-x-[5%] -translate-y-[60%] scale-100 opacity-90 transition-opacity duration-1000 ease-in-out">
            <spline-viewer url="https://prod.spline.design/IFweu3cI4HJQU3Wj/scene.splinecode" className="w-full h-full"></spline-viewer>
          </div>
        )}
      </div>

      {/* Foreground UI Layer */}
      <div className="relative z-20 w-full h-screen flex flex-col items-center md:items-start justify-center p-4 sm:p-8 md:pl-[8%] lg:pl-[12%] pointer-events-none">
        
        {/* Interactive Floating Card */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="group w-full max-w-[420px] rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_15px_rgba(131,77,251,0.1)] pointer-events-auto flex flex-col relative"
        >
          {/* Static Glass Background & Base Border */}
          <div className="absolute inset-0 rounded-[32px] bg-transparent backdrop-blur-md border border-[#834dfb]/30 pointer-events-none z-0"></div>
          
          {/* Mouse-Tracking Border Shine */}
          <div 
            className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
            style={{
              background: "radial-gradient(300px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(131,77,251,0.8), transparent 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1.5px", // Creates a 1.5px interactive border
            }}
          ></div>
          
          {/* Card Content Layer */}
          <div className="relative z-20 flex flex-col p-8 sm:p-10 overflow-hidden rounded-[32px]">
            {/* Top Brand Logo */}
            <div className="flex items-center gap-1.5 mb-8">
              <span className="text-[#834dfb] text-2xl font-bold tracking-tight">Link</span>
              <span className="text-white text-2xl font-bold tracking-tight">Planet</span>
            </div>

            {/* Form Area */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}>
                  Track your links
                </h2>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Please enter your credentials to proceed into the system.
                </p>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="w-full flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-3 text-sm leading-relaxed text-red-300 animate-fadeIn backdrop-blur-md">
                  <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-5">
                
                {/* Password Section */}
                <div className="w-full flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest pl-0.5">
                    Secure Password
                  </label>
                  <div className="relative w-full flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter passphrase..."
                      className="w-full pl-5 pr-12 py-3.5 bg-[#18102b]/80 border border-[#2b1f47]/60 rounded-xl text-white placeholder-zinc-600 text-left text-base font-mono focus:border-[#834dfb] focus:ring-1 focus:ring-[#834dfb]/30 focus:bg-[#18102b] outline-none transition-all duration-200 relative z-30"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-[#834dfb] rounded-lg transition-colors cursor-pointer z-40"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Hint Box */}
                <div className="w-fit flex items-center gap-2 py-1.5 px-3 bg-[#834dfb]/10 border border-[#834dfb]/30 rounded-lg text-xs text-zinc-300 font-normal backdrop-blur-sm">
                  <Lightbulb size={14} className="text-[#834dfb] flex-shrink-0" />
                  <span>
                    Hint: <span className="text-white font-semibold">Katana</span>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full py-3.5 px-6 mt-1 bg-[#834dfb] hover:bg-[#743deb] active:scale-[0.98] disabled:bg-[#18102b] disabled:text-zinc-600 disabled:border disabled:border-[#2b1f47]/50 disabled:scale-100 text-white rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(131,77,251,0.25)] disabled:shadow-none hover:shadow-[0_0_30px_rgba(131,77,251,0.4)] relative z-30"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Authenticating
                    </div>
                  ) : (
                    "Initialize Connection"
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Info */}
            <div className="w-full mt-8 flex items-center justify-between flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                <span className="text-[#834dfb]">©</span>
                <span>Sentinel 2024</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest">
                [ SECURE NODE ]
              </p>
            </div>
          </div>
        </div>
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
