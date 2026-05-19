"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PatternGrid from "@/components/PatternGrid";
import { useRouter } from "next/navigation";

type AuthStage = "pattern" | "password" | "opening";

export default function LockScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<AuthStage>("pattern");
  const [patternError, setPatternError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity: 0.2 + Math.random() * 0.4,
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
      }))
    );
  }, []);

  const [shake, setShake] = useState(false);
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const handlePatternComplete = async (pattern: number[]) => {
    setIsLoading(true);
    setPatternError(false);

    try {
      const res = await fetch("/api/auth/pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
      });

      const data = await res.json();

      if (data.success) {
        setStage("password");
        setTimeout(() => passwordRef.current?.focus(), 600);
      } else {
        setPatternError(true);
        triggerShake();
      }
    } catch (e) {
      setPatternError(true);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isLoading) return;

    setIsLoading(true);
    setPasswordError(false);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setStage("opening");
        
        // Cinematic sequence
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500); // Wait for the magical door and zoom animation
      } else {
        setPasswordError(true);
        triggerShake();
        setIsLoading(false);
      }
    } catch (e) {
      setPasswordError(true);
      triggerShake();
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Scene animation variants
  const backgroundVariants = {
    pattern: { scale: 1, filter: "blur(0px) brightness(1)" },
    password: { scale: 1.4, filter: "blur(3px) brightness(0.9)" }, // Zooms directly into the door via CSS transform-origin
    opening: { scale: 5, filter: "blur(8px) brightness(1.5)" } // Fly into the doorway
  };

  return (
    <div className={`scene-container ${stage === "opening" ? "is-opening" : ""}`}>
      {/* 1. Cinematic Background */}
      <motion.div 
        className="scene-background"
        initial="pattern"
        animate={stage}
        variants={backgroundVariants}
        transition={{ duration: 2.5, ease: [0.2, 0.8, 0.2, 1] }}
      />

      {/* 2. Portal Bloom (Fades in when door opens) */}
      <div className="portal-bloom" />

      {/* 3. Ambient Particles */}
      <div className="scene-particles">
        {mounted && particles.map((style, i) => (
          <div key={i} className="particle" style={style} />
        ))}
      </div>

      {/* 4. White Flash Transition */}
      <motion.div 
        className="scene-flash"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === "opening" ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 1 }}
      />

      {/* 5. UI Layer */}
      <div className="ui-layer">
        <motion.div
          animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <AnimatePresence mode="wait">
            {stage === "pattern" && (
              <motion.div
                key="pattern"
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="card-title">Draw Unlock Pattern</h2>
                <p className="card-subtitle">Connect the symbols in any order</p>
                
                <PatternGrid
                  onPatternComplete={handlePatternComplete}
                  disabled={isLoading}
                  error={patternError}
                />
                
                <p className="card-footer-link">Forgot Pattern?</p>
              </motion.div>
            )}

            {stage === "password" && (
              <motion.div
                key="password"
                className="glass-card"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="card-title">Enter Password</h2>
                <p className="card-subtitle">Your realm awaits</p>
                
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className={`password-input-wrapper ${passwordError ? "error" : ""}`}>
                    <input
                      ref={passwordRef}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="password-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || password.length === 0}
                    className="password-submit"
                  >
                    {isLoading ? "Unlocking..." : "Enter Realm"}
                  </button>
                </form>
                
                <p className="card-footer-link">Forgot Password?</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
