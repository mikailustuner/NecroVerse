"use client";

import { motion } from "framer-motion";

export function CRTOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(168, 85, 247, 0.1) 2px,
            rgba(168, 85, 247, 0.1) 4px
          )`,
        }}
      />
      {/* Flicker effect */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{
          opacity: [0, 0.02, 0],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </div>
  );
}

