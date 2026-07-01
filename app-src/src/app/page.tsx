"use client";

import { useState, useEffect } from "react";
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
    <main 
      style={{ background: "radial-gradient(circle at 75% 20%, #3a226b 0%, #18102b 35%, #0c0816 100%)" }}
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto select-none"
    >
      
      {/* Load Spline Web Component Script */}
      <Script 
        type="module" 
        src="https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js" 
        strategy="afterInteractive"
      />

      {/* Floating Split Card Container */}
      <div className="w-full max-w-6xl min-h-[550px] md:h-[650px] bg-[#120c22]/85 border border-[#2b1f47]/50 rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] flex flex-col md:flex-row backdrop-blur-md relative z-10">
        
        {/* Left Column: Credentials Form Container */}
        <div className="w-full md:w-[45%] lg:w-[40%] bg-[#18102b] flex flex-col justify-between p-8 sm:p-12 z-10 order-2 md:order-1 md:h-full overflow-y-auto border-t md:border-t-0 md:border-r border-[#2b1f47]/40">
          
          {/* Top Brand Logo */}
          <div className="flex items-center gap-1.5 mb-8">
            <span className="text-[#834dfb] text-2xl font-bold tracking-tight">Link</span>
            <span className="text-white text-2xl font-bold tracking-tight">Planet</span>
          </div>

          {/* Form Area */}
          <div className="my-auto w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-semibold text-white tracking-tight">
                Track your links
              </h2>
              <p className="text-base text-zinc-400 font-light leading-relaxed">
                Please enter your credentials to proceed.
              </p>
            </div>

            {/* Error Alert Box */}
            {error && (
              <div className="w-full flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-base leading-relaxed text-red-300 animate-fadeIn">
                <ShieldAlert size={18} className="flex-shrink-0 mt-1 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-6">
              
              {/* Password Section */}
              <div className="w-full flex flex-col gap-2.5">
                <label className="text-base font-semibold text-zinc-300 pl-0.5">
                  Password
                </label>
                <div className="relative w-full flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Type here..."
                    className="w-full pl-5 pr-12 py-4 bg-[#1e2129] border border-[#2a2e3d]/30 rounded-2xl text-white placeholder-zinc-600 text-left text-base font-sans focus:border-[#834dfb] focus:ring-1 focus:ring-[#834dfb]/20 outline-none transition-all duration-200"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Hint Box (Intuitively styled with fill, light border, and bulb icon) */}
              <div className="w-fit self-start flex items-center gap-2 py-2 px-3 bg-[#834dfb]/10 border border-[#834dfb]/30 rounded-xl text-base text-zinc-300 font-normal">
                <Lightbulb size={18} className="text-[#834dfb] flex-shrink-0" />
                <span>
                  Hint: <span className="text-white font-semibold">Katana</span>
                </span>
              </div>

              {/* Submit Button (Electric Violet Button, White Text with 8px corner radius) */}
              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full py-4 px-6 bg-[#834dfb] hover:bg-[#743deb] active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:scale-100 text-white rounded-[8px] text-base font-bold uppercase tracking-wider flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md shadow-[#834dfb]/10 disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "UNLOCK ACCESS"
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer Info */}
          <div className="w-full flex flex-col gap-1.5 mt-8 md:mt-0 flex-shrink-0">
            <p className="text-base text-zinc-500 font-light">
              End-to-end encrypted connection established
            </p>
            <div className="flex items-center gap-1.5 text-base font-bold tracking-[0.18em] text-zinc-500 uppercase">
              <span className="text-[#834dfb]">©</span>
              <span>Sentinel Systems 2024</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Spline Scene (No overlays, full opacity) */}
        <div className="w-full md:w-[55%] lg:w-[60%] h-[35vh] md:h-full bg-black/10 relative z-0 flex items-center justify-center overflow-hidden order-1 md:order-2 border-t md:border-t-0 md:border-l border-[#2b1f47]/30">
          {mounted && (
            <div className="w-full h-full pointer-events-auto select-none opacity-100 transform translate-y-[-8%] md:translate-y-[-5%]">
              <spline-viewer url="https://prod.spline.design/IFweu3cI4HJQU3Wj/scene.splinecode" className="w-full h-full"></spline-viewer>
            </div>
          )}
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
