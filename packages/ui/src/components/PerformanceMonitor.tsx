"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface PerformanceMonitorProps {
  metrics: {
    fps: number;
    frameTime: number;
    memoryUsage: number;
    renderTime: number;
  };
  stats?: {
    avgFPS: number;
    minFPS: number;
    maxFPS: number;
    avgFrameTime: number;
    avgRenderTime: number;
    avgMemoryUsage: number;
  };
  className?: string;
}

export function PerformanceMonitor({ metrics, stats, className = "" }: PerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatMemory = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return "#00fff7"; // Good
    if (fps >= 30) return "#a855f7"; // Acceptable
    return "#ff006e"; // Poor
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron">Performance</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#a855f7] hover:text-[#00fff7] transition-colors"
          >
            {isExpanded ? "−" : "+"}
          </button>
        </div>

        <div className="space-y-2">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f5f5f5]">FPS</span>
            <span
              className="text-sm font-mono font-bold"
              style={{ color: getFPSColor(metrics.fps) }}
            >
              {metrics.fps.toFixed(1)}
            </span>
          </div>

          {/* Frame Time */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f5f5f5]">Frame Time</span>
            <span className="text-sm font-mono text-[#f5f5f5]">
              {metrics.frameTime.toFixed(2)} ms
            </span>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f5f5f5]">Render Time</span>
            <span className="text-sm font-mono text-[#f5f5f5]">
              {metrics.renderTime.toFixed(2)} ms
            </span>
          </div>

          {/* Memory Usage */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f5f5f5]">Memory</span>
            <span className="text-sm font-mono text-[#f5f5f5]">
              {formatMemory(metrics.memoryUsage)}
            </span>
          </div>

          {/* Expanded Stats */}
          {isExpanded && stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-[#a855f7]/20 space-y-2"
            >
              <div className="text-xs text-[#a855f7] font-semibold mb-2">Statistics</div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f5f5f5]">Avg FPS</span>
                <span className="text-sm font-mono text-[#f5f5f5]">
                  {stats.avgFPS.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f5f5f5]">Min FPS</span>
                <span className="text-sm font-mono text-[#ff006e]">
                  {stats.minFPS.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f5f5f5]">Max FPS</span>
                <span className="text-sm font-mono text-[#00fff7]">
                  {stats.maxFPS.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f5f5f5]">Avg Frame Time</span>
                <span className="text-sm font-mono text-[#f5f5f5]">
                  {stats.avgFrameTime.toFixed(2)} ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f5f5f5]">Avg Render Time</span>
                <span className="text-sm font-mono text-[#f5f5f5]">
                  {stats.avgRenderTime.toFixed(2)} ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f5f5f5]">Avg Memory</span>
                <span className="text-sm font-mono text-[#f5f5f5]">
                  {formatMemory(stats.avgMemoryUsage)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

