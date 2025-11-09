"use client";

import { motion } from "framer-motion";
import { theme } from "../theme";

export function LoadingRing() {
  return (
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 border-4 border-transparent border-t-[#a855f7] rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl">💀</span>
      </div>
    </div>
  );
}

