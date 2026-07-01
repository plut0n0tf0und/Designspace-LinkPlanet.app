"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, KeyRound, Grid3x3, RefreshCw, ShieldAlert, Loader2 } from "lucide-react";

type AuthStage = "pattern" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<AuthStage>("pattern");
  const [pattern, setPattern] = useState<number[]>([]);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDotClick = (num: number) => {
    if (pattern.includes(num)) {
      // Allow clicking again to undo back to this point or remove it
      const index = pattern.indexOf(num);
      setPattern(pattern.slice(0, index));
    } else {
      setPattern([...pattern, num]);
    }
  };

  const handlePatternClear = () => {
    setPattern([]);
    setError("");
  };

  const handlePatternSubmit = async () => {
    if (pattern.length < 2) {
      setError("Pattern must contain at least 2 points.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
      });

      const data = await res.json();

      if (data.success) {
        setStage("password");
      } else {
        setError(data.message || "Invalid pattern");
        setPattern([]);
      }
    } catch {
      setError("Failed to verify pattern. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

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
        setError(data.message || "Invalid password");
      }
    } catch {
      setError("Failed to verify password. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
          {stage === "pattern" ? <Grid3x3 size={24} /> : <KeyRound size={24} />}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-center mb-1">
          {stage === "pattern" ? "Pattern Authenticator" : "Password Verification"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
          {stage === "pattern" 
            ? "Click the dots in sequence to draw your authorization pattern" 
            : "Pattern verified. Enter your administrator password."
          }
        </p>

        {/* Error Alert */}
        {error && (
          <div className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-sm text-red-600 dark:text-red-400 mb-6 animate-pulse">
            <ShieldAlert size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stage 1: Pattern Drawer */}
        {stage === "pattern" && (
          <div className="w-full flex flex-col items-center">
            {/* Grid display */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const isSelected = pattern.includes(num);
                const stepIndex = pattern.indexOf(num);
                return (
                  <button
                    key={num}
                    onClick={() => handleDotClick(num)}
                    disabled={isLoading}
                    className={`w-16 h-16 rounded-full font-bold text-lg flex flex-col items-center justify-center transition-all duration-150 relative border ${
                      isSelected
                        ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-95"
                        : "bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <span>{num}</span>
                    {isSelected && (
                      <span className="absolute bottom-1.5 text-[10px] opacity-75 font-semibold">
                        #{stepIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Sequence Indicator */}
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono min-h-[1.5rem] mb-6">
              {pattern.length > 0 ? (
                <span>Drawn: {pattern.join(" ➔ ")}</span>
              ) : (
                <span className="italic">No dots selected</span>
              )}
            </div>

            {/* Actions */}
            <div className="w-full flex gap-3">
              <button
                onClick={handlePatternClear}
                disabled={isLoading || pattern.length === 0}
                className="flex-1 py-3 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} />
                Clear
              </button>
              <button
                onClick={handlePatternSubmit}
                disabled={isLoading || pattern.length < 2}
                className="flex-1 py-3 px-4 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Unlock size={14} />
                )}
                Verify Pattern
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Password Input */}
        {stage === "password" && (
          <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col">
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter password..."
                className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all text-center tracking-widest text-lg font-mono"
                autoFocus
              />
            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStage("pattern");
                  setPassword("");
                  setError("");
                }}
                disabled={isLoading}
                className="flex-1 py-3 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Pattern
              </button>
              <button
                type="submit"
                disabled={isLoading || !password}
                className="flex-1 py-3 px-4 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                Login
              </button>
            </div>
          </form>
        )}

      </div>
    </main>
  );
}
