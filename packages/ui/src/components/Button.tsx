"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "violet" | "cyan" | "magenta" | "ghost";
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
      bg: "bg-purple-500/20",
      border: "border-purple-500/50",
      text: "text-purple-400",
      hover: "hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      glow: "rgba(168,85,247,0.4)",
    },
    cyan: {
      bg: "bg-cyan-500/20",
      border: "border-cyan-400/50",
      text: "text-cyan-400",
      hover: "hover:shadow-[0_0_20px_rgba(0,255,247,0.5)]",
      glow: "rgba(0,255,247,0.4)",
    },
    magenta: {
      bg: "bg-pink-500/20",
      border: "border-pink-500/50",
      text: "text-pink-400",
      hover: "hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]",
      glow: "rgba(255,0,110,0.4)",
    },
    ghost: {
      bg: "bg-transparent",
      border: "border-purple-500",
      text: "text-purple-400",
      hover: "hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      glow: "rgba(168,85,247,0.4)",
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-lg
        ${style.bg}
        border ${style.border}
        ${style.text}
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
          `0 0 10px ${style.glow}`,
          `0 0 20px ${style.glow}`,
          `0 0 10px ${style.glow}`,
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

