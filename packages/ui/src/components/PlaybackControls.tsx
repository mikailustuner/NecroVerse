"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (frame: number) => void;
  onNextFrame: () => void;
  onPreviousFrame: () => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

export function PlaybackControls({
  isPlaying,
  currentFrame,
  totalFrames,
  playbackSpeed,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onNextFrame,
  onPreviousFrame,
  onSpeedChange,
  className = "",
}: PlaybackControlsProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(currentFrame);

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setScrubValue(currentFrame);
  };

  const handleScrubChange = (value: number) => {
    setScrubValue(value);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    onSeek(scrubValue);
  };

  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className={`bg-[#0a0612] border border-[#a855f7]/30 rounded-lg p-4 ${className}`}>
      {/* Timeline Scrubber */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#f5f5f5] font-mono">
            Frame {currentFrame} / {totalFrames}
          </span>
          <span className="text-xs text-[#a855f7] font-mono">
            {((currentFrame / totalFrames) * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={1}
            max={totalFrames}
            value={isScrubbing ? scrubValue : currentFrame}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (isScrubbing) {
                handleScrubChange(value);
              } else {
                onSeek(value);
              }
            }}
            onMouseDown={handleScrubStart}
            onMouseUp={handleScrubEnd}
            onTouchStart={handleScrubStart}
            onTouchEnd={handleScrubEnd}
            className="w-full h-2 bg-[#1a0f2e] rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((isScrubbing ? scrubValue : currentFrame) / totalFrames) * 100}%, #1a0f2e ${((isScrubbing ? scrubValue : currentFrame) / totalFrames) * 100}%, #1a0f2e 100%)`,
            }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          onClick={onPreviousFrame}
          variant="secondary"
          className="px-3 py-2"
          title="Previous Frame"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7" />
          </svg>
        </Button>

        {isPlaying ? (
          <Button
            onClick={onPause}
            variant="primary"
            className="px-4 py-2"
            title="Pause"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </Button>
        ) : (
          <Button
            onClick={onPlay}
            variant="primary"
            className="px-4 py-2"
            title="Play"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Button>
        )}

        <Button
          onClick={onStop}
          variant="secondary"
          className="px-3 py-2"
          title="Stop"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </Button>

        <Button
          onClick={onNextFrame}
          variant="secondary"
          className="px-3 py-2"
          title="Next Frame"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#f5f5f5]">Speed</span>
        <div className="flex items-center gap-1">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                playbackSpeed === speed
                  ? "bg-[#a855f7] text-white"
                  : "bg-[#1a0f2e] text-[#f5f5f5] hover:bg-[#2a1f3e]"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

