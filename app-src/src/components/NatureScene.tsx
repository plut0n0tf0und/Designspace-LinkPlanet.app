"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// --- Chennai IST Time Logic ---
const getChennaiHour = () => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  return ist.getHours();
};

type TimeOfDay = "dawn" | "morning" | "afternoon" | "goldenHour" | "sunset" | "dusk" | "night";

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "afternoon";
  if (hour >= 15 && hour < 18) return "goldenHour";
  if (hour >= 18 && hour < 19) return "sunset";
  if (hour >= 19 && hour < 20) return "dusk";
  return "night";
};

// Dynamic Color Grading filters matching the reference board exactly
const climateFilters: Record<TimeOfDay, {
  overlayGradient: string;
  mixBlendMode: any;
  opacity: number;
  bloomColor: string;
  particleColor: string;
  showStars: boolean;
}> = {
  dawn: {
    overlayGradient: "linear-gradient(180deg, rgba(255, 140, 100, 0.1) 0%, rgba(45, 30, 65, 0.18) 100%)",
    mixBlendMode: "color-burn",
    opacity: 0.15,
    bloomColor: "rgba(255, 180, 120, 0.12)",
    particleColor: "#ffd4b0",
    showStars: false
  },
  morning: {
    overlayGradient: "linear-gradient(180deg, rgba(160, 210, 240, 0.04) 0%, rgba(65, 95, 120, 0.06) 100%)",
    mixBlendMode: "color",
    opacity: 0.06,
    bloomColor: "rgba(255, 255, 240, 0.1)",
    particleColor: "#ffffff",
    showStars: false
  },
  afternoon: {
    overlayGradient: "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(0,0,0,0.02) 100%)",
    mixBlendMode: "normal",
    opacity: 0.02,
    bloomColor: "rgba(255, 255, 255, 0.04)",
    particleColor: "#ffffff",
    showStars: false
  },
  goldenHour: {
    overlayGradient: "linear-gradient(180deg, rgba(255, 190, 80, 0.12) 0%, rgba(100, 70, 45, 0.2) 100%)",
    mixBlendMode: "color-dodge",
    opacity: 0.15,
    bloomColor: "rgba(255, 210, 110, 0.18)",
    particleColor: "#ffe5b4",
    showStars: false
  },
  sunset: {
    overlayGradient: "linear-gradient(180deg, rgba(255, 110, 50, 0.15) 0%, rgba(55, 20, 40, 0.28) 100%)",
    mixBlendMode: "multiply",
    opacity: 0.15,
    bloomColor: "rgba(255, 140, 90, 0.18)",
    particleColor: "#ff9980",
    showStars: true
  },
  dusk: {
    overlayGradient: "linear-gradient(180deg, rgba(40, 25, 65, 0.25) 0%, rgba(10, 8, 35, 0.35) 100%)",
    mixBlendMode: "color-burn",
    opacity: 0.22,
    bloomColor: "rgba(160, 200, 255, 0.12)",
    particleColor: "#a0ccff",
    showStars: true
  },
  night: {
    overlayGradient: "linear-gradient(180deg, rgba(6, 8, 20, 0.35) 0%, rgba(2, 2, 10, 0.45) 100%)",
    mixBlendMode: "multiply",
    opacity: 0.3,
    bloomColor: "rgba(150, 240, 210, 0.08)",
    particleColor: "#a0ffd8",
    showStars: true
  }
};

