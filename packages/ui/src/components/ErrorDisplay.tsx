"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className = "" }: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#ff006e]/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#ff006e]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-[#ff006e] mb-2 text-center font-orbitron">
          Runtime Error
        </h2>
        <p className="text-[#f5f5f5] mb-6 text-center">{errorMessage}</p>

        {/* Actions */}
        <div className="flex gap-4 justify-center mb-4">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              className="px-6 py-2"
            >
              Retry
            </Button>
          )}
          {errorStack && (
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="secondary"
              className="px-6 py-2"
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          )}
        </div>

        {/* Technical Details */}
        <AnimatePresence>
          {showDetails && errorStack && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-4"
            >
              <div className="bg-[#0a0612] border border-[#ff006e]/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#ff006e] mb-2 font-orbitron">
                  Technical Details
                </h3>
                <pre className="text-xs text-[#f5f5f5] font-mono overflow-auto max-h-64">
                  {errorStack}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

