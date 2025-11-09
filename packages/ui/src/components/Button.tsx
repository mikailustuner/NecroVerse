"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { theme } from "../theme";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "violet" | "cyan" | "magenta";
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = "violet",
  className = "",
  disabled = false,
}: ButtonProps) {
  const variantStyles = {
    violet: {
      glow: theme.colors.accentGlow,
      hover: "hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    },
    cyan: {
      glow: theme.colors.highlight,
      hover: "hover:shadow-[0_0_20px_rgba(0,255,247,0.5)]",
    },
    magenta: {
      glow: theme.colors.warning,
      hover: "hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]",
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-lg
        bg-[${style.glow}]/20
        border border-[${style.glow}]/50
        text-[${style.glow}]
        font-bold
        ${style.hover}
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          `0_0_10px_${style.glow}40`,
          `0_0_20px_${style.glow}60`,
          `0_0_10px_${style.glow}40`,
        ],
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {children}
    </motion.button>
  );
}

