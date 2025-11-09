"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={{
        textShadow: [
          "2px 0 #a855f7, -2px 0 #00fff7",
          "-2px 0 #a855f7, 2px 0 #00fff7",
          "2px 0 #a855f7, -2px 0 #00fff7",
        ],
      }}
      transition={{
        duration: 0.1,
        repeat: Infinity,
        repeatDelay: 2,
      }}
    >
      {children}
    </motion.span>
  );
}

