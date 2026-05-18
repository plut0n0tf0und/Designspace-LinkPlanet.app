"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PatternGridProps {
  onPatternComplete: (pattern: number[]) => void;
  disabled?: boolean;
  error?: boolean;
}

const DOT_COUNT = 9;
const GRID_SIZE = 3;

export default function PatternGrid({ onPatternComplete, disabled, error }: PatternGridProps) {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineEnd, setLineEnd] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDotCenter = useCallback((index: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const dotElements = container.querySelectorAll("[data-dot]");
    const dot = dotElements[index] as HTMLElement;
    if (!dot) return { x: 0, y: 0 };
    const dotRect = dot.getBoundingClientRect();
    return {
      x: dotRect.left + dotRect.width / 2 - rect.left,
      y: dotRect.top + dotRect.height / 2 - rect.top,
    };
  }, []);

  const getDotFromPoint = useCallback((clientX: number, clientY: number): number | null => {
    if (!containerRef.current) return null;
    const dotElements = containerRef.current.querySelectorAll("[data-dot]");
    for (let i = 0; i < dotElements.length; i++) {
      const dot = dotElements[i] as HTMLElement;
      const rect = dot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
      );
      if (distance < 28) return i + 1; // 1-indexed
    }
    return null;
  }, []);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;
      const dot = getDotFromPoint(clientX, clientY);
      if (dot !== null) {
        setIsDrawing(true);
        setSelectedDots([dot]);
        const center = getDotCenter(dot - 1);
        setLineEnd(center);
      }
    },
    [disabled, getDotFromPoint, getDotCenter]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawing || disabled) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setLineEnd({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });

      const dot = getDotFromPoint(clientX, clientY);
      if (dot !== null && !selectedDots.includes(dot)) {
        setSelectedDots((prev) => [...prev, dot]);
      }
    },
    [isDrawing, disabled, getDotFromPoint, selectedDots]
  );

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLineEnd(null);
    if (selectedDots.length >= 2) {
      onPatternComplete(selectedDots);
    }
    // Reset after a short delay for visual feedback
    setTimeout(() => {
      setSelectedDots([]);
    }, 600);
  }, [isDrawing, selectedDots, onPatternComplete]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalUp = () => handleEnd();
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [handleEnd]);

  // Generate SVG lines between selected dots
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < selectedDots.length - 1; i++) {
    const from = getDotCenter(selectedDots[i] - 1);
    const to = getDotCenter(selectedDots[i + 1] - 1);
    lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  }

  // Line from last selected dot to cursor
  if (isDrawing && lineEnd && selectedDots.length > 0) {
    const lastDot = getDotCenter(selectedDots[selectedDots.length - 1] - 1);
    lines.push({ x1: lastDot.x, y1: lastDot.y, x2: lineEnd.x, y2: lineEnd.y });
  }

  return (
    <div
      ref={containerRef}
      className="pattern-grid-container"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }}
    >
      {/* SVG layer for lines */}
      <svg className="pattern-lines-svg">
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={error ? "rgba(255, 80, 80, 0.8)" : "rgba(255, 255, 255, 0.6)"}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Dot grid */}
      <div className="pattern-dot-grid">
        {Array.from({ length: DOT_COUNT }).map((_, i) => {
          const dotNum = i + 1;
          const isSelected = selectedDots.includes(dotNum);
          return (
            <div key={i} className="pattern-dot-wrapper" data-dot>
              {/* Outer ring */}
              <motion.div
                className={`pattern-dot-outer ${isSelected ? "active" : ""} ${error ? "error" : ""}`}
                animate={{
                  scale: isSelected ? 1.3 : 1,
                  borderColor: error
                    ? "rgba(255, 80, 80, 0.8)"
                    : isSelected
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(255, 255, 255, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              />
              {/* Inner dot */}
              <motion.div
                className={`pattern-dot-inner ${error ? "error" : ""}`}
                animate={{
                  scale: isSelected ? 1.6 : 1,
                  backgroundColor: error
                    ? "rgba(255, 80, 80, 0.9)"
                    : isSelected
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(255, 255, 255, 0.35)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
