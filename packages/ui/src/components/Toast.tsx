"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface ToastProps {
  message: string;
  icon?: ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, icon = "☠", isVisible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50
            bg-[#1c1024]/90 backdrop-blur-sm
            border border-[#a855f7]/50
            px-4 py-3 rounded-lg
            shadow-[0_0_20px_rgba(168,85,247,0.3)]
            text-[#f5f5f5]
            flex items-center gap-2
          "
        >
          <span>{icon}</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

