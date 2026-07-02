"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Link as LinkIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  slug: string;
  originalUrl: string;
  clicks: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  slug,
  originalUrl,
  clicks,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState("");

  // Reset confirmation input when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmInput("");
    }
  }, [isOpen]);

  const isConfirmed = confirmInput.trim() === slug;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-[#06040a]/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-lg bg-[#120c22] border border-[#2b1f47]/80 rounded-[20px] shadow-2xl p-6 overflow-hidden flex flex-col gap-5 z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  Delete Link
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Are you sure you want to permanently delete the following link?
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Callout */}
            <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-red-200/90 leading-relaxed font-medium">
                <strong>Warning:</strong> This action cannot be undone. Deleting this link will remove all its associated redirection data and click analytics permanently.
              </div>
            </div>

            {/* Preview Card */}
            <div className="p-4 bg-[#18102b] border border-[#2b1f47]/50 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#834dfb]/15 text-[#834dfb] flex items-center justify-center flex-shrink-0">
                  <LinkIcon size={18} />
                </div>
                {/* Details */}
                <div className="min-w-0">
                  <h4 className="text-white font-bold text-sm truncate leading-snug">
                    {title}
                  </h4>
                  <p className="text-zinc-400 text-sm truncate max-w-[240px] mt-0.5">
                    {originalUrl}
                  </p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className="text-white font-bold text-lg leading-none"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {clicks.toLocaleString()}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mt-1">
                  Clicks
                </span>
              </div>
            </div>

            {/* Confirmation Typing Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm uppercase tracking-widest text-zinc-400 font-bold">
                To delete, type the slug <span className="font-mono text-[#a78bfa] normal-case font-bold">"{slug}"</span> below
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500">
                  <Trash2 size={16} />
                </span>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={`Enter ${slug}`}
                  className="w-full bg-[#18102b] border border-[#2b1f47]/80 rounded-[8px] text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#834dfb] transition-colors"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-[#2b1f47]/60 hover:bg-[#2b1f47] text-zinc-300 text-sm font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!isConfirmed}
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-bold rounded-[8px] transition-all disabled:cursor-not-allowed cursor-pointer"
              >
                Yes, Delete Link
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