export default function NatureScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Framer Motion Interactive Spring-Damped Holographic 3D Tilt system
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 80, mass: 0.65 };
  const tiltX = useSpring(mouseX, springConfig);
  const tiltY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay(getChennaiHour()));
    setMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. High-Performance 2D Particle & Realistic Flocking Bird Engine
  useEffect(() => {
    if (!mounted || !particleCanvasRef.current) return;

    const canvas = particleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const config = climateFilters[timeOfDay];
    const pCount = window.innerWidth < 768 ? 15 : 40;

    // --- Pollen Particles Setup ---
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }[] = Array.from({ length: pCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.0 + 0.8,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: -Math.random() * 0.22 - 0.06,
      opacity: Math.random() * 0.6 + 0.4,
      fadeSpeed: Math.random() * 0.002 + 0.001
    }));

    // --- Flocking Birds (Highly Realistic Right-to-Left Soaring V-Formation) ---
    const birdGroup = Array.from({ length: 6 }, (_, index) => {
      const row = Math.floor(index / 2);
      const isRight = index % 2 === 0;
      // Trailing offsets (positive offsetX so they trail behind leader)
      const offsetX = row * 34 + Math.random() * 8;
      const offsetY = row * 20 * (isRight ? 1 : -1) + (Math.random() - 0.5) * 6;

      return {
        offsetX,
        offsetY,
        size: Math.random() * 1.5 + 4.5, // Crisp majestic silhouette sizing
        flapSpeed: Math.random() * 0.35 + 0.55, // Majestic slow soar speed (no hyper bat flapping)
        flapOffset: Math.random() * Math.PI * 2
      };
    });

    let flockX = canvas.width + 200; // Start offscreen-right
    let flockY = canvas.height * 0.35; // Upper sunset sky path
    const flockSpeedX = -0.9; // Fly Left
    const flockSpeedY = -0.15; // Ascend slowly

    let animId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (config.showStars) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          const starX = (Math.sin(i * 456.7) * 0.5 + 0.5) * canvas.width;
          const starY = (Math.cos(i * 321.4) * 0.5 + 0.5) * (canvas.height * 0.35);
          const tw = Math.sin(Date.now() * 0.0012 + i) * 0.4 + 0.6;
          ctx.arc(starX, starY, 1.1, 0, Math.PI * 2);
          ctx.globalAlpha = tw;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // --- Draw Realistic Soaring Birds ---
      flockX += flockSpeedX;
      flockY += flockSpeedY;

      if (flockX < -220) {
        flockX = canvas.width + 200 + Math.random() * 250;
        flockY = canvas.height * (0.2 + Math.random() * 0.18);
      }

      birdGroup.forEach((bird) => {
        const bx = flockX + bird.offsetX;
        const by = flockY + bird.offsetY;

        if (bx > -40 && bx < canvas.width + 40) {
          // Slow organic joint flex oscilattor
          const flap = Math.sin(Date.now() * 0.008 * bird.flapSpeed + bird.flapOffset);
          
          ctx.fillStyle = "rgba(25, 22, 32, 0.85)"; // Deep crisp sunset silhouette
          ctx.beginPath();

          // 1. Draw central Body
          ctx.moveTo(bx, by);

          // 2. Draw Left Wing (Jointed shoulder, tapering off to a sharp wingtip)
          ctx.lineTo(bx - bird.size * 0.4, by - bird.size * (0.35 + flap * 0.32)); // Left joint
          ctx.lineTo(bx - bird.size, by - bird.size * (0.2 + flap * 0.48)); // Left tip
          ctx.lineTo(bx - bird.size * 0.45, by - bird.size * (0.28 + flap * 0.28)); // Trailing joint
          ctx.lineTo(bx, by + bird.size * 0.14); // Back to tail fan

          // 3. Draw Right Wing
          ctx.lineTo(bx + bird.size * 0.45, by - bird.size * (0.28 + flap * 0.28)); // Trailing joint
          ctx.lineTo(bx + bird.size, by - bird.size * (0.2 + flap * 0.48)); // Right tip
          ctx.lineTo(bx + bird.size * 0.4, by - bird.size * (0.35 + flap * 0.32)); // Right joint

          ctx.closePath();
          ctx.fill();

          // 4. Draw tiny defined Head Beak
          ctx.beginPath();
          ctx.arc(bx, by - bird.size * 0.12, bird.size * 0.14, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- Draw Pollen Particles ---
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(Date.now() * 0.0008 + p.y * 0.012) * 0.08;
        p.opacity -= p.fadeSpeed;

        if (p.y < -10 || p.opacity <= 0 || p.x < 0 || p.x > canvas.width) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.opacity = Math.random() * 0.6 + 0.4;
        }

        ctx.fillStyle = config.particleColor;
        ctx.shadowColor = config.particleColor;
        ctx.shadowBlur = 5;
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [mounted, timeOfDay]);

  // 2. Mouse Tilt Interaction
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseX.set(0);
  };

  if (!mounted) return <div className="w-full h-[45vh] md:h-[60vh] bg-[#0c0c16]" />;

  const conf = climateFilters[timeOfDay];
  const activeImage = isMobile ? "/nature-scene-base.png" : "/nature-scene-desktop.png";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[45vh] md:h-[60vh] overflow-hidden select-none bg-[#10171f]"
      style={{
        perspective: "1200px"
      }}
    >
      {/* --- LIVING FANTASY WORLD CONTAINER --- */}
      <motion.div
        className="absolute inset-0 w-full h-full origin-center"
        style={{
          rotateX: tiltY.get() * -5,
          rotateY: tiltX.get() * 7,
          scale: 1.05,
          x: tiltX.get() * 8,
          y: tiltY.get() * 4
        }}
      >
        {/* --- LAYER 1: STABLE SOLID BASE LAYER --- */}
        <img
          src={activeImage}
          alt="Scenic Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* --- LAYER 2: OVERLAY SPECULAR WATER LAYER (Clipped to Lake Area) --- */}
        <div 
          className="absolute inset-0 w-full h-full z-10"
          style={{
            clipPath: "inset(49% 0px 0px 0px)"
          }}
        >
          <div 
            className="absolute inset-x-0 bottom-0 top-[49%] opacity-35 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,210,120,0.35)_0%,_transparent_60%)] pointer-events-none"
            style={{
              animation: "waterShimmer 5.5s infinite alternate ease-in-out"
            }}
          />
          <div 
            className="absolute inset-x-0 bottom-0 top-[49%] opacity-20 bg-[linear-gradient(0deg,_rgba(255,255,255,0.08)_0%,_transparent_100%)] pointer-events-none"
            style={{
              animation: "ripplePulse 4s infinite alternate ease-in-out"
            }}
          />
        </div>

        {/* Drifting horizontal fog clouds */}
        <div className="absolute inset-x-0 bottom-[38%] h-24 pointer-events-none overflow-hidden z-15 opacity-18 select-none">
          <div className="absolute w-[200%] h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.35)_0%,_transparent_75%)] blur-2xl animate-fog-drift" />
        </div>
      </motion.div>

      {/* --- LIGHTING & CLIMATE LAYERS --- */}
      {/* Floating 2D Particle Engine */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Dynamic system color grading filter */}
      <div
        className="absolute inset-0 pointer-events-none z-25 transition-all duration-[3000ms]"
        style={{
          background: conf.overlayGradient,
          mixBlendMode: conf.mixBlendMode,
          opacity: conf.opacity
        }}
      />

      {/* Soft golden hour bloom highlight over the sun */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 transition-all duration-[3000ms]"
        style={{
          background: `radial-gradient(circle at 49% 30%, ${conf.bloomColor} 0%, transparent 55%)`,
        }}
      />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.3)] pointer-events-none z-40" />
    </div>
  );
}
