"use client";

import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDeactivateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeactivateModal({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmDeactivateModalProps) {
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
            className="relative w-full max-w-md bg-[#120c22] border border-[#2b1f47]/80 rounded-[20px] shadow-2xl p-6 overflow-hidden flex flex-col gap-5 z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  Deactivate Link
                </h3>
                <p className="text-sm text-zinc-400 mt-1 font-medium">
                  Are you sure you want to deactivate this link?
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Callout — minimal, styled after design system info box */}
            <div className="p-3 bg-[#834dfb]/10 border border-[#834dfb]/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-[#834dfb] flex-shrink-0 mt-0.5" size={16} />
              <div className="text-sm text-[#d4c4fc] leading-relaxed font-semibold">
                Deactivating this link will stop redirects immediately. You can reactivate it at any time.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-[#2b1f47]/60 hover:bg-[#2b1f47] text-zinc-300 text-sm font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-[#834dfb] hover:bg-[#743deb] text-white text-sm font-bold rounded-[8px] transition-all cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
