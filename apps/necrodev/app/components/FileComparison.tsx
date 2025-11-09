"use client";

import { useState } from "react";
import { Button } from "@ui";

export interface FileComparisonProps {
  originalFile: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  convertedFile: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  className?: string;
}

export function FileComparison({
  originalFile,
  convertedFile,
  className = "",
}: FileComparisonProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "overlay">("side-by-side");

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#a855f7] font-orbitron">File Comparison</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("side-by-side")}
            variant={viewMode === "side-by-side" ? "violet" : "cyan"}
            className="px-3 py-1 text-xs"
          >
            Side by Side
          </Button>
          <Button
            onClick={() => setViewMode("overlay")}
            variant={viewMode === "overlay" ? "violet" : "cyan"}
            className="px-3 py-1 text-xs"
          >
            Overlay
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Original File */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#f5f5f5]">Original</h3>
          <div className="bg-[#1a0f2e] rounded-lg p-4">
            <div className="text-xs text-[#a855f7] mb-2">{originalFile.name}</div>
            <div className="text-xs text-[#f5f5f5] mb-2">
              Type: {originalFile.type} | Size: {(originalFile.size / 1024).toFixed(2)} KB
            </div>
            {originalFile.url && (
              <div className="w-full h-48 bg-[#0a0612] rounded border border-[#a855f7]/20 flex items-center justify-center">
                <span className="text-xs text-[#a855f7]">Preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Converted File */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#f5f5f5]">Converted</h3>
          <div className="bg-[#1a0f2e] rounded-lg p-4">
            <div className="text-xs text-[#00fff7] mb-2">{convertedFile.name}</div>
            <div className="text-xs text-[#f5f5f5] mb-2">
              Type: {convertedFile.type} | Size: {(convertedFile.size / 1024).toFixed(2)} KB
            </div>
            {convertedFile.url && (
              <div className="w-full h-48 bg-[#0a0612] rounded border border-[#00fff7]/20 flex items-center justify-center">
                <span className="text-xs text-[#00fff7]">Preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Stats */}
      <div className="mt-4 pt-4 border-t border-[#a855f7]/20">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#a855f7]">Size Change:</span>
            <span className="text-[#f5f5f5] ml-2">
              {((convertedFile.size - originalFile.size) / originalFile.size * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-[#a855f7]">Original Size:</span>
            <span className="text-[#f5f5f5] ml-2">{(originalFile.size / 1024).toFixed(2)} KB</span>
          </div>
          <div>
            <span className="text-[#a855f7]">Converted Size:</span>
            <span className="text-[#f5f5f5] ml-2">{(convertedFile.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

