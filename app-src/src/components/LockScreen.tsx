"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PatternGrid from "@/components/PatternGrid";
import { useRouter } from "next/navigation";

type AuthStage = "pattern" | "password" | "success";

export default function LockScreen() {
  const [stage, setStage] = useState<AuthStage>("pattern");
  const [patternError, setPatternError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handlePatternComplete = async (pattern: number[]) => {
    if (isLoading) return;
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
        // Pattern correct — reveal password
        setStage("password");
        setTimeout(() => passwordRef.current?.focus(), 600);
      } else {
        setPatternError(true);
        triggerShake();
        setTimeout(() => setPatternError(false), 1500);
      }
    } catch {
      setPatternError(true);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !password.trim()) return;
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
        setStage("success");
        // Wait for curtain animation to complete, then navigate
        setTimeout(() => {
          router.push("/dashboard");
        }, 1400);
      } else {
        setPasswordError(true);
        triggerShake();
        setPassword("");
        setTimeout(() => setPasswordError(false), 1500);
      }
    } catch {
      setPasswordError(true);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lock-screen">
      {/* Background atmosphere */}
      <div className="lock-bg" />

      {/* Curtain — left */}
      <motion.div
        className="curtain curtain-left"
        animate={
          stage === "success"
            ? { x: "-100%", opacity: 0 }
            : stage === "password"
            ? { x: "-8%" }
            : { x: "0%" }
        }
        transition={{
          type: "spring",
          stiffness: stage === "success" ? 60 : 100,
          damping: stage === "success" ? 20 : 25,
          mass: 1.2,
        }}
      />

      {/* Curtain — right */}
      <motion.div
        className="curtain curtain-right"
        animate={
          stage === "success"
            ? { x: "100%", opacity: 0 }
            : stage === "password"
            ? { x: "8%" }
            : { x: "0%" }
        }
        transition={{
          type: "spring",
          stiffness: stage === "success" ? 60 : 100,
          damping: stage === "success" ? 20 : 25,
          mass: 1.2,
        }}
      />

      {/* Curtain center fold line */}
      <motion.div
        className="curtain-seam"
        animate={{
          opacity: stage === "success" ? 0 : stage === "password" ? 0.3 : 0.6,
          scaleX: stage === "password" ? 1.5 : 1,
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Auth content */}
      <div className="lock-content">
        <motion.div
          className="lock-container"
          animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* App branding */}
          <motion.div
            className="lock-branding"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="lock-title">LinkPlanet</h1>
            <p className="lock-subtitle">
              {stage === "pattern" && "Draw your pattern to continue"}
              {stage === "password" && "Enter your password"}
              {stage === "success" && "Welcome back"}
            </p>
          </motion.div>

          {/* Pattern stage */}
          <AnimatePresence mode="wait">
            {stage === "pattern" && (
              <motion.div
                key="pattern"
                className="lock-stage"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card pattern-card">
                  <PatternGrid
                    onPatternComplete={handlePatternComplete}
                    disabled={isLoading}
                    error={patternError}
                  />
                </div>
              </motion.div>
            )}

            {/* Password stage */}
            {stage === "password" && (
              <motion.div
                key="password"
                className="lock-stage"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="glass-card password-card">
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className={`password-input-wrapper ${passwordError ? "error" : ""}`}>
                      <input
                        ref={passwordRef}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="password-input"
                        disabled={isLoading}
                        autoComplete="off"
                      />
                      <div className="password-input-glow" />
                    </div>
                    <motion.button
                      type="submit"
                      className="password-submit"
                      disabled={isLoading || !password.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <span className="loading-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                      ) : (
                        "Enter"
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Success stage */}
            {stage === "success" && (
              <motion.div
                key="success"
                className="lock-stage"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  ✓
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Ambient particles */}
      <div className="lock-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              opacity: 0.1 + Math.random() * 0.3,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
