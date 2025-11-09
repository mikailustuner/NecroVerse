"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";

export interface VisualControlsProps {
  onScreenshot?: () => void;
  onCRTToggle?: (enabled: boolean) => void;
  onPixelPerfectToggle?: (enabled: boolean) => void;
  onZoomChange?: (zoom: number) => void;
  className?: string;
}

export function VisualControls({
  onScreenshot,
  onCRTToggle,
  onPixelPerfectToggle,
  onZoomChange,
  className = "",
}: VisualControlsProps) {
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [pixelPerfect, setPixelPerfect] = useState(false);
  const [zoom, setZoom] = useState(1.0);

  const handleCRTToggle = () => {
    const newValue = !crtEnabled;
    setCrtEnabled(newValue);
    onCRTToggle?.(newValue);
  };

  const handlePixelPerfectToggle = () => {
    const newValue = !pixelPerfect;
    setPixelPerfect(newValue);
    onPixelPerfectToggle?.(newValue);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.25, 4.0);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.25, 0.25);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomReset = () => {
    setZoom(1.0);
    onZoomChange?.(1.0);
  };

  const handleScreenshot = () => {
    onScreenshot?.();
  };

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-[#a855f7] font-orbitron mb-4">Visual Controls</h3>

      <div className="space-y-4">
        {/* CRT Scanline Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#f5f5f5]">CRT Scanlines</span>
          <button
            onClick={handleCRTToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              crtEnabled ? "bg-[#a855f7]" : "bg-[#1a0f2e]"
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: crtEnabled ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Pixel Perfect Mode */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#f5f5f5]">Pixel Perfect</span>
          <button
            onClick={handlePixelPerfectToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              pixelPerfect ? "bg-[#a855f7]" : "bg-[#1a0f2e]"
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: pixelPerfect ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#f5f5f5]">Zoom</span>
            <span className="text-xs font-mono text-[#a855f7]">{(zoom * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleZoomOut}
              variant="secondary"
              className="px-3 py-1 text-xs"
              title="Zoom Out"
            >
              −
            </Button>
            <Button
              onClick={handleZoomReset}
              variant="secondary"
              className="px-3 py-1 text-xs flex-1"
              title="Reset Zoom"
            >
              Reset
            </Button>
            <Button
              onClick={handleZoomIn}
              variant="secondary"
              className="px-3 py-1 text-xs"
              title="Zoom In"
            >
              +
            </Button>
          </div>
        </div>

        {/* Screenshot */}
        <Button
          onClick={handleScreenshot}
          variant="primary"
          className="w-full py-2"
          title="Take Screenshot"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Screenshot
        </Button>
      </div>
    </div>
  );
}

